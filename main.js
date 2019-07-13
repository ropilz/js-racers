import {createWorker} from './worker.js';


class Runner {
  times = 1000000;
  #worker;
  #arg;

  results = [];
  values = new Array(100).fill(0);

  constructor (fn, arg) {
    this.#worker = createWorker(fn);
    this.#arg = arg;
  }

  setArg (arg) {
    this.#arg = arg;
  }

  run () {
    return this.#worker(this.#arg, this.times);
  }

  async start () {
    while (true) {
        const total = await this.run(objects[0]);
        this.results.push(total);
    }
  }

  getTime () {
    const newValue = Math.max.apply(0, this.results);
    this.results = [];
    return newValue;
  }
}

const ctx = document.getElementById('graph').getContext('2d');

let objects = [
    {a: 0, b: 6},
    {a: 1, b: 6, c: 7},
    {a: 2, b: 6, d: 7},
    {a: 3, b: 6, e: 7},
    {a: 4, b: 6, f: 7},
    {a: 5, b: 6, g: 7},
    {a: 6, b: 6, h: 7},
    {a: 7, b: 6, i: 7},
    {a: 8, b: 6, j: 7},
    {a: 9, b: 6, k: 7}
];

const test = new Runner((obj) => {
    let a = obj.a + obj.b;
}, objects[0]);

const test2 = new Runner((obj) => {
    let a = obj.a + obj.b;
}, objects[0]);

let iteration = 0

document.body.addEventListener('click', () => {
    iteration += 1;
    test2.setArg(objects[iteration]);
});

test.start();
test2.start();

let max = 0;

setInterval(() => {
    const newValue = test.getTime();
    const newValue2 = test2.getTime();
    if (newValue > max) { max = newValue; }
    if (newValue2 > max) { max = newValue2; }
    test.values.shift();
    test.values.push(newValue);

    test2.values.shift();
    test2.values.push(newValue2);
    ctx.clearRect(0, 0, 400, 100);
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    // ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.strokeStyle = `red`;
    ctx.beginPath();
    ctx.moveTo(0, 100 - test.values[0]);
    for (const [idx, value] of Object.entries(test.values)) {
        ctx.lineTo(idx * 4, 100 - (value / max) * 100);
    }
    ctx.stroke();
    ctx.closePath();


    ctx.strokeStyle = `green`;
    ctx.beginPath();
    ctx.moveTo(0, 100 - test2.values[0]);
    for (const [idx, value] of Object.entries(test2.values)) {
        ctx.lineTo(idx * 4, 100 - (value / max) * 100);
    }
    ctx.stroke();
    ctx.closePath();
}, 500);
