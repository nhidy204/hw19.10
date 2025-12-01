/*
let a = 3;
for (let i = 1; i <= a; i++) {
    let space = " ".repeat(a - i);
    let stars = "*".repeat(2 * i - 1);
    console.log(space + stars );
}*/
/*--> viết lại bằng cách: dùng 2 vòng lặp*/
let a = 3;
for (let i = 1; i <= a; i++) {     
    let line = "";
    for (let s = 1; s <= a - i; s++) {
        line += " ";
    }
    for (let j = 1; j <= 2 * i - 1; j++) { 
        line += "*";
    }
    console.log(line);
}
