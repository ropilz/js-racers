import {html, render} from 'https://cdn.pika.dev/lit-html/v1';
import {runnerPool} from './runner.js';
// import highlight from 'https://cdn.pika.dev/h.js/v4';
import {highlight} from 'https://cdn.pika.dev/reprism/v0.0';

class JsGrapher extends HTMLElement {
  width = 400;
  height = 200;
  #max = 0;
  #min = 0;
  #ctx = null;
  #intervalHandle;
  #canvas;
  #argsDomMap = new Map();
  #functionDomMap = new Map();

  static get observedAttributes() { return ['arg1', 'arg2', 'arg3']; }

  constructor () {
    super();
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.#ctx = canvas.getContext('2d');
    render(html`<div>${canvas}</div>`, this);
    this.#canvas = canvas;
  }

  getNewValue(runner) {
    const ops = runner.getTime();
    // runner.restartCache();
    if (ops > this.#max) { this.#max = ops; }
    if (ops < this.#min) { this.#min = ops; }
    if (runner.values.length == 100) {
      runner.values.shift();
    }
    runner.values.push(ops);
  }

  getArgDom ({arg, color}) {
    // const map = this.#argsDomMap;
    // if (!map.has(arg)) {
      const container = document.createElement('div');
      container.innerHTML = highlight(JSON.stringify(arg), 'js');

      return html`
        <div class="chart-code-liner">
          <div class="chart-dot" style="background-color: ${color}"></div>
          ${container}
        </div>
      `;
    // }
    // return map.get(arg);
  }

  getFunctionDom ({code}) {
    const map = this.#functionDomMap;
    if (!map.has(code)) {
      const container = document.createElement('div');
      container.innerHTML = highlight(code, 'js');
      map.set(code, container);
    }
    return map.get(code);
  }

  drawGraph(runner) {
    const {id, values, color, arg, code} = runner;
    this.#ctx.strokeStyle = color;
    this.#ctx.beginPath();
  
    const offset = 100 - values.length;
    let first = true;
    for (const [idx, value] of Object.entries(values)) {
      const x = (+idx+offset) * 4;
      const y =
        (this.height * 0.05) +
        (value - this.#min) / (this.#max - this.#min) *
        (this.height * 0.9);
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
    const colors = ['#845BC9', '#5AC5DB', '#A72921', ];
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
      const args = runners.map(r => this.getArgDom(r));
      const funcs = runners.map(r => this.getFunctionDom(r));
      render(html`
        <div>
          ${this.#canvas}
        </div>
        <h2>Argumentos</h2>
        ${args}
        <h2>Código</h2>
        ${funcs}
      `, this);
      
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