import {createWorker} from './worker.js';
export const runnerPool = {};

let gid = -1;

export class Runner {
  static runCount = 10000000;

  #args = [];
  #cache = [];
  #runner;
  #running = false;
  id = ++gid;

  constructor (test, ...args) {
    this.#args = args;
    this.#runner = createWorker(test);
    runnerPool[this.id] = this;
  }

  async start () {
    this.#running = true;
    while (this.#running) {
      await this.run();
    }
  }

  stop () {
    this.#running = false;
  }

  updateArgs (...args) {
    this.#args = args;
  }

  restartCache () {
    this.#cache = [];
  }

  getTime () {
    const maxTime = Math.max.apply(0, [0, ...this.#cache]);
    return maxTime;
  }

  getOps () {
    let totalTime = 0;
    for (const val of this.#cache) { totalTime += val; }
    const totalOps = this.#cache.length * Runner.runCount;
    return totalOps / (totalTime);
  }

  async run () {
    if (!this.#runner) { return; }
    const time = await this.#runner(this.#args, Runner.runCount);
    this.#cache.push(time);
  }
}