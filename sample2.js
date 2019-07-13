let objects = [
    {a: 0, b: 6, c: undefined, d: undefined, e: undefined, f: undefined, g: undefined, h: undefined, i: undefined, j: undefined, k: undefined},
    {a: 0, b: 6, c: 7, d: undefined, e: undefined, f: undefined, g: undefined, h: undefined, i: undefined, j: undefined, k: undefined},
    {a: 0, b: 6, c: undefined, d: 7, e: undefined, f: undefined, g: undefined, h: undefined, i: undefined, j: undefined, k: undefined},
    {a: 0, b: 6, c: undefined, d: undefined, e: 7, f: undefined, g: undefined, h: undefined, i: undefined, j: undefined, k: undefined},
    {a: 0, b: 6, c: undefined, d: undefined, e: undefined, f: 7, g: undefined, h: undefined, i: undefined, j: undefined, k: undefined},
    {a: 0, b: 6, c: undefined, d: undefined, e: undefined, f: undefined, g: 7, h: undefined, i: undefined, j: undefined, k: undefined},
    {a: 0, b: 6, c: undefined, d: undefined, e: undefined, f: undefined, g: undefined, h: 7, i: undefined, j: undefined, k: undefined},
    {a: 0, b: 6, c: undefined, d: undefined, e: undefined, f: undefined, g: undefined, h: undefined, i: 7, j: undefined, k: undefined},
    {a: 0, b: 6, c: undefined, d: undefined, e: undefined, f: undefined, g: undefined, h: undefined, i: undefined, j: 7, k: undefined},
    {a: 0, b: 6, c: undefined, d: undefined, e: undefined, f: undefined, g: undefined, h: undefined, i: undefined, j: undefined, k: 7}
  ];
  
  const test = new Runner((obj) => {
    let a = obj.a + obj.b;
  }, objects[0]);
  
  const test2 = new Runner((obj) => {
    let a = obj.a + obj.b;
  }, objects[0]);
  
  let iteration = 0
  
  document.body.addEventListener('click', () => {
    iteration = Math.min(objects.length - 1, iteration + 1);
    test2.arg = objects[iteration];
  });