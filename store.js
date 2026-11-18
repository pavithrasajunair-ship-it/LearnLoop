'use strict';
/* LearnLoop store: one student profile + one learning history shared by every module.
   Mastery is derived ONLY from assessed answers (questions answered, code that was run) - never from reading a lesson. */
const LL = (() => {
  const KEY = 'learnloop.v1';
  const DAY = 86400000;
  const FREE_DAILY = 15; // free plan: answered questions per day (soft limit: enforced in the browser only)
  // The three plans. Prices are in rupees per month. `ai` is the daily AI tutor message allowance that applies once the
  // AI backend is connected (nothing uses it yet). Nobody can buy a plan yet: see the Plans page.
  const PLANS = {
    free: {label: 'Free', price: 0, questions: FREE_DAILY, ai: 5},
    premium: {label: 'Premium', price: 99, questions: Infinity, ai: 30},
    pro: {label: 'Pro', price: 199, questions: Infinity, ai: 150},
  };
  const planOf = () => (Object.prototype.hasOwnProperty.call(PLANS, state.plan) ? PLANS[state.plan] : PLANS.free); // an unknown plan name always means Free
  const fresh = () => ({v: 1, plan: 'free', profile: null, diagnosticDone: false, attempts: [], views: [], sessions: [], days: {}, quick: null, prefs: {goal: 5, theme: 'auto'}});
  let state = fresh();
  let now = () => Date.now();
  let mem = null; // fallback when localStorage is unavailable

  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) state = Object.assign(fresh(), s, {prefs: Object.assign(fresh().prefs, s.prefs || {})}); } }
    catch (e) { if (mem) state = mem; }
    return state;
  }
  function save() {
    mem = state;
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
  }
  const reset = () => { state = fresh(); try { localStorage.removeItem(KEY); } catch (e) {} };
  const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

  /* ---- active days (local time) ----
     iso = zero-padded YYYY-MM-DD in the learner's LOCAL time zone. state.days maps iso -> answers that day. It is kept
     separately so streaks survive the 3000-attempt cap, and it is merged with attempts so data saved by older versions still counts. */
  const pad = n => (n < 10 ? '0' : '') + n;
  const isoDay = t => { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const parseIso = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  // calendar-day arithmetic via the Date constructor, so daylight-saving changes never skip or repeat a day
  const shiftIso = (iso, n) => { const d = parseIso(iso); return isoDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n).getTime()); };
  function dayCounts() {
    const out = {};
    if (state.days && typeof state.days === 'object') Object.keys(state.days).forEach(k => { if (parseIso(k) && state.days[k] > 0) out[k] = +state.days[k]; });
    const fromAttempts = {};
    (state.attempts || []).forEach(a => { const k = isoDay(a.t); fromAttempts[k] = (fromAttempts[k] || 0) + 1; });
    Object.keys(fromAttempts).forEach(k => { out[k] = Math.max(out[k] || 0, fromAttempts[k]); });
    return out;
  }
  function streakInfo() {
    const counts = dayCounts(), days = Object.keys(counts).sort(), today = isoDay(now());
    let best = 0, run = 0, prev = null;
    days.forEach(d => { run = prev && shiftIso(prev, 1) === d ? run + 1 : 1; if (run > best) best = run; prev = d; });
    let cur = 0, k = counts[today] ? today : shiftIso(today, -1); // today not done yet does not break yesterday's streak
    while (counts[k]) { cur++; k = shiftIso(k, -1); }
    return {current: cur, best: Math.max(best, cur), todayDone: !!counts[today], totalDays: days.length};
  }
  // one month as a calendar grid, Monday first. month is 0-11.
  function monthGrid(year, month) {
    const counts = dayCounts(), today = isoDay(now()), first = new Date(year, month, 1), n = new Date(year, month + 1, 0).getDate();
    const cells = []; for (let i = 0; i < (first.getDay() + 6) % 7; i++) cells.push(null);
    for (let d = 1; d <= n; d++) { const iso = year + '-' + pad(month + 1) + '-' + pad(d); cells.push({iso, day: d, count: counts[iso] || 0, active: !!counts[iso], today: iso === today, future: iso > today}); }
    return {year: first.getFullYear(), month: first.getMonth(), cells, activeDays: cells.filter(c => c && c.active).length};
  }
  /* ---- weak-topic ranking ----
     Accuracy is taken over the last 10 answers on the concept and smoothed ((right + 1) / (n + 2)) so one lucky or unlucky answer does not decide the ranking.
     A concept is weak when its smoothed accuracy is under 75% or it still has an open misconception. Weakest first; ties go to the concept with more evidence. */
  function weakTopics(ids, max) {
    const out = [];
    ids.forEach(id => {
      const a = state.attempts.filter(x => x.concept === id); if (!a.length) return;
      const recent = a.slice(-10), r = recent.filter(x => x.ok).length, open = openMisconceptions(id);
      const score = (r + 1) / (recent.length + 2);
      if (score < 0.75 || open.length) out.push({id, n: a.length, c: a.filter(x => x.ok).length, acc: a.filter(x => x.ok).length / a.length, score, open, last: a[a.length - 1].t});
    });
    out.sort((x, y) => x.score - y.score || y.n - x.n || y.last - x.last);
    return out.slice(0, max || 5);
  }
  function accuracy(id) { const a = state.attempts.filter(x => x.concept === id), c = a.filter(x => x.ok).length; return {n: a.length, c, acc: a.length ? c / a.length : null}; }

  function setProfile(name, goal) {
    name = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    if (!name) return false;
    state.profile = {name, goal: String(goal || '').slice(0, 40), created: now()};
    save(); return true;
  }
  // kind: check | predict | bug | fix | diagnostic ; src: tutor | detective | quick | diagnostic
  function record(a) {
    state.attempts.push({t: now(), concept: a.concept, kind: a.kind, ok: !!a.ok, m: a.m || null, src: a.src || 'detective'});
    if (!state.days || typeof state.days !== 'object') state.days = {};
    const k = isoDay(now()); state.days[k] = (state.days[k] || 0) + 1;
    if (state.attempts.length > 3000) state.attempts.splice(0, state.attempts.length - 3000);
    save();
  }
  function view(concept, style) { state.views.push({t: now(), concept, style}); if (state.views.length > 500) state.views.shift(); save(); }

  function stats(id) {
    const a = state.attempts.filter(x => x.concept === id);
    const n = a.length, c = a.filter(x => x.ok).length;
    const recent = a.slice(-5), rc = recent.filter(x => x.ok).length;
    let level = 'untested';
    if (n) {
      const acc = rc / recent.length;
      if (n >= 4 && acc >= 0.8) level = 'solid';
      else if (acc < 0.5) level = 'weak';
      else level = 'developing';
    }
    return {n, c, level, last: n ? a[n - 1].t : 0, acc: n ? rc / recent.length : null};
  }
  // misconceptions seen on a concept that have not yet been followed by two correct answers on that concept
  function openMisconceptions(id) {
    const a = state.attempts.filter(x => x.concept === id), out = {};
    a.forEach((x, i) => {
      if (!x.ok && x.m) {
        const after = a.slice(i + 1).filter(y => y.ok).length;
        if (after < 2) out[x.m] = (out[x.m] || 0) + 1; else delete out[x.m];
      }
    });
    return Object.keys(out).map(m => ({m, count: out[m]}));
  }
  const viewedStyles = id => Array.from(new Set(state.views.filter(v => v.concept === id).map(v => v.style)));
  // if the student is struggling with a concept, suggest a style they have not yet been shown
  function recommendStyle(id, order) {
    const st = stats(id), struggling = st.level === 'weak' || openMisconceptions(id).length > 0;
    const seen = viewedStyles(id);
    if (!struggling || !seen.length) return {style: seen.length ? seen[seen.length - 1] : order[0], changed: false};
    const next = order.find(s => !seen.includes(s));
    return next ? {style: next, changed: true} : {style: order[(order.indexOf(seen[seen.length - 1]) + 1) % order.length], changed: true};
  }
  function todayCount() { const k = dayKey(now()); return state.attempts.filter(a => dayKey(a.t) === k).length; }
  const limit = () => planOf().questions;
  const remaining = () => Math.max(0, limit() - todayCount());
  const atLimit = () => remaining() === 0;
  const streak = () => streakInfo().current;
  const studiedRecently = () => {
    const seen = new Map();
    for (let i = state.attempts.length - 1; i >= 0; i--) { const a = state.attempts[i]; if (!seen.has(a.concept)) seen.set(a.concept, a.t); }
    for (let i = state.views.length - 1; i >= 0; i--) { const v = state.views[i]; if (!seen.has(v.concept)) seen.set(v.concept, v.t); }
    return Array.from(seen, ([concept, t]) => ({concept, t})).sort((x, y) => y.t - x.t);
  };
  function history(limit) {
    const ev = state.attempts.map(a => Object.assign({type: 'attempt'}, a))
      .concat(state.views.map(v => Object.assign({type: 'lesson'}, v)))
      .concat(state.sessions.map(s => Object.assign({type: 'session'}, s)));
    return ev.sort((a, b) => b.t - a.t).slice(0, limit || 50);
  }
  function addSession(s) { state.sessions.push(Object.assign({t: now()}, s)); save(); }
  return {
    get state() { return state; }, load, save, reset, setProfile, record, view, stats, openMisconceptions, viewedStyles,
    recommendStyle, todayCount, limit, remaining, atLimit, FREE_DAILY, PLANS, planOf, streak, streakInfo, monthGrid, weakTopics, accuracy, studiedRecently, history, addSession, dayKey, isoDay, shiftIso,
    _setNow(f) { now = f; }, _fresh: fresh, _set(s) { state = s; },
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = LL;
