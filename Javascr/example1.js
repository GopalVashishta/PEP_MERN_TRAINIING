// JavaScript mini-tutorial (run: `node example1.js`)
// Each section shows one core concept with a small example.

"use strict";

// 0) Output (console)
console.log("Hello, World!");

// 1) Variables: let / const / var
// - const: cannot be reassigned (but objects can still be mutated)
// - let: block-scoped, can be reassigned
// - var: function-scoped (older style; avoid in modern code)
const appName = "JS Basics";
let counter = 0;
var legacy = "var is function-scoped";
counter += 1;
console.log({ appName, counter, legacy });

// 2) Data types: string, number, boolean, null, undefined, bigint, symbol, object
const aString = "text";
const aNumber = 42;
const aBoolean = true;
const aNull = null;
let anUndefined;
const aBigInt = 9007199254740993n;
const aSymbol = Symbol("id");
const anObject = { kind: "object" };
console.log(typeof aString, typeof aNumber, typeof aBoolean);
console.log(aNull, typeof aNull, anUndefined, typeof anUndefined); // typeof null is a historical quirk
console.log(typeof aBigInt, typeof aSymbol, typeof anObject);

// 3) Operators: arithmetic, comparison, equality
console.log(5 + 2, 5 - 2, 5 * 2, 5 / 2, 5 % 2);
console.log(3 > 2, 3 >= 3, 3 < 2);
// Prefer === / !== (strict) over == / != (loose)
console.log(0 === false, 0 == false);

// 4) Strings: template literals
const name = "Asus";
console.log(`Hi ${name}, welcome to ${appName}!`);

// 5) Conditionals: if/else + ternary
const age = 18;
if (age >= 18) {
	console.log("Adult");
} else {
	console.log("Minor");
}
const canVote = age >= 18 ? "Yes" : "No";
console.log("Can vote?", canVote);

// 6) Switch
const day = "Mon";
switch (day) {
	case "Mon":
		console.log("Start of week");
		break;
	case "Sat":
	case "Sun":
		console.log("Weekend");
		break;
	default:
		console.log("Midweek");
}

// 7) Loops: for, while, for...of, for...in
for (let i = 0; i < 3; i += 1) {
	console.log("for i:", i);
}

let n = 0;
while (n < 2) {
	console.log("while n:", n);
	n += 1;
}

const fruits = ["apple", "banana", "mango"];
for (const fruit of fruits) {
	console.log("for...of fruit:", fruit);
}

const person = { firstName: "Ada", lastName: "Lovelace" };
for (const key in person) {
	console.log("for...in", key, "=", person[key]);
}

// 8) Functions: declaration, expression, arrow
function add(x=0, y=0) {
	return x + y;
}
const multiply = function (x, y) {
	return x * y;
};
const subtract = (x, y) => x - y;
console.log(add(2, 3), multiply(2, 3), subtract(10, 4));

// 9) Default parameters + rest parameters
function greet(user = "friend") {
	return `Hello, ${user}`;
}
function sumAll(...nums) {
	return nums.reduce((acc, val) => acc + val, 0);
}
console.log(greet(), greet("Sana"));
console.log(sumAll(1, 2, 3, 4));

// 10) Scope: block scope vs function scope
{
	const insideBlock = "only inside this block";
	console.log(insideBlock);
}
// console.log(insideBlock); // Uncomment to see ReferenceError

// 11) Arrays: push/pop, map/filter/reduce, find, includes
const numbers = [1, 2, 3, 4, 5];
numbers.push(6);
numbers.pop();
console.log("numbers:", numbers);

const squared = numbers.map((x) => x * x);
const evens = numbers.filter((x) => x % 2 === 0);
const total = numbers.reduce((acc, x) => acc + x, 0);
console.log({ squared, evens, total });
console.log(numbers.find((x) => x > 3), numbers.includes(3));

