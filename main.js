import greenlet from 'https://cdn.pika.dev/greenlet/v1';


class Runner {
    #greenlet;
    constructor (fn) {
        this.#greenlet = greenlet(fn);
    }

    run (args) {
        return this.#greenlet(args);
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

const test = new Runner((jj) => {
    function test (obj) {
        let a = obj.a + obj.b;
    }
    const start = performance.now();
    for (let i = 0; i < 100000000; i += 1) {
        test(jj);
    }
    const end = performance.now();
    const total = end - start;
    return total;
});

const test2 = new Runner((jj) => {
    function test (obj) {
        let a = obj.a + obj.b;
    }
    const start = performance.now();
    for (let i = 0; i < 100000000; i += 1) {
        test(jj);
    }
    const end = performance.now();
    const total = end - start;
    return total;
});


let results2 = [];

let results = [];

const values = new Array(100).fill(0);
const values2 = new Array(100).fill(0);

let iteration = 0

document.body.addEventListener('click', () => {
    iteration += 1;
});

async function runner1 () {
    let max = 0;
    while (true) {
        const total = await test.run(objects[0]);
        results.push(total);
        if (total > max) {
            max = total;
        }
    }
}

async function runner2 () {
    let max = 0;
    while (true) {
        const total = await test2.run(objects[iteration]);
        results2.push(total);
        if (total > max) {
            max = total;
        }
    }
}

runner1();
runner2();

let max = 0;

setInterval(() => {
    const newValue = Math.max.apply(0, results);
    const newValue2 = Math.max.apply(0, results2);
    if (newValue > max) { max = newValue; }
    if (newValue2 > max) { max = newValue2; }
    results = [];
    results2 = [];
    values.shift();
    values.push(newValue);

    values2.shift();
    values2.push(newValue2);
    ctx.clearRect(0, 0, 400, 100);
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    // ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.strokeStyle = `red`;
    ctx.beginPath();
    ctx.moveTo(0, 100 - values[0]);
    for (const [idx, value] of Object.entries(values)) {
        ctx.lineTo(idx * 4, 100 - (value / max) * 100);
    }
    ctx.stroke();
    ctx.closePath();


    ctx.strokeStyle = `green`;
    ctx.beginPath();
    ctx.moveTo(0, 100 - values2[0]);
    for (const [idx, value] of Object.entries(values2)) {
        ctx.lineTo(idx * 4, 100 - (value / max) * 100);
    }
    ctx.stroke();
    ctx.closePath();
}, 500);
