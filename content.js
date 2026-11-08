'use strict';
/* LearnLoop content: concepts, lessons in several teaching styles, and misconception-tagged questions.
   Every wrong option explains WHY it is wrong and carries a misconception id (m), so the app can remember it. */

const MIS = {
  'str-plus': 'Thinks + adds text like numbers (it joins text)',
  'input-str': 'Forgets that input() always returns text',
  'div-vs-floor': 'Mixes up / (decimal division) and // (whole-number division)',
  'precedence': 'Ignores operator precedence (division before addition)',
  'assign-eq': 'Confuses = (assign) with == (compare)',
  'if-chain': 'Thinks separate if statements exclude each other (use elif)',
  'boundary': 'Off by one at a boundary (> vs >=)',
  'range-end': 'Thinks range() includes its end value',
  'zero-index': 'Counts list positions from 1 instead of 0',
  'append-none': 'Expects append() to return the list (it returns None)',
  'slice-end': 'Thinks a slice includes its end index',
  'return-print': 'Confuses printing a value with returning it',
  'scope-copy': 'Expects a function to change the caller\'s variable',
  'sql-quotes': 'Forgets quotes around text values in SQL',
  'sql-comma': 'Leaves out the comma between columns',
  'sql-where-agg': 'Uses an aggregate (COUNT, AVG...) inside WHERE instead of HAVING',
  'sql-group': 'Forgets GROUP BY when mixing a column with an aggregate',
  'sql-and-or': 'Mixes up AND and OR',
  'sql-cross': 'Forgets the join condition (creates every possible pairing)',
  'sql-where-having': 'Mixes up WHERE (filters rows) and HAVING (filters groups)',
  'sql-strict': 'Misreads > as ">="',
  'walk-access': 'Thinks reaching item i means walking past items 0 to i-1 (true for linked lists, not for arrays)',
  'idx-len': 'Treats the length as the last valid index (the last index is length - 1)',
  'shift-cost': 'Thinks inserting or removing at the front of an array costs O(1) (items must shift)',
  'alias-copy': 'Thinks b = a makes a separate copy of a list (both names share one list)',
  'll-order': 'Overwrites a next pointer and forgets the nodes it used to reach',
  'lifo-fifo': 'Mixes up LIFO (stack: last in, first out) and FIFO (queue: first in, first out)',
  'empty-pop': 'Forgets that pop() on an empty stack raises an error',
  'pop-end': 'Thinks list.pop() removes from the front (it removes the last item)',
  'postfix-order': 'Reads a postfix expression left to right without using a stack of operands',
  'bst-local': 'Thinks the BST rule only compares a node with its direct children (it covers the whole subtree)',
  'trav-order': 'Mixes up inorder, preorder and postorder traversal',
  'height-nodes': 'Counts nodes instead of edges when measuring tree height',
  'bst-balanced': 'Assumes every BST is balanced, so search is always O(log n)',
  'bfs-dfs': 'Mixes up BFS (queue, level by level) and DFS (stack or recursion, deep first)',
  'no-visited': 'Forgets a visited set, so a cycle is explored forever',
  'sort-early': 'Thinks a sort is finished after one pass, or before every pass has run',
  'sort-cases': 'Thinks a sort\'s best, average and worst case are the same',
  'bin-unsorted': 'Uses binary search on data that is not sorted',
  'bigo-exact': 'Treats Big-O as an exact running time instead of a growth rate',
  'loops-add': 'Adds the costs of nested loops instead of multiplying them',
  'no-collision': 'Thinks a good hash function means two keys never share a slot',
  'hash-dup': 'Thinks assigning to an existing dictionary key adds a second entry',
  'hash-sorted': 'Thinks a hash table keeps its keys sorted, so lookup is O(log n)',
  'hash-o1': 'Believes hash lookups are always O(1), ignoring collisions',
  'bin-scan': 'Thinks binary search still looks at items one by one',
  'lin-half': 'Thinks a search for a missing value can stop at the halfway point',
  'index-ll': 'Treats a linked list like an array and expects jump-by-index access',
};

const SQL_SEED = `CREATE TABLE student (roll INT PRIMARY KEY, name VARCHAR(20), marks INT, city VARCHAR(15));
INSERT INTO student VALUES (1,'Aarav',92,'Delhi'),(2,'Diya',85,'Mumbai'),(3,'Kabir',67,'Delhi'),(4,'Meera',78,'Pune'),(5,'Rohan',54,'Mumbai'),(6,'Sana',88,'Delhi');
CREATE TABLE club (roll INT, club VARCHAR(15));
INSERT INTO club VALUES (1,'Chess'),(1,'Coding'),(2,'Dance'),(4,'Chess');`;

const o = (t, why, m) => ({t, ok: false, why, m});          // wrong option
const ok = (t, why) => ({t, ok: true, why});                // right option

