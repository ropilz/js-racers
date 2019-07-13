import {Mutex} from './mutex.js';

export function createWorker (code) {
  const mtx = new Mutex();
  if (typeof code === 'string') {
    code = `function () { ${code} }`;
  }
  const worker = new Worker (`data:, $$=${code}; onmessage=${
    (async (u) => {
      let {params, id, times} = u.data;
      const start = performance.now();
      while (times--) {
        $$.call($$, params)
      }
      const end = performance.now();
      postMessage({time: end - start, id});
    })
  }`);

  worker.onmessage = (e) => {
    const {time, id} = e.data;
    mtx.release(id, time);
  }

  let gid = 0;
  return async function (params, times) {
    const id = gid++;
    worker.postMessage({params, id, times})
    const time = await mtx.wait(id);
    return time;
  }
}