// 12) Objects: properties, methods, optional chaining
const car = {
	brand: "Toyota",
	model: "Corolla",
	start() {
		return `${this.brand} ${this.model} started`;
	},
};
console.log(car.start());
console.log(car.owner?.name); // undefined instead of crash

// 13) Destructuring + spread
const { brand, model } = car;
console.log("destructured:", brand, model);

const moreNumbers = [...numbers, 99, 100];
console.log("spread array:", moreNumbers);

const carWithYear = { ...car, year: 2026 };
console.log("spread object:", carWithYear);

const [firstFruit, , thirdFruit = "pear"] = fruits;
console.log("array destructuring:", firstFruit, thirdFruit);

// 14) JSON
const jsonText = JSON.stringify(carWithYear);
const parsed = JSON.parse(jsonText);
console.log("json:", jsonText);
console.log("parsed:", parsed);

// 15) Errors: try/catch/finally + throw
function parseNumber(text) {
	const value = Number(text);
	if (Number.isNaN(value)) {
		throw new Error(`Not a number: ${text}`);
	}
	return value;
}

try {
	console.log("parsed:", parseNumber("123"));
	console.log("parsed:", parseNumber("abc"));
} catch (err) {
	console.log("caught error:", err.message);
} finally {
	console.log("finally runs no matter what");
}

// 16) Promises + async/await
function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function demoAsync() {
	console.log("async: start");
	await wait(100);
	console.log("async: after 100ms");
	return "done";
}

demoAsync()
	.then((result) => console.log("async result:", result))
	.catch((err) => console.error("async error:", err));

// 17) Classes
class Rectangle {
	constructor(width, height) {
		this.width = width;
		this.height = height;
	}
	area() {
		return this.width * this.height;
	}
}
const rect = new Rectangle(3, 4);
console.log("rect area:", rect.area());

// 18) Modules (note)
// In Node.js, you can use ES Modules by setting "type": "module" in package.json
// then: export/import between files. This single file stays CommonJS-compatible.

// 19) Truthy/falsy + logical operators (||, &&, ??)
const maybeEmpty = "";
console.log(Boolean(maybeEmpty), maybeEmpty || "fallback", maybeEmpty ?? "nullish fallback");
console.log(true && "runs second", false && "skipped");

// 20) Set and Map
const pets = new Set(["cat", "dog", "cat"]); // duplicates drop
pets.add("parrot");
console.log("set size:", pets.size, pets.has("dog"));

const scores = new Map([
	["math", 95],
	["english", 88],
]);
scores.set("science", 91);
console.log("map get:", scores.get("science"));

// 21) Array helpers: some/every/findIndex/sort
console.log("some > 4:", numbers.some((n) => n > 4));
console.log("every > 0:", numbers.every((n) => n > 0));
console.log("findIndex of 3:", numbers.findIndex((n) => n === 3));
const sorted = [...numbers].sort((a, b) => b - a);
console.log("sorted desc:", sorted);

// 22) Closures: inner function keeps access to outer scope
function makeCounter() {
	let count = 0;
	return function () {
		count += 1;
		return count;
	};
}
const counterA = makeCounter();
console.log(counterA(), counterA(), counterA());

// 23) this + call/bind
const greeter = {
	prefix: "Hi",
	say(name) {
		return `${this.prefix}, ${name}`;
	},
};
const looseSay = greeter.say;
console.log(looseSay.call(greeter, "Neo")); // call sets this
const boundSay = greeter.say.bind(greeter);
console.log(boundSay("Trinity"));

// 24) Promise.all (run tasks in parallel)
const p1 = wait(50).then(() => "p1 done");
const p2 = wait(30).then(() => "p2 done");
Promise.all([p1, p2]).then((vals) => console.log("promise all:", vals));

// 25) Dates + Intl formatting
const now = new Date();
console.log("iso now:", now.toISOString());
const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
console.log("formatted:", fmt.format(now));

console.log("\nDone. Try editing values and re-running to learn!");
