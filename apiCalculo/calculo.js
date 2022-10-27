function calculo(num) {
  let result = {};
  for (let i = 0; i < num; i++) {
    let rawNum = Math.random() * 1000;
    let randomNum = Math.trunc(rawNum);
    if (result[randomNum] !== undefined) {
      result[randomNum] += 1;
    } else {
      result[randomNum] = 0;
    }
  }
  return result;
}

process.on("message", (num) => {
  const result = calculo(num);
  process.send(result);
});
