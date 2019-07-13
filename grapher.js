import {html, render} from 'https://cdn.pika.dev/lit-html/v1';
import {runnerPool} from './runner.js';
// import highlight from 'https://cdn.pika.dev/h.js/v4';
import {highlight} from 'https://cdn.pika.dev/reprism/v0.0';

const MARKER_WIDTH = 5;
const DENSITY = 4;
const LINE_WIDTH = 8;
class JsGrapher extends HTMLElement {
  width = 400;
  height = 200;
  cwidth = this.width * DENSITY;
  cheight = this.height * DENSITY;
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
    canvas.width = this.cwidth + MARKER_WIDTH * DENSITY;
    canvas.height = this.cheight + MARKER_WIDTH * DENSITY;
    canvas.style.width = `${this.width + MARKER_WIDTH * DENSITY}px`;
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
    this.#ctx.lineWidth = LINE_WIDTH;
    this.#ctx.beginPath();
  
    const offset = 100 - values.length;
    const tickDistance = this.cwidth / 100;
    let first = true;
    let helperHeight = 0;
    for (const [idx, value] of Object.entries(values)) {
      const x = (+idx+offset) * tickDistance;
      const y =
        (this.cheight * 0.10) +
        (value - this.#min) / (this.#max - this.#min) *
        (this.cheight * 0.8);
      helperHeight = this.cheight - y;
      if (y < 0 || y > this.cheight) {
        debugger;
      }
      if (first) {
        first = false;
        this.#ctx.moveTo(MARKER_WIDTH * DENSITY + x, this.cheight - y);
      } else {
        this.#ctx.lineTo(MARKER_WIDTH * DENSITY + x, this.cheight - y);
      }
    }
    this.#ctx.stroke();
    this.#ctx.closePath();

    // draw horizontal bar
    this.#ctx.strokeStyle = '#8F9A9F';
    this.#ctx.beginPath();
    this.#ctx.moveTo(MARKER_WIDTH * DENSITY, this.cheight - MARKER_WIDTH * DENSITY);
    this.#ctx.lineTo(this.cwidth, this.cheight - MARKER_WIDTH * DENSITY);
    this.#ctx.stroke();
    this.#ctx.closePath();
    
    // draw vertival line
    this.#ctx.beginPath();
    this.#ctx.moveTo(MARKER_WIDTH * DENSITY, 0);
    this.#ctx.lineTo(MARKER_WIDTH * DENSITY, this.cheight - MARKER_WIDTH * DENSITY);
    this.#ctx.stroke();
    this.#ctx.closePath();
    this.#ctx.lineWidth = LINE_WIDTH / 2;

    for (let i = 0; i < 49; i += 1) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(MARKER_WIDTH * DENSITY + (i + 1) * tickDistance * 2, this.cheight - MARKER_WIDTH * DENSITY);
      this.#ctx.lineTo(MARKER_WIDTH * DENSITY + (i + 1) * tickDistance * 2, this.cheight);
      this.#ctx.stroke();
      this.#ctx.closePath();
    }
    const vlineHeight = this.cheight - MARKER_WIDTH * DENSITY;
    const vticks = [vlineHeight * 0.1, vlineHeight / 2, vlineHeight * 0.9];

    for (const tick of vticks) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(0, tick);
      this.#ctx.lineTo(MARKER_WIDTH * DENSITY, tick);
      this.#ctx.stroke();
      this.#ctx.closePath();
    }
    this.#ctx.lineWidth = LINE_WIDTH / 4;
    this.#ctx.beginPath();
    this.#ctx.moveTo(MARKER_WIDTH * DENSITY, helperHeight);
    this.#ctx.lineTo(this.cwidth, helperHeight);
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
      this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.width);
      for (const runner of runners) {
        this.drawGraph(runner);
      }
      const args = runners.map(r => this.getArgDom(r));
      const funcs = runners.map(r => this.getFunctionDom(r));
      render(html`
        <div class="chart">
          <div class="chart-marks">
            <p class="chart-mark">${this.#max}</p>
            <p class="chart-mark">${Math.ceil((this.#max + this.#min)/2)}</p>
            <p class="chart-mark">${Math.ceil(this.#max * 0.1)}</p>
          </div>
          <div>
            ${this.#canvas}
          </div>
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