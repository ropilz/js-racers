import {html, render} from 'https://cdn.pika.dev/lit-html/v1';
import {Runner} from './runner.js';
import './grapher.js';

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
test.color = 'red';

const test2 = new Runner((obj) => {
    let a = obj.a + obj.b;
}, objects[0]);
test2.color = 'green';

let iteration = 0

document.body.addEventListener('click', () => {
    iteration += 1;
    test2.setArg(objects[iteration]);
});

test.start();
test2.start();

const target = document.getElementById('canvas2');
render(html`
  <js-grapher runner1=${test.id} runner2=${test2.id}></js-grapher>`
, target);
