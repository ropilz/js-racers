import {createWorker} from './worker.js';
export const runnerPool = {};

let gid = -1;


export class Runner {
  id = ++gid;
  times = 100000000;
  #worker;
  #arg;
  #fn;

  results = [];
  values = new Array(100).fill(0);

  constructor (fn, arg) {
    this.#fn = fn;
    this.#worker = createWorker(fn);
    this.#arg = arg;
    runnerPool[this.id] = this;
  }

  set arg (arg) {
    this.#arg = arg;
  }

  get arg () {
    return this.#arg;
  }

  get code () {
    return `${this.#fn}`;
  }

  run () {
    return this.#worker(this.#arg, this.times);
  }

  async start () {
    while (true) {
      const total = await this.run();
      this.results.push(total);
    }
  }

  getTime () {
    const newValue = Math.max.apply(0, this.results);
    this.results = [];
    return Math.ceil(this.times / newValue);
  }
}
