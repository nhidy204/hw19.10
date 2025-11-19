let a: number = 3;

for (let i: number = 1; i <= a; i++) {
  let line: string = "";
  for (let s: number = 1; s <= a - i; s++) {
    line += " ";
  }
  for (let j: number = 1; j <= 2 * i - 1; j++) {
    line += "*";
  }

  console.log(line);
}
