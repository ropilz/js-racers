export class Mutex {
  #pool;

  constructor () {
    this.#pool = new Map();
  }

  lock (name) {
    if (!this.#pool.has(name)) {
      const handler = {};
      handler.promise = new Promise((resolve, reject) => {
        handler.resolve = resolve;
        handler.reject = reject;
      });
      this.#pool.set(name, handler);
      return true;
    } else {
      return false;
    }
  }

  wait (name, callback) {
    if (!this.#pool.has(name)) {
      this.lock(name);
    }
    const promise = this.#pool.get(name).promise;
    if (callback) {
      promise.then((...args) => callback(undefined, ...args));
    }
    return promise;
  }

  release (name, ...args) {
    if (!this.#pool.has(name)) {
      return false;
    } else {
      this.#pool.get(name).resolve(...args);
      this.#pool.delete(name)
      return true;
    }
  }

  failAll (error) {
    const pool = this.#pool;
    this.#pool.clear();
    Object.values(pool).forEach(handler => {
      if (handler && handler.reject) {
        handler.reject(error);
      }
    });
  }

  fail (name, error) {
    if (!this.#pool.has(name)) {
      return false;
    } else {
      this.#pool.get(name).reject(error);
      this.#pool.delete(name);
      return true;
    }
  }
}
  