import {html, render} from 'https://cdn.pika.dev/lit-html/v1';
import {runnerPool} from './runner.js';

class JsGrapher extends HTMLElement {
  width = 400;
  height = 200;
  #max = 0;
  #min = 0;
  #ctx = null;
  #intervalHandle;
  static get observedAttributes() { return ['arg1', 'arg2', 'arg3']; }

  constructor () {
    super();
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.#ctx = canvas.getContext('2d');
    render(html`<div>${canvas}</div>`, this);
  }

  getNewValue(runner) {
    const ops = runner.getOps();
    runner.restartCache();
    if (ops > this.#max) { this.#max = ops; }
    if (ops < this.#min) { this.#min = ops; }
    if (runner.values.length == 100) {
      runner.values.shift();
    }
    runner.values.push(ops);
  }

  drawGraph(runner) {
    const {id, values, color} = runner;
    this.#ctx.strokeStyle = color;
    this.#ctx.beginPath();
  
    const offset = 100 - values.length;
    let first = true;
    for (const [idx, value] of Object.entries(values)) {
      const x = (+idx+offset) * 4;
      const y =
        (this.height * 0.1) +
        (value - this.#min) / (this.#max - this.#min) *
        (this.height * 0.8);
      if (y < 0 || y > this.height) {
        debugger;
      }
      if (first) {
        first = false;
        this.#ctx.moveTo(x, this.height - y);
      } else {
        this.#ctx.lineTo(x, this.height - y);
      }
    }
    this.#ctx.stroke();
    this.#ctx.closePath();
  }

  getRunners () {
    const runners = [];
    const colors = ['red', 'blue', 'green'];
    for (const idx of [1,2,3]) {
      const fn = this.getAttribute(`runner${idx}`);
      if (fn) {
        const runner = runnerPool[fn];
        runner.color = colors.shift();
        runner.values = [];
        runner.start();
        runners.push(runner);
      }
    }
    return runners;
  }

  connectedCallback () {
    
    const runners = this.getRunners();

    this.#intervalHandle = setInterval(() => {
      for (const runner of runners) {
        this.getNewValue(runner);
      }
      this.#ctx.clearRect(0, 0, this.width, this.height);
      for (const runner of runners) {
        this.drawGraph(runner);
      }
      
    }, 1000);
  }

  disconnectedCallback () {
    clearInterval(this.#intervalHandle);
  }

  attributeChangedCallback () {
    console.log('PARAMS', arguments);
  }

}
customElements.define('js-grapher', JsGrapher);