const CONCEPTS = [
  /* ============================ PYTHON ============================ */
  {id: 'py-vars', subject: 'python', title: 'Variables and data types', blurb: 'Names, values, and why "5" is not 5',
   lesson: {
     beginner: 'A variable is a name that points to a value. Writing age = 17 makes the name age point to 17. Every value has a type: int (whole numbers), float (decimals), str (text) and bool (True or False). The type decides what an operator does: + adds two numbers, but it joins two pieces of text.',
     real: 'Think of a variable as a labelled box. The label (the name) stays on the box, but you can swap what is inside. The type is the kind of thing inside. "5" in quotes is the digit written on paper, just text. 5 without quotes is a number you can calculate with. Paper digits can be stuck together ("5" + "3" makes "53"), but only numbers can be added.',
     code: 'x = 5          # int\ny = "5"        # str, the text \'5\'\nprint(x + 2)   # 7\nprint(y + "2") # 52  (text is joined)\nprint(type(x), type(y))',
     exam: 'Key points: Python is dynamically typed. int(), float() and str() convert between types. input() always returns a str, so convert it before doing maths. Operators: / true division (7/2 = 3.5), // floor division (7//2 = 3), % remainder (7%2 = 1), ** power.'},
   check: {q: 'What does print("5" + "3") display?', opts: [
     o('8', 'The quotes make these two pieces of text, not numbers. + on text joins them; it does not add.', 'str-plus'),
     ok('53', 'Both values are strings, so + joins them: "5" followed by "3".'),
     o('"5" + "3"', 'print shows the value of the expression, not the code you wrote.'),
     o('An error', 'Adding two strings is allowed in Python. Only mixing a string and a number causes an error.')]},
   bug: {lvl: 1, q: 'This program should let a user who is 18 or older vote. What goes wrong?',
     code: 'age = input("Enter your age: ")\nif age >= 18:\n    print("You can vote")', opts: [
     o('>= cannot be used in an if statement', '>= is a normal comparison operator and works fine in if.', null),
     ok('input() returns text, so Python tries to compare a string with a number and raises a TypeError', 'Fix it by converting first: age = int(input(...)).'),
     o('The colon after the if line is missing', 'The colon is there. Check line 2 again.', null),
     o('print needs two arguments', 'print works with one argument. It is not the problem.', null)]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'a = 7\nb = 2\nprint(a // b, a % b)', answer: '3 1',
     wrong: [{ans: '3.5 1', why: '// is floor division: it drops the fraction, so 7 // 2 is 3. Only / gives 3.5.', m: 'div-vs-floor'}, {ans: '3.5 1.0', why: '// gives a whole number (3) and % gives the remainder (1).', m: 'div-vs-floor'}],
     explain: '7 // 2 = 3 (how many whole 2s fit in 7) and 7 % 2 = 1 (what is left over). print shows both separated by a space.'},
   fix: {lvl: 2, q: 'average(a, b) should return the average of two numbers, but average(4, 6) returns 7.0. Fix the function.',
     starter: 'def average(a, b):\n    return a + b / 2',
     tests: [{call: 'print(average(4, 6))', expect: '5.0'}, {call: 'print(average(10, 20))', expect: '15.0'}],
     solution: 'def average(a, b):\n    return (a + b) / 2',
     hints: ['Which runs first in a + b / 2: the + or the /?', 'Division happens before addition, so only b is halved.', 'Put the sum in brackets before dividing.'],
     explainErr: {m: 'precedence', text: 'Python does / before +, so b / 2 was calculated first and then a was added. Brackets force the addition to happen first.'}}},

  {id: 'py-cond', subject: 'python', title: 'Conditions (if / elif / else)', blurb: 'Making decisions, and choosing only one branch',
   lesson: {
     beginner: 'A condition is a question with a True or False answer. if runs its indented block only when the answer is True. elif ("else if") is asked only when every earlier question was False, and else runs when nothing matched. Use == to compare and = to store a value.',
     real: 'Imagine a bouncer reading a list top to bottom: "Are you on the VIP list? Come in. No? Are you on the guest list? Come in. No? Sorry." Once you are let in, the bouncer stops reading. That is if / elif / else: the first matching branch wins and the rest are skipped.',
     code: 'marks = 72\nif marks >= 90:\n    print("A")\nelif marks >= 60:\n    print("B")   # runs\nelse:\n    print("C")',
     exam: 'Key points: comparison operators ==, !=, <, >, <=, >=. Logical operators and, or, not. Only one branch of an if-elif-else chain runs. Indentation defines the block. = assigns, == compares.'},
   check: {q: 'Which line correctly checks whether x equals 5?', opts: [
     o('if x = 5:', 'A single = stores a value. Python reports a SyntaxError here. Use == to compare.', 'assign-eq'),
     ok('if x == 5:', 'Two equals signs compare the values and give True or False.'),
     o('if x === 5:', '=== belongs to JavaScript. Python only has ==.', 'assign-eq'),
     o('if (x equals 5):', 'Python has no equals keyword. Use the == operator.', null)]},
   bug: {lvl: 1, q: 'The programmer wants only ONE grade printed, but for marks = 72 this prints both B and C. Why?',
     code: 'marks = 72\nif marks >= 90:\n    print("A")\nif marks >= 60:\n    print("B")\nif marks >= 40:\n    print("C")', opts: [
     ok('Each if is checked independently. Using elif for the later checks makes Python stop after the first match', 'With elif, once "B" matches, the "C" test is never reached.'),
     o('>= is not valid in Python', '>= is valid. The comparisons are fine.', null),
     o('marks must be written in quotes', 'Quotes would turn 72 into text and break the comparison.', null),
     o('Python only runs the last if', 'Python runs every if that is True. That is exactly why two lines were printed.', 'if-chain')]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'n = 15\nif n % 3 == 0:\n    print("Fizz")\nelif n % 5 == 0:\n    print("Buzz")\nelse:\n    print(n)', answer: 'Fizz',
     wrong: [{ans: 'FizzBuzz', why: 'elif is only checked when the if above it was False. 15 % 3 == 0 is True, so "Fizz" prints and the elif is skipped.', m: 'if-chain'}, {ans: 'Buzz', why: 'The first condition (15 % 3 == 0) is True, so that branch wins and the rest are skipped.', m: 'if-chain'}],
     explain: '15 % 3 is 0, so the first condition is True and "Fizz" prints. The elif and else are skipped even though 15 is also divisible by 5.'},
   fix: {lvl: 2, q: 'grade(40) should return "Pass" (40 or more passes), but it returns "Fail". Fix the function.',
     starter: 'def grade(m):\n    if m > 40:\n        return "Pass"\n    else:\n        return "Fail"',
     tests: [{call: 'print(grade(40))', expect: 'Pass'}, {call: 'print(grade(39))', expect: 'Fail'}, {call: 'print(grade(75))', expect: 'Pass'}],
     solution: 'def grade(m):\n    if m >= 40:\n        return "Pass"\n    else:\n        return "Fail"',
     hints: ['Test the exact boundary value: what happens at 40?', '> means strictly greater than, so 40 does not qualify.', 'Use >= so that 40 passes too.'],
     explainErr: {m: 'boundary', text: '40 > 40 is False, so exactly 40 fell into the else branch. Boundary values are the most common place for mistakes. Always test them.'}}},

  {id: 'py-loops', subject: 'python', title: 'Loops (for and range)', blurb: 'Repeating work, and where range() stops',
   lesson: {
     beginner: 'A for loop repeats a block once for each value in a sequence. range(n) gives the numbers 0 up to n - 1. range(a, b) gives a up to b - 1. The end value is never included.',
     real: 'range(1, 5) is like a staircase you stand on step 1 and walk up until you reach step 5, but you must stop BEFORE stepping on 5. So you visit 1, 2, 3, 4. Fence posts work the same way: the last number is the gate, not a post.',
     code: 'for i in range(3):\n    print(i)      # 0, 1, 2\n\nfor i in range(1, 4):\n    print(i)      # 1, 2, 3',
     exam: 'Key points: range(stop), range(start, stop), range(start, stop, step). The stop value is excluded. A while loop repeats while its condition is True and needs something inside that eventually makes it False. break exits a loop, continue skips to the next round.'},
   check: {q: 'What does for i in range(3): print(i) print?', opts: [
     o('1  2  3', 'range(3) starts at 0 by default, not 1.', 'range-end'),
     ok('0  1  2', 'range(3) produces 0, 1 and 2: three numbers, starting at 0, stopping before 3.'),
     o('0  1  2  3', 'The stop value (3) is never included in range().', 'range-end'),
     o('1  2', 'range(3) does not skip 0, and it produces three values, not two.', null)]},
   bug: {lvl: 1, q: 'This loop should print the numbers 1 to 5, but it stops at 4. Why?', code: 'for i in range(1, 5):\n    print(i)', opts: [
     ok('range() stops before its end value, so range(1, 5) ends at 4. Use range(1, 6)', 'The end value is excluded.'),
     o('range always starts at 0', 'range(1, 5) starts at 1 because a start value was given.', null),
     o('print inside a loop only runs once', 'print runs once per round, which is four times here.', null),
     o('i cannot hold the value 5', 'i can hold 5. range(1, 6) would give it 5.', 'range-end')]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'total = 0\nfor i in range(1, 4):\n    total += i\nprint(total)', answer: '6',
     wrong: [{ans: '10', why: 'range(1, 4) gives 1, 2, 3, so 4 is never added. 1 + 2 + 3 = 6.', m: 'range-end'}, {ans: '3', why: 'total keeps growing in every round (total += i); it is not reset. 1 + 2 + 3 = 6.', m: null}],
     explain: 'range(1, 4) gives 1, 2, 3. total goes 0 → 1 → 3 → 6.'},
   fix: {lvl: 2, q: 'sum_to(n) should return 1 + 2 + ... + n, but sum_to(4) returns 6 instead of 10. Fix the function.',
     starter: 'def sum_to(n):\n    total = 0\n    for i in range(1, n):\n        total += i\n    return total',
     tests: [{call: 'print(sum_to(4))', expect: '10'}, {call: 'print(sum_to(1))', expect: '1'}, {call: 'print(sum_to(0))', expect: '0'}],
     solution: 'def sum_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total',
     hints: ['Which numbers does range(1, n) produce when n is 4?', 'The stop value is excluded, so n itself is never added.', 'The stop value must be n + 1.'],
     explainErr: {m: 'range-end', text: 'range(1, n) stops at n - 1, so n was never added. To include n, the stop value has to be n + 1.'}}},

  {id: 'py-lists', subject: 'python', title: 'Lists and indexing', blurb: 'Positions start at 0, and slices stop early',
   lesson: {
     beginner: 'A list stores several values in order: nums = [10, 20, 30]. Each value has a position called an index, and the first index is 0. nums[1] is 20. A negative index counts from the end: nums[-1] is the last item. A slice nums[a:b] takes items from index a up to, but not including, index b.',
     real: 'Think of a row of lockers numbered from 0. The first locker is number 0, not 1. nums[-1] means "the last locker" without counting. A slice [1:3] is like saying "give me lockers 1 and 2, and stop when you reach 3".',
     code: 'letters = ["a", "b", "c", "d"]\nprint(letters[0])     # a\nprint(letters[-1])    # d\nprint(letters[1:3])   # [\'b\', \'c\']\nletters.append("e")   # changes the list itself',
     exam: 'Key points: indexing from 0, negative indexes, slicing [start:stop:step] with stop excluded, len(). Lists are mutable. append(), insert(), remove(), pop() change the list in place and return None (pop returns the removed item). IndexError happens when an index is out of range.'},
   check: {q: 'nums = [10, 20, 30]. What does print(nums[1]) display?', opts: [
     o('10', 'Index 0 is the first item (10). Index 1 is the second.', 'zero-index'),
     ok('20', 'Indexes start at 0, so nums[1] is the second item.'),
     o('30', 'That would be nums[2] (or nums[-1]).', 'zero-index'),
     o('An error', 'Index 1 exists in a 3-item list, so there is no error.', null)]},
   bug: {lvl: 2, q: 'What does this program print, and why?', code: 'nums = [3, 1, 2]\nnums = nums.append(4)\nprint(nums)', opts: [
     o('[3, 1, 2, 4]', 'append changes the list in place and returns None. The assignment then overwrites nums with None.', 'append-none'),
     ok('None. append() changes the list but returns None, and that None replaced nums', 'Just call nums.append(4) on its own line, without assigning it.'),
     o('An error because lists have no append method', 'Lists do have append. The program runs without an error.', null),
     o('[4]', 'append adds to the existing list; it never creates a list holding only the new item.', 'append-none')]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'letters = ["a", "b", "c", "d"]\nprint(letters[1:3])', answer: "['b', 'c']",
     wrong: [{ans: "['a', 'b', 'c']", why: 'Slices start at the first index given (1), not at 0. So the slice begins at "b".', m: 'zero-index'}, {ans: "['b', 'c', 'd']", why: 'The stop index (3) is excluded, so "d" (index 3) is left out.', m: 'slice-end'}],
     explain: 'letters[1:3] takes index 1 ("b") and index 2 ("c"), and stops before index 3.'},
   fix: {lvl: 2, q: 'last_item(lst) should return the last element, but it crashes with an IndexError. Fix the function.',
     starter: 'def last_item(lst):\n    return lst[len(lst)]',
     tests: [{call: 'print(last_item([4, 5, 6]))', expect: '6'}, {call: 'print(last_item(["x"]))', expect: 'x'}],
     solution: 'def last_item(lst):\n    return lst[-1]',
     hints: ['If a list has 3 items, which indexes exist?', 'The valid indexes are 0, 1, 2. Index len(lst) is one past the end.', 'Use len(lst) - 1, or the negative index -1.'],
     explainErr: {m: 'zero-index', text: 'A list of length n has indexes 0 to n - 1. lst[len(lst)] points one position past the end, which raises IndexError. lst[-1] is the safe way to read the last item.'}}},

  {id: 'py-funcs', subject: 'python', title: 'Functions and return', blurb: 'Printing is not the same as returning',
   lesson: {
     beginner: 'A function is a named block of code you can reuse. def add(a, b): defines it, and add(2, 3) calls it. return sends a value back to the code that called the function. print only shows text on the screen. A function with no return gives back None.',
     real: 'A function is like a vending machine. You put in coins (the arguments) and the machine returns a snack. Printing is like the machine reading out "this is a cola" without actually handing it over. You can only use the snack in your hand, and that is the returned value.',
     code: 'def add(a, b):\n    return a + b\n\nresult = add(2, 3)   # result is 5\nprint(result * 2)    # 10',
     exam: 'Key points: parameters vs arguments, return values, default arguments, local vs global scope. A function without a return statement returns None. Changing a parameter inside a function does not change an int or string variable outside it.'},
   check: {q: 'Which keyword sends a value from a function back to the code that called it?', opts: [
     o('print', 'print only displays text. The calling code receives nothing from it.', 'return-print'),
     ok('return', 'return hands a value back so the caller can store or use it.'),
     o('yield', 'yield belongs to generators. It is not the basic way to give back one value.', null),
     o('output', 'Python has no output keyword.', null)]},
   bug: {lvl: 2, q: 'What happens when this program runs?', code: 'def add(a, b):\n    print(a + b)\n\nresult = add(2, 3)\nprint(result * 2)', opts: [
     o('It prints 5 and then 10', 'add prints 5, but it does not return anything, so result is None, and None * 2 is not 10.', 'return-print'),
     ok('It prints 5, then raises a TypeError, because add returns None and None * 2 is not allowed', 'Replace print(a + b) with return a + b.'),
     o('It prints nothing', 'add(2, 3) does print 5 before the error occurs.', null),
     o('NameError: result is not defined', 'result is defined. It is assigned the value None.', null)]},
   predict: {lvl: 2, q: 'What does this program print?', code: 'def double(x):\n    x = x * 2\n    return x\n\nn = 5\ndouble(n)\nprint(n)', answer: '5',
     wrong: [{ans: '10', why: 'double(n) returns 10 but the result was thrown away, and the n outside is a separate variable. n is still 5.', m: 'scope-copy'}],
     explain: 'x inside the function is a separate name. The returned 10 was not stored anywhere, so n still holds 5.'},
   fix: {lvl: 2, q: 'is_even(4) should return True, but it returns None. Fix the function.',
     starter: 'def is_even(n):\n    n % 2 == 0',
     tests: [{call: 'print(is_even(4))', expect: 'True'}, {call: 'print(is_even(7))', expect: 'False'}],
     solution: 'def is_even(n):\n    return n % 2 == 0',
     hints: ['What does a function give back when it has no return?', 'The comparison is calculated and then thrown away.', 'Put return in front of the expression.'],
     explainErr: {m: 'return-print', text: 'The comparison n % 2 == 0 was calculated but never returned, so the function gave back None. A value only leaves a function through return.'}}},

  /* ============================ SQL ============================ */
  {id: 'sql-where', subject: 'sql', title: 'SELECT and WHERE', blurb: 'Choosing columns and filtering rows',
   lesson: {
     beginner: 'SELECT chooses which columns to show, FROM names the table, and WHERE keeps only the rows that match a condition. Text values must be in quotes: WHERE city = \'Delhi\'. Several columns are separated by commas.',
     real: 'A table is like a spreadsheet. SELECT picks the columns you want to look at, like hiding the other columns. WHERE is the filter button: it hides every row that does not match. Quotes tell SQL "this is a word to match", not "this is the name of a column".',
     code: "SELECT name, marks\nFROM student\nWHERE city = 'Delhi' AND marks > 80;",
     exam: 'Key points: SELECT * for all columns, DISTINCT removes duplicates, comparison operators = != < > <= >=, logical AND OR NOT, BETWEEN, IN, LIKE with % and _, IS NULL (never = NULL). Clause order: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY.'},
   check: {q: 'Which query lists the names of students who live in Delhi?', opts: [
     o("SELECT name FROM student WHERE city = Delhi;", 'Without quotes, SQL reads Delhi as the name of a column and fails. Text values need quotes.', 'sql-quotes'),
     ok("SELECT name FROM student WHERE city = 'Delhi';", 'The quotes mark Delhi as a text value to match.'),
     o("SELECT name FROM student city = 'Delhi';", 'The WHERE keyword is missing, so SQL does not know this is a filter.', null),
     o("SELECT name WHERE city = 'Delhi' FROM student;", 'Clauses must come in order: FROM comes before WHERE.', null)]},
   bug: {lvl: 1, q: 'This query fails. Why?', code: 'SELECT name marks FROM student;', opts: [
     o('marks is a reserved word', 'marks is an ordinary column name here.', null),
     ok('The comma between the two column names is missing', 'Columns in SELECT are separated by commas: SELECT name, marks.'),
     o('FROM must come first', 'SELECT always comes first. FROM comes after the column list.', null),
     o('A WHERE clause is mandatory', 'WHERE is optional. Without it, you get every row.', null)]},
   predict: {lvl: 1, q: 'How many rows does this query return?', code: 'SELECT name FROM student WHERE marks > 80;', db: true, kind: 'rowcount',
     explain: 'Marks above 80 are 92 (Aarav), 85 (Diya) and 88 (Sana). > is strictly greater, so a mark of exactly 80 would not qualify.', m: 'sql-strict'},
   fix: {lvl: 2, q: 'List the names of students who live in Delhi AND scored more than 80. Right now the query returns too many rows. Fix it.', db: true,
     starter: "SELECT name FROM student WHERE city = 'Delhi' OR marks > 80;",
     solution: "SELECT name FROM student WHERE city = 'Delhi' AND marks > 80;",
     hints: ['Compare the rows you get with the rows you want: which extra students appear?', 'OR keeps a row if EITHER condition is true. You need both.', 'Replace OR with AND.'],
     explainErr: {m: 'sql-and-or', text: 'OR keeps a row when either condition is true, so Diya (85, Mumbai) and Kabir (Delhi, 67) slipped in. AND requires both conditions to hold.'}}},

  {id: 'sql-agg', subject: 'sql', title: 'Aggregates and GROUP BY', blurb: 'COUNT, AVG and summarising groups',
   lesson: {
     beginner: 'Aggregate functions (COUNT, SUM, AVG, MIN, MAX) squash many rows into one value. GROUP BY makes one result row for each distinct value of a column. WHERE filters rows BEFORE grouping. HAVING filters the groups AFTER they are formed.',
     real: 'Imagine sorting class results into piles, one pile per city. GROUP BY makes the piles. COUNT(*) counts the papers in each pile. WHERE is a rule for what is allowed to enter a pile; HAVING is a rule about which finished piles to keep, such as "only piles with more than one paper".',
     code: 'SELECT city, COUNT(*) AS students, AVG(marks)\nFROM student\nGROUP BY city\nHAVING COUNT(*) > 1;',
     exam: 'Key points: aggregate functions ignore NULLs (except COUNT(*)). Every non-aggregated column in SELECT must appear in GROUP BY. WHERE cannot contain aggregate functions; use HAVING. Clause order: WHERE, GROUP BY, HAVING, ORDER BY.'},
   check: {q: 'Which clause filters groups AFTER GROUP BY has formed them?', opts: [
     o('WHERE', 'WHERE filters individual rows before they are grouped, so it cannot use group totals like COUNT(*).', 'sql-where-having'),
     ok('HAVING', 'HAVING is checked after grouping, so it can use aggregates such as COUNT(*) > 1.'),
     o('ORDER BY', 'ORDER BY only sorts the result. It does not remove anything.', null),
     o('LIMIT', 'LIMIT cuts the result to a fixed number of rows. It does not test a condition.', null)]},
   bug: {lvl: 2, q: 'This query is meant to show cities with more than one student, but it fails. Why?', code: 'SELECT city, COUNT(*)\nFROM student\nWHERE COUNT(*) > 1\nGROUP BY city;', opts: [
     ok('Aggregate functions are not allowed in WHERE. The condition belongs in HAVING, after GROUP BY', 'Write GROUP BY city HAVING COUNT(*) > 1.'),
     o('COUNT(*) must be written as COUNT(city)', 'Both forms are valid. That is not the cause.', null),
     o('GROUP BY must come before FROM', 'GROUP BY comes after FROM and WHERE.', null),
     o('There is no table called student', 'The table exists. The problem is the aggregate inside WHERE.', 'sql-where-agg')]},
   predict: {lvl: 2, q: 'How many rows does this query return?', code: 'SELECT city, COUNT(*) FROM student GROUP BY city;', db: true, kind: 'rowcount',
     explain: 'There are three different cities (Delhi, Mumbai, Pune), and GROUP BY returns one row per city, not one per student.', m: 'sql-group'},
   fix: {lvl: 3, q: 'Show each city with the average marks of its students. This query is missing something. Fix it.', db: true,
     starter: 'SELECT city, AVG(marks) FROM student;',
     solution: 'SELECT city, AVG(marks) FROM student GROUP BY city;',
     hints: ['You want one result row per city, not one row for the whole table.', 'Which clause creates one row per distinct value?', 'Add GROUP BY city at the end.'],
     explainErr: {m: 'sql-group', text: 'AVG(marks) squashes the whole table into a single value, so SQL cannot also show a separate city per row. GROUP BY city tells it to make one average per city.'}}},

  {id: 'sql-join', subject: 'sql', title: 'Joining tables', blurb: 'Matching rows across two tables',
   lesson: {
     beginner: 'A join combines rows from two tables. Listing two tables (FROM student, club) pairs EVERY row of the first with EVERY row of the second. To keep only the matching pairs, add a join condition such as WHERE student.roll = club.roll.',
     real: 'Imagine two lists: students and their clubs. Without a condition, SQL is like pairing every student with every club on the sheet, which gives silly combinations. The join condition is the shared roll number: it says "only pair a student with the clubs that have the same roll number".',
     code: 'SELECT name, club\nFROM student, club\nWHERE student.roll = club.roll;\n-- or: FROM student JOIN club ON student.roll = club.roll',
     exam: 'Key points: Cartesian product has rows1 x rows2 rows (degree = columns added together). Equi-join uses =. Natural join matches columns with the same name. Qualify shared column names with table.column. JOIN ... ON is the modern syntax.'},
   check: {q: 'SELECT * FROM student, club; has no join condition. What does it return?', opts: [
     o('Only the rows where the roll numbers match', 'Matching only happens when you add a condition such as WHERE student.roll = club.roll.', 'sql-cross'),
     ok('Every student row paired with every club row', 'With no condition, SQL returns the Cartesian product: all possible pairs.'),
     o('An error, because a condition is required', 'SQL allows it. It just returns far more rows than you probably want.', 'sql-cross'),
     o('No rows', 'The tables are not empty, so every combination is produced.', null)]},
   bug: {lvl: 2, q: 'This query returns far too many rows. Why?', code: 'SELECT name, club\nFROM student, club;', opts: [
     ok('There is no join condition, so every student is paired with every club (a Cartesian product)', 'Add WHERE student.roll = club.roll.'),
     o('club is a reserved word', 'club is just a table and column name here.', null),
     o('name and club must be in quotes', 'Column names are never put in quotes in a SELECT list.', null),
     o('SELECT cannot use two tables', 'SELECT can read from several tables. It needs a join condition to match them.', 'sql-cross')]},
   predict: {lvl: 2, q: 'How many rows does this query return?', code: 'SELECT * FROM student, club;', db: true, kind: 'rowcount',
     explain: 'There are 6 students and 4 club rows. A Cartesian product has 6 x 4 = 24 rows.', m: 'sql-cross'},
   fix: {lvl: 3, q: 'List each student name with the club they belong to. The query below returns far too many rows. Fix it.', db: true,
     starter: 'SELECT name, club FROM student, club;',
     solution: 'SELECT name, club FROM student, club WHERE student.roll = club.roll;',
     hints: ['Both tables have a roll column that identifies the same student.', 'Only keep the pairs where the two roll numbers are equal.', 'Add WHERE student.roll = club.roll.'],
     explainErr: {m: 'sql-cross', text: 'Without a condition, SQL pairs every student with every club (24 rows). Matching on the shared roll number keeps only the real memberships (4 rows).'}}},

  /* ============================ DSA (aligned to CSPC302) ============================
     Same shape as Python/SQL, with Python used for the code. DSA topics have no fix-the-code exercise,
     so they carry extra multiple-choice questions in qs instead. Every wrong option explains why it is wrong. */
  {id: 'dsa-arrays', subject: 'dsa', title: 'Arrays and indexing', blurb: 'Fast reads by index, slow shifting in the middle',
   lesson: {
     beginner: 'An array keeps its items side by side in memory. Because every slot is the same size, the computer can jump straight to item i without looking at the others, so reading arr[i] takes constant time, O(1). The price is paid when you insert or delete near the front or middle: the items after that spot must all shift one place, which takes O(n). Valid indexes run from 0 to n - 1.',
     real: 'Think of a row of numbered lockers. If you know the locker number you walk straight to it, however long the row is. But if you want to squeeze a new locker in at position 1, every locker after it has to be renumbered and moved along. Reading is cheap, making room is expensive.',
     code: `arr = [10, 20, 30, 40]
print(arr[2])        # 30, found directly: O(1)
arr.insert(1, 99)    # shifts 20, 30, 40 right: O(n)
print(arr)           # [10, 99, 20, 30, 40]
arr.append(50)       # adds at the end: O(1) on average
print(arr[len(arr) - 1])   # last item is at index len - 1`,
     exam: 'Key points: random access O(1); search in an unsorted array O(n); insertion or deletion at a given position O(n) because of shifting (at the end it is O(1)); fixed size in C, while a Python list is a dynamic array that grows by resizing. Index range is 0 to n - 1. 2D arrays are stored row by row (row-major) in C.'},
   check: {q: 'How long does reading arr[i] take for an array of n items?', opts: [
     ok('O(1): the address of item i is calculated directly from i', 'Start address plus i times the item size gives the location, so no walking is needed.'),
     o('O(n): the computer has to count past the earlier items', 'That is how a linked list works. An array computes the address, so the cost does not depend on n.', 'walk-access'),
     o('O(log n): the array is searched by halving', 'Halving belongs to binary search on sorted data. Plain indexing does not search at all.', null),
     o('O(n^2): every item is compared with every other', 'Reading one slot compares nothing. It is a single address calculation.', null)]},
   bug: {lvl: 1, q: 'last([4, 5, 6]) crashes with an IndexError. Why?', code: 'def last(arr):\n    return arr[len(arr)]', opts: [
     ok('The valid indexes are 0 to len - 1, and arr[len(arr)] is one position past the end', 'Use arr[len(arr) - 1] or arr[-1].'),
     o('len(arr) returns one less than the number of items', 'len returns the true count, 3 here. The indexes are 0, 1 and 2, so index 3 does not exist.', 'idx-len'),
     o('Arrays cannot be read inside a function', 'Functions can read their arguments freely. The problem is the index value.', null),
     o('The list has to be sorted before it can be indexed', 'Indexing works on any list, sorted or not.', null)]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'arr = [10, 20, 30, 40]\narr.insert(1, 99)\narr.pop()\nprint(arr)', answer: '[10, 99, 20, 30]',
     wrong: [{ans: '[99, 10, 20, 30]', why: 'insert(1, 99) puts 99 at index 1, the second slot, because indexes start at 0. It does not go to the front.', m: 'zero-index'}, {ans: '[10, 99, 20, 30, 40]', why: 'pop() with no argument removes the last item, so 40 is gone after the pop.', m: null}],
     explain: 'insert(1, 99) makes [10, 99, 20, 30, 40] by shifting 20, 30 and 40 right. pop() then removes the last item, 40.'},
   qs: [
     {q: 'Inserting a new item at the very start of an array that holds n items takes about:', opts: [
       ok('O(n): every existing item has to shift one place to the right', 'The slot at index 0 is already occupied, so room must be made by moving all n items.'),
       o('O(1): the first position is always free', 'Position 0 holds the current first item. Making room means moving everything after it.', 'shift-cost'),
       o('O(log n): the shifting can be done by halving', 'Shifting is a plain one-by-one move of n items. Halving does not apply.', null),
       o('O(1), because a Python list is really a linked list', 'A Python list is a dynamic array, not a linked list, so inserting at the front still shifts every item.', 'shift-cost')]},
     {q: 'What does this program print?', code: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)', opts: [
       ok('[1, 2, 3, 4]', 'b = a does not copy the list. Both names point to the same list, so appending through b changes what a shows.'),
       o('[1, 2, 3]', 'That would need b = a.copy() (or a[:]). A plain assignment only gives the same list a second name.', 'alias-copy'),
       o('[4]', 'append adds to the existing list. It never makes a new list holding only the new value.', null),
       o('An error, because b is not defined as a list', 'b is defined: it refers to the same list as a, so append works.', null)]},
   ]},

  {id: 'dsa-linked', subject: 'dsa', title: 'Linked lists', blurb: 'Nodes joined by pointers: cheap to insert, slow to reach',
   lesson: {
     beginner: 'A singly linked list is a chain of nodes. Each node holds a value and a pointer called next to the following node, and the list is held by a pointer to the first node, the head. There is no index: to reach the k-th node you start at the head and follow next k times, which is O(k). The benefit is that inserting at the head only needs two pointer changes, O(1), and nothing has to shift.',
     real: 'Think of a treasure hunt. Each clue tells you where the next clue is hidden. To get to clue 5 you must find clues 1 to 4 first. But adding a new clue in the middle just means changing what the clue before it says, so nobody needs to move.',
     code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

head = Node(1)
head.next = Node(2)
head.next.next = Node(3)

cur = head
while cur:            # walk the chain: O(n)
    print(cur.val)
    cur = cur.next`,
     exam: 'Key points: node = data + next pointer; head pointer; access by position O(n); insert or delete at head O(1); insert after a node you already hold O(1); search O(n); extra memory for pointers; doubly linked lists add a prev pointer; circular lists link the tail back to the head. The last node points to None (NULL).'},
   check: {q: 'To reach the k-th node of a singly linked list, starting from only the head pointer, what must you do?', opts: [
     ok('Follow the next pointer k times from the head: O(k)', 'Nodes are scattered in memory and only know their successor, so the only route is along the chain.'),
     o('Jump straight to it using its index in O(1)', 'That works for arrays. A linked list has no index and no address formula.', 'index-ll'),
     o('Start from the tail and follow prev pointers', 'A singly linked list has no prev pointers, and you are only given the head.', null),
     o('Use binary search on the nodes', 'Binary search needs jump-to-the-middle access, which a linked list does not have.', null)]},
   bug: {lvl: 2, q: 'reverse(head) is called on the list 1 -> 2 -> 3 but returns a list that holds only the node 1. Why?', code: 'def reverse(head):\n    prev = None\n    cur = head\n    while cur:\n        cur.next = prev\n        prev = cur\n        cur = cur.next\n    return prev', opts: [
     ok('cur.next is overwritten with prev before the old next node was saved, so cur = cur.next goes backwards and the rest of the list is lost', 'Save the next node first: nxt = cur.next, then cur.next = prev, prev = cur, cur = nxt.'),
     o('prev should start as head instead of None', 'The new tail must point to None, so prev correctly starts as None. Starting at head would create a cycle.', null),
     o('The loop should be while cur.next', 'That would stop before processing the last node, and it does not fix the lost pointer.', null),
     o('A singly linked list cannot be reversed in place', 'It can, using three pointers. The code just updates them in the wrong order.', null)]},
   predict: {lvl: 2, q: 'What does this program print?', code: 'class Node:\n    def __init__(self, v):\n        self.v = v\n        self.next = None\n\na = Node(1)\nb = Node(2)\nc = Node(3)\na.next = b\nb.next = c\na.next = c\ncur = a\nout = []\nwhile cur:\n    out.append(cur.v)\n    cur = cur.next\nprint(out)', answer: '[1, 3]',
     wrong: [{ans: '[1, 2, 3]', why: 'a.next was reassigned to c, so node 2 can no longer be reached from the head. Walking the chain skips it.', m: 'll-order'}, {ans: '[1, 2]', why: 'The walk follows a.next, which is now c, so it reaches 3 and never visits 2.', m: 'll-order'}],
     explain: 'a.next = c overwrites the link to b. The walk goes a, then c, then stops, so it collects 1 and 3.'},
   qs: [
     {q: 'You hold the head of a singly linked list. Inserting a new node at the head takes:', opts: [
       ok('O(1): point the new node at the old head, then make it the head', 'Only two pointers change, so the cost does not depend on the length of the list.'),
       o('O(n): every node has to shift along', 'Shifting is an array problem. Linked nodes are never moved, only re-linked.', 'shift-cost'),
       o('O(n): you must walk to the end first', 'You would walk to the end to append at the tail (without a tail pointer). The head is already in your hand.', null),
       o('O(log n)', 'Nothing is halved. The insertion is a fixed number of pointer changes.', null)]},
     {q: 'Which statement about linked lists compared with arrays is correct?', opts: [
       ok('Reading the i-th item needs a walk from the head, and every node uses extra memory for its pointer', 'Those are the two main costs of linked lists. In return, inserting and deleting at a known place does not shift anything.'),
       o('A linked list cannot grow after it is created', 'It grows one node at a time, which is one of its strengths.', null),
       o('A linked list cannot store duplicate values', 'Each node is separate, so any value can appear any number of times.', null),
       o('Inserting after a node you already hold takes O(n)', 'It takes O(1): you only change two pointers. Nothing has to move.', 'shift-cost')]},
   ]},

  {id: 'dsa-stack', subject: 'dsa', title: 'Stacks', blurb: 'Last in, first out',
   lesson: {
     beginner: 'A stack lets you add (push) and remove (pop) items at one end only, the top. The item pushed last is the first to come out: last in, first out (LIFO). In Python a list works as a stack: append() pushes and pop() pops. Popping an empty stack is an error, so check it is not empty first. Push, pop and peek (look at the top) are all O(1).',
     real: 'A stack of plates in a canteen: you put a clean plate on top and you take a plate from the top. The plate at the bottom waits the longest. Your browser Back button works the same way: the page you visited last is the first one you return to.',
     code: `stack = []
stack.append(1)      # push
stack.append(2)
stack.append(3)
print(stack.pop())   # 3  (last in, first out)
print(stack[-1])     # 2  (peek at the top)
print(len(stack) == 0)   # False, so popping is safe`,
     exam: 'Key points: LIFO; operations push, pop, peek, isEmpty, all O(1). Overflow (push on a full array-based stack) and underflow (pop on an empty stack). Applications: balanced brackets, undo, function call stack and recursion, DFS, infix to postfix conversion, postfix evaluation.'},
   check: {q: 'Items 1, 2 and 3 are pushed onto a stack in that order. What does the next pop() return?', opts: [
     ok('3', 'A stack is last in, first out. The last item pushed, 3, is on top.'),
     o('1', 'That is first in, first out, which describes a queue. A stack gives back the newest item.', 'lifo-fifo'),
     o('2', 'The middle item is never first. Only the top of the stack can be popped.', null),
     o('All three at once', 'pop() removes exactly one item, the one on top.', null)]},
   bug: {lvl: 2, q: 'is_balanced(")") crashes with an IndexError instead of returning False. Why?', code: 'def is_balanced(s):\n    stack = []\n    for ch in s:\n        if ch == "(":\n            stack.append(ch)\n        elif ch == ")":\n            stack.pop()\n    return len(stack) == 0', opts: [
     ok('A closing bracket arrives while the stack is empty, and pop() on an empty list raises IndexError. Check the stack is not empty first', 'If a ")" appears with nothing to match it, the brackets are unbalanced, so return False.'),
     o('pop() on an empty list quietly returns None', 'Python lists raise IndexError when you pop from an empty list. They do not return None.', 'empty-pop'),
     o('append is the wrong method for pushing', 'append is the normal way to push onto a list-based stack.', null),
     o('A string cannot be looped over with for', 'Strings are iterable, so the loop gives one character at a time.', null)]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'stack = []\nfor x in [1, 2, 3]:\n    stack.append(x)\nstack.pop()\nstack.append(9)\nprint(stack)', answer: '[1, 2, 9]',
     wrong: [{ans: '[2, 3, 9]', why: 'pop() removes the top, which is the last item pushed (3). It does not remove from the bottom.', m: 'lifo-fifo'}, {ans: '[1, 2, 3, 9]', why: 'pop() removed 3 before 9 was pushed, so 3 is not in the final stack.', m: null}],
     explain: 'After three pushes the stack is [1, 2, 3]. pop() removes 3, leaving [1, 2]. Pushing 9 gives [1, 2, 9].'},
   qs: [
     {q: 'Which task is a classic use of a stack?', opts: [
       ok('Checking that the brackets in an expression are balanced', 'The most recent opening bracket must be matched first, which is exactly last in, first out.'),
       o('Serving print jobs in the order they arrived', 'First come, first served is FIFO, so that needs a queue.', 'lifo-fifo'),
       o('Finding the fewest-edge path in an unweighted graph', 'That is breadth-first search, which uses a queue. A stack gives depth-first search.', 'bfs-dfs'),
       o('Looking up a student by roll number in constant time', 'That is a job for a hash table. A stack only gives you access to the top.', null)]},
     {q: 'Evaluate the postfix expression 2 3 4 * + using a stack. What is the result?', opts: [
       ok('14', 'Push 2, 3, 4. The * pops 4 and 3 and pushes 12. The + pops 12 and 2 and pushes 14.'),
       o('20', 'That is (2 + 3) * 4. Postfix does not read left to right like that: the operator applies to the two values most recently pushed, 3 and 4.', 'postfix-order'),
       o('9', 'That is 2 + 3 + 4. The * operator was ignored.', null),
       o('24', 'That is 2 * 3 * 4. The + was applied as if it were *.', null)]},
   ]},

  {id: 'dsa-queue', subject: 'dsa', title: 'Queues', blurb: 'First in, first out',
   lesson: {
     beginner: 'A queue adds items at the back (enqueue) and removes them from the front (dequeue). The item that arrived first leaves first: first in, first out (FIFO). In Python, use collections.deque with append() and popleft(). A plain list works but list.pop(0) is slow, O(n), because the remaining items shift left. A circular queue reuses freed slots in a fixed array by wrapping the indexes round with modulo.',
     real: 'A line at a ticket counter. New people join at the back, the person at the front is served next, and nobody jumps ahead. A printer works the same way: jobs are printed in the order they were sent.',
     code: `from collections import deque
q = deque()
q.append("a")        # enqueue at the back
q.append("b")
q.append("c")
print(q.popleft())   # a  (first in, first out)
print(list(q))       # ['b', 'c']`,
     exam: 'Key points: FIFO; enqueue at rear, dequeue at front, both O(1) in a linked or circular implementation. Types: simple queue, circular queue (rear = (rear + 1) % size), deque (double-ended), priority queue. Applications: CPU scheduling, BFS, buffering, printer spooling. A simple array queue wastes space after dequeues, which a circular queue fixes.'},
   check: {q: 'Items 1, 2 and 3 are enqueued in that order. Which item does dequeue() return first?', opts: [
     ok('1', 'A queue is first in, first out, so the oldest item leaves first.'),
     o('3', 'That is last in, first out, which describes a stack, not a queue.', 'lifo-fifo'),
     o('2', 'The middle item is never served first. Only the front of the queue can be removed.', null),
     o('The largest value', 'Choosing by value is a priority queue. An ordinary queue ignores values and goes by arrival order.', null)]},
   bug: {lvl: 1, q: 'This code should remove the FRONT item of the queue (1), but it prints 3. Why?', code: 'queue = [1, 2, 3]\nfirst = queue.pop()\nprint(first)', opts: [
     ok('pop() with no argument removes the last item. The front item is removed with pop(0)', 'For a real queue, collections.deque and popleft() is better because pop(0) is O(n).'),
     o('pop() removes the first item, so the list must have been changed earlier', 'pop() with no argument always removes the last item. Nothing was changed earlier.', 'pop-end'),
     o('The list needs to be sorted before pop() works', 'pop() works on any list in any order.', null),
     o('Lists cannot hold numbers when used as a queue', 'A list can hold any values. The issue is which end pop() takes from.', null)]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'from collections import deque\nq = deque()\nq.append("a")\nq.append("b")\nq.append("c")\nq.popleft()\nq.append("d")\nprint(list(q))', answer: "['b', 'c', 'd']",
     wrong: [{ans: "['a', 'b', 'd']", why: 'popleft() removes from the front, which holds "a". Removing "c" would be stack behaviour.', m: 'lifo-fifo'}, {ans: "['a', 'b', 'c', 'd']", why: 'popleft() removed "a", so it is no longer in the queue.', m: null}],
     explain: 'After three appends the queue is a, b, c. popleft() removes a, leaving b, c. Appending d puts it at the back: b, c, d.'},
   qs: [
     {q: 'A circular queue is stored in an array of size 5. Why is it called circular?', opts: [
       ok('The rear index wraps round to the start using modulo, so freed slots at the front are reused', 'rear = (rear + 1) % 5 lets the queue use the whole array even after many dequeues.'),
       o('The items rotate by one place every time something is dequeued', 'Items do not move. Only the front and rear indexes change.', null),
       o('The array is connected to a linked list at the end', 'It is still one fixed array. The wrap-around comes from the modulo arithmetic.', null),
       o('It can hold more than 5 items because it wraps around', 'The capacity is still 5. Wrapping only lets it reuse empty slots, it does not add any.', null)]},
     {q: 'Which statement about removing the front item is correct?', opts: [
       ok('list.pop(0) is O(n) because the remaining items shift left, while deque.popleft() is O(1)', 'A deque is built for fast work at both ends, so it is the right tool for a queue in Python.'),
       o('Both list.pop(0) and deque.popleft() are O(1)', 'A list is an array, so removing its first item shifts all the others.', 'shift-cost'),
       o('list.pop(0) is O(1) and deque.popleft() is O(n)', 'It is the other way round. The deque does not need to shift anything.', null),
       o('Both are O(n)', 'popleft() on a deque only adjusts its front end, so it takes constant time.', null)]},
   ]},

  {id: 'dsa-tree', subject: 'dsa', title: 'Trees and binary search trees', blurb: 'Subtrees, the BST rule and traversal orders',
   lesson: {
     beginner: 'A tree is a set of nodes in a parent-child hierarchy, with one root and no cycles. In a binary tree each node has at most two children, left and right. A binary search tree (BST) adds a rule: for every node, ALL values in its left subtree are smaller and ALL values in its right subtree are larger. This makes search, insert and delete O(h), where h is the height. Inorder traversal (left, node, right) of a BST visits the values in sorted order.',
     real: 'Think of a game of "guess my number between 1 and 100". Each guess lets you throw away half of the remaining numbers. A BST works like that: at every node you go left or right and ignore the entire other side. If the tree is lopsided, though, you ignore much less, and it behaves like a plain list.',
     code: `class N:
    def __init__(self, v, l=None, r=None):
        self.v, self.l, self.r = v, l, r

def inorder(n):          # left, node, right
    if n:
        inorder(n.l)
        print(n.v, end=" ")
        inorder(n.r)

root = N(4, N(2, N(1), N(3)), N(6))
inorder(root)            # 1 2 3 4 6  (sorted)`,
     exam: 'Key points: root, leaf, height (edges on the longest root-to-leaf path), depth, level. Traversals: inorder (L N R), preorder (N L R), postorder (L R N), level order (BFS). BST search, insert, delete: O(h); O(log n) when balanced and O(n) when skewed. Deleting a node with two children: replace it with its inorder successor or predecessor. AVL and red-black trees keep the height O(log n).'},
   check: {q: 'In a binary search tree, where are all the values smaller than a node stored?', opts: [
     ok('Anywhere in that node\'s left subtree', 'The BST rule covers the entire left subtree, not only the left child.'),
     o('Only in its left child', 'The rule applies to every node below on the left side, grandchildren included. Thinking only of the direct child misses that.', 'bst-local'),
     o('In its right subtree', 'The right subtree holds the larger values.', null),
     o('Anywhere in the tree', 'The ordering rule is exactly what restricts smaller values to the left side.', null)]},
   bug: {lvl: 3, q: 'For the tree 10 with left child 5, and 5 having a right child 15, is_bst returns True although this is not a valid BST. Why?', code: 'def is_bst(node):\n    if node is None:\n        return True\n    if node.left and node.left.val > node.val:\n        return False\n    if node.right and node.right.val < node.val:\n        return False\n    return is_bst(node.left) and is_bst(node.right)', opts: [
     ok('It only compares each node with its direct children. 15 sits in the left subtree of 10 but is bigger than 10, so the check must pass down minimum and maximum bounds', 'Use is_bst(node, lo, hi): the left call gets hi = node.val and the right call gets lo = node.val.'),
     o('It is correct: 5 < 10 and 15 > 5, so the tree is a valid BST', 'Both local checks pass, but 15 must be smaller than 10 because it is in 10\'s left subtree. Local checks are not enough.', 'bst-local'),
     o('The base case should return False for None', 'An empty subtree is a valid BST, so True is right. Returning False would reject every tree.', null),
     o('A node with only one child makes a tree invalid', 'Nodes with one child are normal in a binary tree.', null)]},
   predict: {lvl: 2, q: 'What does this program print?', code: 'class N:\n    def __init__(self, v, l=None, r=None):\n        self.v, self.l, self.r = v, l, r\n\ndef inorder(n):\n    if n:\n        inorder(n.l)\n        print(n.v, end=" ")\n        inorder(n.r)\n\nroot = N(4, N(2, N(1), N(3)), N(6))\ninorder(root)', answer: '1 2 3 4 6',
     wrong: [{ans: '4 2 1 3 6', why: 'That is preorder (node, left, right). This function prints the node between its two recursive calls, which is inorder.', m: 'trav-order'}, {ans: '1 3 2 6 4', why: 'That is postorder (left, right, node). Here the print comes after the left call but before the right call.', m: 'trav-order'}],
     explain: 'Inorder visits left, node, right. The left subtree of 4 gives 1 2 3, then 4, then the right subtree gives 6, so the values come out sorted.'},
   qs: [
     {q: 'Keys 50, 30, 70, 20, 40 are inserted into an empty BST in that order. What is the height of the tree, counting edges on the longest root-to-leaf path?', opts: [
       ok('2', 'The tree is 50 with children 30 and 70, and 30 has children 20 and 40. The longest path, for example 50 to 30 to 20, has 2 edges.'),
       o('3', 'That counts the nodes on the path (50, 30, 20). Here height counts edges, so that path has 2. Some books count nodes instead, so always check which definition your course uses.', 'height-nodes'),
       o('1', 'Only the path 50 to 70 has one edge. The path through 30 goes one level deeper.', null),
       o('5', 'There are 5 nodes, but height is the length of one path, not the total number of nodes.', null)]},
     {q: 'A BST is built by inserting the keys 1, 2, 3, ..., n in sorted order. What is the worst-case time to search for a key?', opts: [
       ok('O(n): every key becomes the right child of the previous one, so the tree is a chain', 'Search then has to walk through the keys one by one, just like a linked list.'),
       o('O(log n): a BST always halves the search space', 'Only a balanced BST halves the search space. Inserting sorted keys produces a skewed tree.', 'bst-balanced'),
       o('O(1)', 'Search in a tree follows links downward, so it needs time proportional to the height.', null),
       o('O(n log n)', 'A single search cannot take longer than the height of the tree, which is at most n.', null)]},
   ]},

  {id: 'dsa-graph', subject: 'dsa', title: 'Graphs: BFS and DFS', blurb: 'Exploring a graph level by level or deep first',
   lesson: {
     beginner: 'A graph is a set of vertices joined by edges. A common way to store it is an adjacency list: a dictionary that maps each vertex to its neighbours. Breadth-first search (BFS) explores level by level using a queue, so it finds the fewest-edge path in an unweighted graph. Depth-first search (DFS) goes as deep as possible before backing up, using recursion or a stack. Both need a visited set, otherwise a cycle makes them run forever. Both take O(V + E) with an adjacency list.',
     real: 'Imagine searching a building. BFS is like checking every room on the first floor, then every room on the second floor, and so on: you spread out evenly. DFS is like picking one corridor and following it to the very end before you come back and try another. In both cases you mark rooms you have already checked so you do not go round in circles.',
     code: `from collections import deque
graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}

def bfs(start):
    seen, order, q = {start}, [], deque([start])
    while q:
        n = q.popleft()
        order.append(n)
        for nb in graph[n]:
            if nb not in seen:
                seen.add(nb)
                q.append(nb)
    return order

print(bfs("A"))   # ['A', 'B', 'C', 'D']`,
     exam: 'Key points: adjacency matrix (O(V^2) space, O(1) edge check) versus adjacency list (O(V + E) space). BFS uses a queue, DFS uses a stack or recursion. Both are O(V + E) with an adjacency list and O(V^2) with a matrix. BFS gives shortest paths in unweighted graphs. Applications: connected components, cycle detection, topological sort (DFS), level order. Weighted shortest paths need Dijkstra.'},
   check: {q: 'Which data structure does breadth-first search use to decide which vertex to visit next?', opts: [
     ok('A queue', 'BFS must finish all vertices at distance 1 before distance 2, and a first-in, first-out queue keeps that order.'),
     o('A stack', 'A stack gives depth-first behaviour: the newest vertex is explored first.', 'bfs-dfs'),
     o('A heap', 'A heap (priority queue) is used by Dijkstra for weighted graphs. Plain BFS does not need priorities.', null),
     o('A binary search tree', 'BFS does not need sorted storage. It only needs to process vertices in arrival order.', null)]},
   bug: {lvl: 2, q: 'On the graph {0: [1], 1: [0]}, bfs(graph, 0) never finishes. Why?', code: 'def bfs(graph, start):\n    queue = [start]\n    order = []\n    while queue:\n        node = queue.pop(0)\n        order.append(node)\n        for nb in graph[node]:\n            queue.append(nb)\n    return order', opts: [
     ok('There is no visited set, so the nodes 0 and 1 keep adding each other to the queue forever', 'Add a seen set and only enqueue neighbours that are not in it.'),
     o('BFS does not need a visited set because each node leaves the queue once', 'A node leaves the queue, but it can be added again from any neighbour. With a cycle that never ends.', 'no-visited'),
     o('queue.pop(0) should be queue.pop()', 'pop() would turn this into a depth-first search, and it would still loop forever without a visited set.', 'bfs-dfs'),
     o('graph[node] cannot be looped over', 'graph[node] is a list of neighbours, which loops fine.', null)]},
   predict: {lvl: 2, q: 'What does this program print?', code: 'graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}\nseen = []\n\ndef dfs(n):\n    if n in seen:\n        return\n    seen.append(n)\n    for nb in graph[n]:\n        dfs(nb)\n\ndfs("A")\nprint(seen)', answer: "['A', 'B', 'D', 'C']",
     wrong: [{ans: "['A', 'B', 'C', 'D']", why: 'That is the breadth-first order. DFS goes from A to B and straight on to D before it comes back to C.', m: 'bfs-dfs'}, {ans: "['A', 'C', 'D', 'B']", why: 'The neighbours of A are tried in list order, B first, so B (and its descendant D) come before C.', m: null}],
     explain: 'dfs(A) marks A, then goes into B, which goes into D. D has no neighbours, so the search backs up to A and tries C. D is already seen, so the order is A, B, D, C.'},
   qs: [
     {q: 'What does BFS from a source vertex find in an unweighted graph?', opts: [
       ok('The path with the fewest edges to every vertex it can reach', 'It explores all vertices at distance 1, then distance 2, and so on, so the first time it reaches a vertex is via a shortest path.'),
       o('The cheapest path when the edges have different weights', 'Weights need Dijkstra\'s algorithm. BFS counts edges, not weights.', null),
       o('The longest path to each vertex', 'BFS finds the shortest paths. Longest-path problems are much harder.', null),
       o('Nothing useful: only DFS can find paths', 'Both can find a path, but only BFS guarantees the one with the fewest edges. DFS may find a long winding one first.', 'bfs-dfs')]},
     {q: 'A graph has V vertices and E edges, stored as an adjacency list. What is the time complexity of BFS or DFS?', opts: [
       ok('O(V + E)', 'Each vertex is processed once and each edge is looked at once (twice for an undirected graph).'),
       o('O(V * E)', 'The searches do not re-scan all edges for every vertex.', null),
       o('O(V^2) always', 'V^2 is the bound for an adjacency matrix, where scanning a row costs V. With a list it depends on the edges.', null),
       o('O(V)', 'That ignores the edges. A graph with many edges takes longer to explore.', null)]},
   ]},

  {id: 'dsa-sort', subject: 'dsa', title: 'Sorting', blurb: 'Bubble, selection, insertion, merge and quick sort',
   lesson: {
     beginner: 'Sorting puts items in order. Simple sorts such as bubble, selection and insertion sort use two nested loops, so they take O(n^2) time in the worst case. Merge sort splits the list in half, sorts each half and merges them, taking O(n log n) every time. Quick sort picks a pivot and partitions the list: it is O(n log n) on average but O(n^2) in the worst case. Insertion sort is O(n) on data that is already sorted.',
     real: 'Sorting a hand of playing cards is insertion sort: you pick up each card and slide it into the right place among the cards you already hold. Merge sort is like two friends each sorting half of a pile and then you interleave the two sorted piles into one.',
     code: `a = [5, 1, 4, 2, 8]
# one pass of bubble sort: the largest value moves to the end
for i in range(len(a) - 1):
    if a[i] > a[i + 1]:
        a[i], a[i + 1] = a[i + 1], a[i]
print(a)    # [1, 4, 2, 5, 8]  (not sorted yet: more passes are needed)`,
     exam: 'Key points: bubble, selection and insertion sort are O(n^2) worst case (insertion and optimised bubble are O(n) best case; selection is always O(n^2)). Merge sort is O(n log n) in every case with O(n) extra space and is stable. Quick sort is O(n log n) average, O(n^2) worst case, in place. Heap sort is O(n log n) worst case. A stable sort keeps equal keys in their original order. Comparison sorts cannot beat O(n log n).'},
   check: {q: 'Bubble sort (ascending) makes its FIRST pass over [5, 1, 4, 2, 8], comparing neighbours from left to right. What does the array look like after that single pass?', opts: [
     ok('[1, 4, 2, 5, 8]', '5 swaps past 1, 4 and 2 and then meets 8, which is bigger, so it stays. One pass only guarantees the largest value reaches the end.'),
     o('[1, 2, 4, 5, 8]', 'That is the fully sorted array. A single pass is not enough; bubble sort needs up to n - 1 passes.', 'sort-early'),
     o('[1, 5, 4, 2, 8]', 'That is the state after only the first comparison. A pass continues all the way along the array.', null),
     o('[8, 5, 4, 2, 1]', 'That is sorted in descending order. The code swaps when the left value is larger, which sorts ascending.', null)]},
   bug: {lvl: 3, q: 'selection_sort([3, 1, 2]) returns [1, 1, 2], so the 3 has been lost. What is missing?', code: 'def selection_sort(a):\n    for i in range(len(a)):\n        m = i\n        for j in range(i + 1, len(a)):\n            if a[j] < a[m]:\n                m = j\n        a[i] = a[m]\n    return a', opts: [
     ok('It copies the minimum into position i but never moves the old a[i] to position m. It needs a swap: a[i], a[m] = a[m], a[i]', 'Overwriting a[i] without saving it destroys that value.'),
     o('The inner loop should start from 0 instead of i + 1', 'Starting from 0 would only re-scan the sorted part. It would not recover the lost value.', null),
     o('The comparison should be <= instead of <', 'Using <= changes which equal item is picked but does not stop a value from being overwritten.', null),
     o('range(len(a)) should be range(len(a) + 1)', 'That would cause an IndexError. The outer loop range is not the problem.', null)]},
   predict: {lvl: 3, q: 'What does this program print?', code: 'a = [4, 3, 2, 1]\nfor i in range(1, len(a)):\n    key = a[i]\n    j = i - 1\n    while j >= 0 and a[j] > key:\n        a[j + 1] = a[j]\n        j -= 1\n    a[j + 1] = key\n    if i == 2:\n        print(a)', answer: '[2, 3, 4, 1]',
     wrong: [{ans: '[1, 2, 3, 4]', why: 'The print happens when i is 2, so the last item (1) has not been inserted yet. Only the first three items are sorted at that moment.', m: 'sort-early'}, {ans: '[3, 4, 2, 1]', why: 'That is the array after i = 1. By the time i == 2 the item 2 has also been inserted into its place.', m: null}],
     explain: 'After i = 1 the array is [3, 4, 2, 1]. For i = 2 the key 2 shifts 4 and 3 right and lands at the front, giving [2, 3, 4, 1]. The item 1 is inserted on the next round.'},
   qs: [
     {q: 'Which of these sorting algorithms guarantees O(n log n) time even in the worst case?', opts: [
       ok('Merge sort', 'It always splits into halves and merges in linear time, so every case is O(n log n).'),
       o('Quick sort', 'Its average case is O(n log n) but a bad pivot choice (for example the smallest item every time) makes the worst case O(n^2).', 'sort-cases'),
       o('Bubble sort', 'Bubble sort is O(n^2) in the worst case.', null),
       o('Insertion sort', 'Insertion sort is O(n^2) in the worst case, for example on reverse-sorted input.', null)]},
     {q: 'What is the best-case time of insertion sort, and when does it happen?', opts: [
       ok('O(n), when the input is already sorted', 'Each new item is compared once with its left neighbour and no shifting is needed.'),
       o('O(n^2): insertion sort always takes quadratic time', 'That is true of selection sort. Insertion sort adapts to nearly sorted input, so its best case is linear.', 'sort-cases'),
       o('O(log n), when the input is already sorted', 'Every item must at least be looked at once, so no sort can be faster than O(n).', null),
       o('O(n log n), when the input is sorted', 'Insertion sort does not split the input, so n log n does not appear.', null)]},
   ]},

  {id: 'dsa-search', subject: 'dsa', title: 'Searching', blurb: 'Linear search, binary search and what it needs',
   lesson: {
     beginner: 'Linear search checks the items one by one until it finds the target or reaches the end. It works on any list and takes O(n). Binary search needs the data to be sorted and random access. It looks at the middle item, then throws away the half that cannot hold the target, so it takes O(log n). Typical code keeps lo and hi, computes mid = (lo + hi) // 2 and loops while lo <= hi.',
     real: 'Looking up a word in a dictionary: you do not read from page one. You open near the middle, see whether your word comes before or after, and repeat on that half. This only works because the words are in alphabetical order. In a shuffled list of words you would have no choice but to check them all.',
     code: `def bsearch(a, x):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == x:
            return mid
        elif a[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(bsearch([2, 4, 6, 8, 10], 8))   # 3`,
     exam: 'Key points: linear search O(n) worst and average, O(1) best, works on unsorted data. Binary search needs sorted data and random access (an array), O(log n) worst and average, O(1) best, and about log2(n) + 1 comparisons at most. Iterative binary search uses O(1) extra space. Use lo <= hi to avoid missing the last candidate. Binary search on a linked list is not efficient.'},
   check: {q: 'What must be true of the data before binary search can be used?', opts: [
     ok('It must be sorted, and you must be able to jump to the middle item', 'The decision to discard half only works if everything on one side of the middle is smaller and everything on the other is larger.'),
     o('Nothing: binary search works on any list', 'On unsorted data, comparing with the middle tells you nothing about which half holds the target, so it can miss items that are present.', 'bin-unsorted'),
     o('It must contain no duplicate values', 'Duplicates do not break binary search. It may return any one of the matching positions.', null),
     o('It must be stored in a linked list', 'A linked list has no fast access to the middle, so binary search is a poor fit there. An array is what you want.', null)]},
   bug: {lvl: 3, q: 'bsearch([1, 3, 5], 5) returns -1 although 5 is in the list. Why?', code: 'def bsearch(a, x):\n    lo, hi = 0, len(a) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] == x:\n            return mid\n        elif a[mid] < x:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1', opts: [
     ok('while lo < hi stops when lo == hi, leaving one candidate unchecked. The loop condition must be lo <= hi', 'Here lo moves to 2 and hi is 2, so the loop ends before a[2] is ever compared.'),
     o('The list must be sorted in descending order', 'The list [1, 3, 5] is already in ascending order, which is what this code expects.', null),
     o('lo = mid + 1 should be lo = mid', 'lo = mid can leave lo unchanged and loop forever. mid + 1 is correct because mid has already been ruled out.', null),
     o('mid should be written (lo + hi) / 2', 'Plain / gives a float in Python 3, which cannot be used as an index. // is correct.', null)]},
   predict: {lvl: 2, q: 'What does this program print?', code: 'a = [2, 4, 6, 8, 10, 12, 14]\nlo, hi = 0, len(a) - 1\nsteps = 0\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    steps += 1\n    if a[mid] == 12:\n        break\n    elif a[mid] < 12:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nprint(steps, mid)', answer: '2 5',
     wrong: [{ans: '6 5', why: 'Six steps is what a linear scan would need to reach 12. Binary search checks the middle first, then the middle of the right half: just 2 looks.', m: null}, {ans: '2 4', why: 'Counting from 0, the value 12 is at index 5 (2, 4, 6, 8, 10 come before it), not index 4.', m: 'zero-index'}],
     explain: 'First mid is 3 (value 8), which is less than 12, so lo becomes 4. Next mid is (4 + 6) // 2 = 5 and a[5] is 12, found after 2 steps.'},
   qs: [
     {q: 'A linear search for a value that is NOT in a list of n items makes how many comparisons?', opts: [
       ok('n: every item has to be checked before we can say it is missing', 'Only after the last item can the search conclude the value is absent.'),
       o('log n', 'That would need binary search on sorted data. A linear search just walks along the list.', null),
       o('1', 'One comparison only settles the first item. The rest could still match.', null),
       o('n / 2', 'n / 2 is the average when the value is present. For a missing value the whole list is scanned.', 'lin-half')]},
     {q: 'About how many comparisons does binary search need, at most, on a sorted array of 1,000,000 items?', opts: [
       ok('About 20', 'Each step halves the range, and 2^20 is 1,048,576, which is just over a million.'),
       o('About 500,000', 'That is the average for scanning one by one. Binary search discards half the items at every step.', 'bin-scan'),
       o('About 1,000,000', 'That is the worst case for linear search.', 'bin-scan'),
       o('About 1,000', 'That is the square root, which is not how binary search shrinks the problem. It halves the range each time.', null)]},
   ]},

  {id: 'dsa-complexity', subject: 'dsa', title: 'Time complexity (Big-O)', blurb: 'How running time grows with input size',
   lesson: {
     beginner: 'Big-O describes how the running time of an algorithm grows as the input size n gets large. It ignores constants and lower-order terms, so 3n + 10 is O(n) and n^2 + n is O(n^2). Common classes from slow growth to fast growth: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n). Loops one after another add their costs, and nested loops multiply them.',
     real: 'Imagine handing out sweets. If you give one to each of n children, the work grows in step with n. If every child must shake hands with every other child, the work grows like n times n. Doubling the class size doubles the first job but quadruples the second. Big-O is a description of that growth, not a stopwatch time.',
     code: `def f(a):                  # a has n items
    total = 0
    for x in a:            # n steps
        total += x
    for x in a:            # n steps
        for y in a:        # n steps for each x: n * n
            total += x * y
    return total           # n + n^2  ->  O(n^2)`,
     exam: 'Key points: Big-O is an upper bound on growth; Omega is a lower bound; Theta is a tight bound. Drop constants and lower-order terms. Sequential blocks add, nested loops multiply. A loop that halves or doubles its variable is O(log n). Order: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n). Best, average and worst cases can differ. Space complexity counts extra memory.'},
   check: {q: 'What does saying an algorithm is O(n) tell you?', opts: [
     ok('Its running time grows in proportion to the input size n, for large n', 'Doubling the input roughly doubles the work. Constants are ignored.'),
     o('It takes exactly n seconds', 'Big-O is not an exact time. The real time depends on the machine and the constant factors.', 'bigo-exact'),
     o('It is faster than every O(n^2) algorithm for every input size', 'Big-O only describes growth for large n. For small inputs an O(n^2) algorithm with a tiny constant can win.', 'bigo-exact'),
     o('It uses n bytes of memory', 'Big-O of time says nothing about memory. Space complexity is analysed separately.', null)]},
   bug: {lvl: 2, q: 'A student says this function is O(n) because it has just one statement inside the loops. What is the real time complexity, and why?', code: 'def count_pairs(a):\n    c = 0\n    for i in a:\n        for j in a:\n            c += 1\n    return c', opts: [
     ok('O(n^2): the inner loop runs n times for each of the n outer iterations, and the nested costs multiply', 'The statement c += 1 runs n * n times.'),
     o('O(n): there is only one statement in the body', 'The number of statements in the body does not matter. What matters is how many times the body runs, which is n * n.', null),
     o('O(2n): the two loops add up', 'Adding applies to loops one after the other. These loops are nested, so the costs multiply.', 'loops-add'),
     o('O(log n): the loops get shorter', 'Nothing here halves the range. Both loops always run n times.', null)]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'n = 16\ncount = 0\nwhile n > 1:\n    n = n // 2\n    count += 1\nprint(count)', answer: '4',
     wrong: [{ans: '16', why: 'n is halved each round, not reduced by one. 16 becomes 8, 4, 2, 1 in only four rounds.', m: null}, {ans: '8', why: 'The loop stops when n reaches 1. Halving 16 four times gets there: 8, 4, 2, 1.', m: null}],
     explain: 'n goes 16 to 8 to 4 to 2 to 1, which is 4 halvings. A loop that halves n is O(log n), and log2(16) = 4.'},
   qs: [
     {q: 'A function has a pair of nested loops (each runs n times) followed by a separate single loop that runs n times. What is its overall time complexity?', opts: [
       ok('O(n^2): the n^2 term dominates and the extra n is dropped', 'The total is n^2 + n, and Big-O keeps only the fastest-growing term.'),
       o('O(n^3): all three loops multiply together', 'Only nested loops multiply. The last loop comes after them, so its cost is added: n^2 + n.', null),
       o('O(n^2 + n), which is a different class from O(n^2)', 'Lower-order terms are dropped in Big-O, so n^2 + n is simply O(n^2).', null),
       o('O(n)', 'The nested pair already costs n * n, which grows faster than n.', null)]},
     {q: 'Which list is ordered from the slowest-growing to the fastest-growing complexity?', opts: [
       ok('O(1), O(log n), O(n), O(n log n), O(n^2)', 'Constant, logarithmic, linear, linearithmic, quadratic: each class grows faster than the one before.'),
       o('O(1), O(n), O(log n), O(n^2), O(n log n)', 'log n grows slower than n, and n log n grows slower than n^2, so two pairs are swapped.', null),
       o('O(log n), O(1), O(n log n), O(n), O(n^2)', 'O(1) is the slowest-growing, and n grows slower than n log n.', null),
       o('O(1), O(log n), O(n^2), O(n log n), O(n)', 'n^2 grows faster than both n log n and n, so it cannot sit in the middle.', null)]},
   ]},

  {id: 'dsa-hash', subject: 'dsa', title: 'Hashing and hash tables', blurb: 'Keys to slots, and what happens when two keys collide',
   lesson: {
     beginner: 'A hash table stores key-value pairs in an array. A hash function turns a key into a slot number, for example key % size, so a lookup can jump straight to the right slot: O(1) on average. Because there are more possible keys than slots, two different keys can land in the same slot. That is a collision. Chaining (a list in each slot) and open addressing such as linear probing (try the next free slot) both handle it. If many keys collide, a lookup can degrade to O(n). In Python, dict and set are hash tables.',
     real: 'A hotel with numbered pigeonholes at reception. The clerk uses the last digit of your room number to choose the pigeonhole, so finding your key is quick. If two guests have rooms ending in the same digit, they share a pigeonhole and the clerk must check the few keys inside. If everyone shares one hole, the clerk is back to searching through the whole pile.',
     code: `size = 5
table = [[] for _ in range(size)]   # chaining: a list per slot

def put(key, val):
    table[key % size].append((key, val))

put(3, "a")
put(8, "b")            # 8 % 5 == 3: collision, shares slot 3
print(table[3])        # [(3, 'a'), (8, 'b')]

d = {}
d["x"] = 1             # Python dict: a hash table
print("x" in d)        # True, average O(1)`,
     exam: 'Key points: hash function h(k) = k mod m; load factor = n / m. Collision resolution: separate chaining and open addressing (linear probing, quadratic probing, double hashing). Average search, insert and delete are O(1); worst case O(n) when all keys collide. A hash table does not keep keys in sorted order. Good hash functions spread keys evenly and are fast to compute. Rehashing grows the table when the load factor gets too high.'},
   check: {q: 'Which statement about hash collisions is correct?', opts: [
     ok('Different keys can map to the same slot, so the table needs a collision strategy such as chaining or probing', 'There are far more possible keys than slots, so collisions cannot be avoided in general.'),
     o('A good hash function guarantees that no two keys ever collide', 'A good hash function spreads keys evenly and so reduces collisions, but with more possible keys than slots some must collide.', 'no-collision'),
     o('Collisions only happen when the table is completely empty', 'Collisions happen when a new key lands on an occupied slot, which is more likely as the table fills up.', null),
     o('A collision always stops a Python program with an error', 'Python\'s dict handles collisions internally. You never see them.', null)]},
   bug: {lvl: 2, q: 'The keys 3 and 8 are stored, then table[3] is read and returns "b" instead of "a". Why?', code: 'table = [None] * 5\n\ndef put(key, val):\n    table[key % 5] = val\n\nput(3, "a")\nput(8, "b")\nprint(table[3])', opts: [
     ok('3 % 5 and 8 % 5 are both 3, so the keys collide and the second value overwrote the first. The table needs chaining or probing', 'Each slot here holds one value, so a colliding key has nowhere to go.'),
     o('% should be replaced by // so that different keys get different slots', 'Any hash function onto 5 slots will map some keys together when there are more than 5 keys possible. Changing the operator does not remove collisions.', 'no-collision'),
     o('Python lists forget older values after two writes', 'Lists keep their values until they are overwritten. Here, the same slot was written twice.', null),
     o('The keys should have been stored at index 3 and index 8', 'The table has only 5 slots, so index 8 would raise an IndexError.', null)]},
   predict: {lvl: 1, q: 'What does this program print?', code: 'd = {}\nd["b"] = 1\nd["a"] = 2\nd["b"] = 3\nprint(len(d), d["b"])', answer: '2 3',
     wrong: [{ans: '3 3', why: 'Assigning to the existing key "b" replaces its value. It does not add a third entry, so the dictionary has 2 keys.', m: 'hash-dup'}, {ans: '2 1', why: 'The later assignment d["b"] = 3 overwrote the earlier value 1.', m: null}],
     explain: 'A dictionary holds one value per key. The second assignment to "b" replaces 1 with 3, so there are two keys (b and a) and d["b"] is 3.'},
   qs: [
     {q: 'What is the average-case time to look up a key in a hash table with a good hash function and a small load factor?', opts: [
       ok('O(1)', 'The hash function gives the slot directly and only a few keys share it.'),
       o('O(log n), because the keys are kept in sorted order', 'A hash table does not keep keys sorted. A sorted structure such as a balanced BST would give O(log n).', 'hash-sorted'),
       o('O(n), because every key must be checked', 'That happens only in the worst case, when everything collides. On average only a few keys share a slot.', null),
       o('O(n log n)', 'A single lookup is never that slow. n log n is typical for sorting all the keys.', null)]},
     {q: 'A hash table uses chaining and all n keys happen to hash to the same slot. What is the worst-case time for a lookup?', opts: [
       ok('O(n): the one long chain has to be scanned', 'With every key in a single chain, the table behaves like a linked list.'),
       o('O(1): a hash table is always constant time', 'Constant time is the average case with few collisions. When everything collides, the lookup degrades.', 'hash-o1'),
       o('O(log n)', 'A chain is scanned item by item, with no halving, so it is not logarithmic.', null),
       o('O(n^2)', 'One chain of n items is scanned once, which is n steps, not n squared.', null)]},
   ]},
];

const SUBJECTS = {python: {label: 'Python', icon: '🐍'}, sql: {label: 'SQL', icon: '🗄️'}, dsa: {label: 'DSA', icon: '🌳', note: 'Data Structures and Algorithms (course code CSPC302)'}};
const VARIANTS = [['beginner', 'Beginner'], ['real', 'Real-life example'], ['code', 'Code-based'], ['exam', 'Exam-oriented']];

if (typeof module !== 'undefined' && module.exports) module.exports = {CONCEPTS, MIS, SQL_SEED, SUBJECTS, VARIANTS};
