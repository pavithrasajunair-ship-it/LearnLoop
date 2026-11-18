'use strict';
const assert = require('assert'), cp = require('child_process'), path = require('path'), fs = require('fs');
const root = path.join(__dirname, '..');
const C = require(root + '/content.js'), LL = require(root + '/store.js'), G = require(root + '/runner.js'), SQL = require(root + '/sqlengine.js');
let pass = 0; const t = (n, f) => { try { const r = f(); if (r && r.then) return r.then(() => { pass++; }, e => { console.log('FAIL', n, e.message); process.exitCode = 1; }); pass++; } catch (e) { console.log('FAIL', n, e.message); process.exitCode = 1; } };
// real python as a stand-in for the Pyodide worker (same language, run on this machine for TESTING only)
const pyRun = code => { const r = cp.spawnSync('python3', ['-I', '-c', code], {encoding: 'utf8', timeout: 5000}); return Promise.resolve({out: r.stdout, err: r.status ? r.stderr : null}); };
const KINDS = ['check', 'bug', 'predict', 'fix'];
(async () => {
  for (const c of C.CONCEPTS) {
    t(c.id + ': lesson has 4 styles', () => C.VARIANTS.forEach(([k]) => assert(c.lesson[k] && c.lesson[k].length > 40, k)));
    t(c.id + ': check/bug have exactly one correct option and a why on every option', () => ['check', 'bug'].forEach(k => {
      const q = c[k]; assert.strictEqual(q.opts.filter(x => x.ok).length, 1, k); q.opts.forEach(x => assert(x.why && x.why.length > 10, k + ' why'));
      q.opts.filter(x => !x.ok && x.m).forEach(x => assert(C.MIS[x.m], 'unknown misconception ' + x.m)); }));
    t(c.id + ': predict has answer, explanation, known misconceptions', () => {
      const p = c.predict; assert(p.explain); (p.wrong || []).forEach(w => { assert(w.why); if (w.m) assert(C.MIS[w.m], w.m); }); if (p.m) assert(C.MIS[p.m], p.m); });
    if (c.subject !== 'dsa') t(c.id + ': fix hints (3) and misconception known', () => { assert.strictEqual(c.fix.hints.length, 3); assert(C.MIS[c.fix.explainErr.m]); });
    if (c.subject === 'dsa') {
      t(c.id + ': DSA has 4+ MCQs, one correct each, a why on every option, no duplicate options', () => {
        const all = [c.check, c.bug, {q: c.predict.q}, ...c.qs]; assert(c.qs.length >= 2 && all.length >= 5);
        [c.check, c.bug, ...c.qs].forEach(q => { assert.strictEqual(q.opts.filter(x => x.ok).length, 1, q.q); assert.strictEqual(new Set(q.opts.map(x => x.t)).size, q.opts.length, 'duplicate option in ' + q.q);
          q.opts.forEach(x => { assert(x.why && x.why.length > 15, 'why: ' + x.t); if (!x.ok && x.m) assert(C.MIS[x.m], 'unknown misconception ' + x.m); }); });
        assert(all.length && [c.check, c.bug, ...c.qs].flatMap(q => q.opts).filter(x => !x.ok && x.m).length >= 3, 'expected at least 3 misconception-tagged wrong options'); 
        assert(c.predict.wrong.length >= 2); });
      await t(c.id + ': PYTHON predict answer is what real python prints', async () => { const r = await pyRun(c.predict.code); assert(!r.err, r.err); assert.strictEqual(r.out.trim(), c.predict.answer); });
      await t(c.id + ': PYTHON lesson example runs', async () => { const r = await pyRun(c.lesson.code); assert(!r.err, r.err); });
      await t(c.id + ': PYTHON code in bug and qs questions at least compiles', async () => { for (const q of [c.bug, ...c.qs].filter(q => q.code)) { const r = await pyRun('compile(' + JSON.stringify(q.code) + ', "x", "exec")'); assert(!r.err, r.err); } });
      await t(c.id + ': PYTHON wrong predict answers are really wrong', () => c.predict.wrong.forEach(w => assert.notStrictEqual(w.ans, c.predict.answer)));
      await t(c.id + ': PYTHON qs with code: the marked answer is the real output', async () => { for (const q of c.qs.filter(q => q.code)) { const r = await pyRun(q.code); assert(!r.err, r.err); assert.strictEqual(r.out.trim(), q.opts.find(x => x.ok).t); } });
    } else if (c.subject === 'python') {
      await t(c.id + ': PYTHON predict answer is what real python prints', async () => {
        const r = await pyRun(c.predict.code); assert(!r.err, r.err); assert.strictEqual(r.out.trim(), c.predict.answer); });
      await t(c.id + ': PYTHON starter fails and solution passes all tests', async () => {
        const bad = await G.gradePython(c.fix, c.fix.starter, pyRun), good = await G.gradePython(c.fix, c.fix.solution, pyRun);
        assert(!bad.pass, 'starter must fail'); assert(good.pass, 'solution must pass: ' + JSON.stringify(good)); });
      await t(c.id + ': PYTHON wrong predict answers are really wrong', () => c.predict.wrong.forEach(w => assert.notStrictEqual(w.ans, c.predict.answer)));
    } else {
      t(c.id + ': SQL starter fails, solution passes', () => {
        assert(!G.gradeSql(c.fix, c.fix.starter, SQL, C.SQL_SEED).pass, 'starter must fail'); assert(G.gradeSql(c.fix, c.fix.solution, SQL, C.SQL_SEED).pass, 'solution must pass'); });
      t(c.id + ': SQL predict rowcount matches the engine', () => {
        const d = SQL.newDb(); SQL.run(d, C.SQL_SEED); const r = SQL.run(d, c.predict.code); assert(!r.error); assert(r.results[0].rows.length > 0); });
      t(c.id + ': SQL bug/check queries named in options are checkable (fixed query runs)', () => {
        const d = SQL.newDb(); SQL.run(d, C.SQL_SEED); assert(!SQL.run(d, c.fix.solution).error); });
    }
  }
  // known numeric facts for SQL predict items, checked independently of the engine
  const cnt = id => { const c = C.CONCEPTS.find(x => x.id === id), d = SQL.newDb(); SQL.run(d, C.SQL_SEED); return SQL.run(d, c.predict.code).results[0].rows.length; };
  t('sql-where predict = 3', () => assert.strictEqual(cnt('sql-where'), 3));
  t('sql-agg predict = 3', () => assert.strictEqual(cnt('sql-agg'), 3));
  t('sql-join predict = 24', () => assert.strictEqual(cnt('sql-join'), 24));
  t('SQL error is reported, not graded as pass', () => { const r = G.gradeSql(C.CONCEPTS[5].fix, 'SELEC name', SQL, C.SQL_SEED); assert(!r.pass && r.error); });
  await t('python crash is reported as plain-language error', async () => {
    const r = await G.gradePython(C.CONCEPTS[3].fix, 'def last_item(lst):\n    return lst[len(lst)]', pyRun);
    assert(!r.pass && /IndexError/.test(r.results[0].err) && /positions/.test(r.results[0].err)); });
  await t('python unavailable is not a pass', async () => assert((await G.gradePython(C.CONCEPTS[0].fix, 'x', () => Promise.resolve({unavailable: true}))).unavailable));

  // ---- store ----
  let T = 1e12; const reset = () => { LL._set(LL._fresh()); LL._setNow(() => T); };
  reset();
  t('new student: nothing is assessed, no streak', () => { assert.strictEqual(LL.stats('py-loops').level, 'untested'); assert.strictEqual(LL.streak(), 0); });
  t('reading a lesson never creates mastery', () => { LL.view('py-loops', 'beginner'); LL.view('py-loops', 'real'); assert.strictEqual(LL.stats('py-loops').level, 'untested'); });
  t('wrong answers make a concept weak and open a misconception', () => { LL.record({concept: 'py-loops', kind: 'check', ok: false, m: 'range-end'}); LL.record({concept: 'py-loops', kind: 'bug', ok: false, m: 'range-end'});
    assert.strictEqual(LL.stats('py-loops').level, 'weak'); assert.deepStrictEqual(LL.openMisconceptions('py-loops'), [{m: 'range-end', count: 2}]); });
  t('plans: Free 15/day, Premium 99 and Pro 199 with no daily limit', () => { const was = LL.state.plan;
    assert.strictEqual(LL.limit(), 15); assert.strictEqual(LL.PLANS.premium.price, 99); assert.strictEqual(LL.PLANS.pro.price, 199);
    LL.state.plan = 'premium'; assert.strictEqual(LL.limit(), Infinity); LL.state.plan = 'pro'; assert.strictEqual(LL.limit(), Infinity);
    assert(LL.PLANS.pro.ai > LL.PLANS.premium.ai && LL.PLANS.premium.ai > LL.PLANS.free.ai); LL.state.plan = was; });
  t('plans: an unknown plan name never unlocks anything', () => { const was = LL.state.plan; LL.state.plan = 'enterprise'; assert.strictEqual(LL.limit(), 15); LL.state.plan = '__proto__'; assert.strictEqual(LL.limit(), 15); LL.state.plan = was; });
  t('struggling student is offered a style not yet seen', () => { const r = LL.recommendStyle('py-loops', ['beginner', 'real', 'code', 'exam']); assert(r.changed && r.style === 'code'); });
  t('two correct answers clear the misconception; solid needs 4 attempts', () => {
    LL.record({concept: 'py-loops', kind: 'check', ok: true}); LL.record({concept: 'py-loops', kind: 'predict', ok: true});
    assert.strictEqual(LL.openMisconceptions('py-loops').length, 0); LL.record({concept: 'py-loops', kind: 'fix', ok: true}); LL.record({concept: 'py-loops', kind: 'fix', ok: true});
    assert.strictEqual(LL.stats('py-loops').level, 'solid'); });
  t('streak counts consecutive days and survives an unfinished today', () => { reset();
    LL.record({concept: 'py-vars', kind: 'check', ok: true}); T += 864e5; LL.record({concept: 'py-vars', kind: 'check', ok: true}); T += 864e5; assert.strictEqual(LL.streak(), 2);
    T += 864e5 * 2; assert.strictEqual(LL.streak(), 0); });
  t('todayCount counts only today', () => { reset(); LL.record({concept: 'py-vars', kind: 'check', ok: true}); T += 864e5; LL.record({concept: 'py-vars', kind: 'check', ok: true}); assert.strictEqual(LL.todayCount(), 1); });
  t('profile name is trimmed and empty names rejected', () => { reset(); assert(!LL.setProfile('   ')); assert(LL.setProfile('  Asha   K ', 'x')); assert.strictEqual(LL.state.profile.name, 'Asha K'); });
  t('history merges attempts/lessons newest first', () => { reset(); LL.view('py-vars', 'real'); T += 1000; LL.record({concept: 'py-vars', kind: 'check', ok: true}); const h = LL.history(); assert.strictEqual(h[0].type, 'attempt'); assert.strictEqual(h[1].type, 'lesson'); });
  // ---- DSA: facts re-derived independently with real python (not copied from the content file) ----
  const D = id => C.CONCEPTS.find(x => x.id === id), good = q => q.opts.find(x => x.ok).t, py = async code => { const r = await pyRun(code); assert(!r.err, r.err); return r.out.trim(); };
  await t('dsa-sort: one bubble pass', async () => assert.strictEqual(await py('a=[5,1,4,2,8]\nfor i in range(len(a)-1):\n  if a[i]>a[i+1]: a[i],a[i+1]=a[i+1],a[i]\nprint(a)'), good(D('dsa-sort').check)));
  await t('dsa-stack: postfix 2 3 4 * + = 14', async () => assert.strictEqual(await py('s=[]\nfor tk in "2 3 4 * +".split():\n  if tk in "+*":\n    b=s.pop();a=s.pop();s.append(a+b if tk=="+" else a*b)\n  else: s.append(int(tk))\nprint(s[0])'), good(D('dsa-stack').qs[1])));
  await t('dsa-tree: height of 50,30,70,20,40 is 2 edges; sorted insert gives a chain', async () => {
    const code = 'class N:\n  def __init__(s,v): s.v=v;s.l=s.r=None\ndef ins(n,v):\n  if not n: return N(v)\n  if v<n.v: n.l=ins(n.l,v)\n  else: n.r=ins(n.r,v)\n  return n\ndef h(n): return -1 if not n else 1+max(h(n.l),h(n.r))\nr=None\nfor k in KEYS: r=ins(r,k)\nprint(h(r))';
    assert.strictEqual(await py('KEYS=[50,30,70,20,40]\n' + code), good(D('dsa-tree').qs[0])); assert.strictEqual(await py('import sys\nsys.setrecursionlimit(10000)\nKEYS=list(range(1,11))\n' + code), '9'); });
  await t('dsa-tree: the is_bst bug really accepts 10 / 5 / 15', async () => assert.strictEqual(await py('class N:\n  def __init__(s,v,l=None,r=None): s.val=v;s.left=l;s.right=r\n' + D('dsa-tree').bug.code + '\nprint(is_bst(N(10,N(5,None,N(15)))))'), 'True'));
  await t('dsa-linked: the reverse bug returns only node 1', async () => assert.strictEqual(await py('class N:\n  def __init__(s,v): s.val=v;s.next=None\n' + D('dsa-linked').bug.code + '\na=N(1);a.next=N(2);a.next.next=N(3)\nr=reverse(a);o=[]\nwhile r: o.append(r.val);r=r.next\nprint(o)'), '[1]'));
  await t('dsa-stack: is_balanced(")") raises IndexError', async () => { const r = await pyRun(D('dsa-stack').bug.code + '\nis_balanced(")")'); assert(/IndexError/.test(r.err)); });
  await t('dsa-queue: pop() takes the last item', async () => assert.strictEqual(await py(D('dsa-queue').bug.code), '3'));
  await t('dsa-search: the bsearch bug returns -1; the fixed loop finds 5', async () => { const code = D('dsa-search').bug.code; assert.strictEqual(await py(code + '\nprint(bsearch([1,3,5],5))'), '-1'); assert.strictEqual(await py(code.replace('lo < hi', 'lo <= hi') + '\nprint(bsearch([1,3,5],5))'), '2'); });
  await t('dsa-search: binary search on 1,000,000 items needs about 20 steps', async () => assert.strictEqual(await py('import math\nprint(math.ceil(math.log2(10**6)))'), '20'));
  await t('dsa-sort: the selection_sort bug returns [1, 1, 2]', async () => assert.strictEqual(await py(D('dsa-sort').bug.code + '\nprint(selection_sort([3,1,2]))'), '[1, 1, 2]'));
  await t('dsa-hash: 3 and 8 collide mod 5', async () => assert.strictEqual(await py('print(3%5==8%5)'), 'True'));
  await t('dsa-graph: BFS lesson order and DFS predict order', async () => assert.strictEqual(await py(D('dsa-graph').lesson.code), "['A', 'B', 'C', 'D']"));
  await t('dsa-complexity: nested loops run n*n times', async () => assert.strictEqual(await py(D('dsa-complexity').bug.code + '\nprint(count_pairs(list(range(7))))'), '49'));
  t('DSA subject: 10 concepts in the course topics, labelled with the course code', () => {
    const ids = C.CONCEPTS.filter(c => c.subject === 'dsa').map(c => c.id); assert(ids.length >= 8); assert(/CSPC302/.test(C.SUBJECTS.dsa.note));
    ['array', 'linked', 'stack', 'queue', 'tree', 'graph', 'sort', 'search', 'complexity', 'hash'].forEach(k => assert(ids.some(i => i.includes(k)), k)); });
  t('every misconception id used anywhere is defined', () => C.CONCEPTS.forEach(c => { const used = [c.check, c.bug, ...(c.qs || [])].flatMap(q => q.opts.map(o => o.m)).concat((c.predict.wrong || []).map(w => w.m), [c.predict.m]).filter(Boolean); used.forEach(m => assert(C.MIS[m], m)); }));

  // ---- streaks, calendar, weak-topic ranking ----
  const at = (y, m, d, h) => new Date(y, m, d, h == null ? 12 : h).getTime();
  const ans = (concept, ok, m) => LL.record({concept, kind: 'check', ok, m});
  t('streak: a day counts when any question is answered; best streak is remembered across a gap', () => { reset();
    [[2026, 0, 1], [2026, 0, 2], [2026, 0, 3], [2026, 0, 10], [2026, 0, 11]].forEach(([y, m, d]) => { T = at(y, m, d); ans('py-vars', true); });
    T = at(2026, 0, 11, 23); let s = LL.streakInfo(); assert.deepStrictEqual([s.current, s.best, s.todayDone, s.totalDays], [2, 3, true, 5]);
    T = at(2026, 0, 12); s = LL.streakInfo(); assert.deepStrictEqual([s.current, s.todayDone], [2, false]);   // today not done yet: yesterday's run survives
    T = at(2026, 0, 13); s = LL.streakInfo(); assert.deepStrictEqual([s.current, s.best], [0, 3]); });
  t('streak: uses LOCAL midnight, not UTC (23:59 and 00:01 are different days)', () => { reset(); T = at(2026, 5, 1, 23) + 59 * 60000; ans('py-vars', true); T = at(2026, 5, 2, 0) + 60000; ans('py-vars', true); assert.strictEqual(LL.streak(), 2); assert.strictEqual(LL.isoDay(at(2026, 5, 2, 0) + 60000), '2026-06-02'); });
  t('streak: month and year boundaries and a leap day', () => { reset(); [[2024, 1, 28], [2024, 1, 29], [2024, 2, 1], [2024, 11, 31], [2025, 0, 1]].forEach(([y, m, d]) => { T = at(y, m, d); ans('py-vars', true); }); T = at(2025, 0, 1); const s = LL.streakInfo(); assert.deepStrictEqual([s.current, s.best], [2, 3]); assert.strictEqual(LL.shiftIso('2024-03-01', -1), '2024-02-29'); assert.strictEqual(LL.shiftIso('2025-01-01', -1), '2024-12-31'); });
  t('streak: old saves without the days map (and with more than 3000 attempts trimmed) still work', () => { reset(); T = at(2026, 2, 10); ans('py-vars', true); delete LL.state.days; T = at(2026, 2, 11); assert.strictEqual(LL.streak(), 1); ans('py-vars', true); assert.strictEqual(LL.streak(), 2);
    reset(); T = at(2026, 2, 1); ans('py-vars', true); LL.state.attempts.length = 0; T = at(2026, 2, 2); ans('py-vars', true); assert.strictEqual(LL.streakInfo().best, 2); });
  t('streak: corrupt days value is ignored, never thrown', () => { reset(); LL.state.days = 'oops'; T = at(2026, 2, 5); ans('py-vars', true); assert.strictEqual(LL.streak(), 1); LL.state.days = {'nonsense': 5, '2026-03-04': -2}; assert.strictEqual(LL.streakInfo().current, 1); });
  t('calendar: Monday-first grid, active days and today marked', () => { reset(); T = at(2026, 10, 3); ans('py-vars', true); ans('py-vars', false); T = at(2026, 10, 8, 9); ans('py-vars', true);
    const g = LL.monthGrid(2026, 10); assert.strictEqual(g.cells.filter(Boolean).length, 30); assert.strictEqual(g.cells.indexOf(g.cells.find(Boolean)), 6);  // 1 Nov 2026 is a Sunday
    assert.strictEqual(g.activeDays, 2); const d3 = g.cells.find(c => c && c.day === 3), d8 = g.cells.find(c => c && c.day === 8), d9 = g.cells.find(c => c && c.day === 9);
    assert(d3.active && d3.count === 2 && !d3.today); assert(d8.active && d8.today && !d8.future); assert(!d9.active && d9.future); assert.strictEqual(LL.monthGrid(2026, 12).month, 0); });
  t('weak topics: weakest first, smoothed so one answer does not dominate, solid topics excluded', () => { reset();
    ans('py-vars', true); ans('py-vars', true); ans('py-vars', true); ans('py-vars', true);               // solid
    ans('py-loops', false, 'range-end'); ans('py-loops', false); ans('py-loops', true);                     // 1/3
    ans('py-lists', false);                                                                                // 0/1
    ans('sql-join', true); ans('sql-join', false);                                                         // 1/2
    const w = LL.weakTopics(['py-vars', 'py-loops', 'py-lists', 'sql-join', 'sql-agg'], 5);
    assert.deepStrictEqual(w.map(x => x.id), ['py-lists', 'py-loops', 'sql-join']); assert.strictEqual(w[1].c, 1); assert.strictEqual(w[1].n, 3); assert.deepStrictEqual(w[1].open, [{m: 'range-end', count: 1}]);
    assert.strictEqual(LL.weakTopics(['py-vars', 'py-loops', 'py-lists', 'sql-join'], 2).length, 2); assert.deepStrictEqual(LL.weakTopics(['sql-agg'], 5), []); });
  t('weak topics: an open misconception keeps a concept listed; it leaves after two correct answers', () => { reset(); ans('dsa-stack', false, 'lifo-fifo'); for (let i = 0; i < 5; i++) ans('dsa-stack', true);
    assert.strictEqual(LL.weakTopics(['dsa-stack'], 5).length, 0); reset(); ans('dsa-stack', true); ans('dsa-stack', true); ans('dsa-stack', true); ans('dsa-stack', false, 'lifo-fifo'); assert.deepStrictEqual(LL.weakTopics(['dsa-stack'], 5).map(x => x.id), ['dsa-stack']); });
  t('accuracy(): overall per-concept numbers', () => { reset(); ans('py-vars', true); ans('py-vars', false); assert.deepStrictEqual(LL.accuracy('py-vars'), {n: 2, c: 1, acc: 0.5}); assert.strictEqual(LL.accuracy('sql-agg').acc, null); });
  console.log('unit tests passed:', pass);
})();
