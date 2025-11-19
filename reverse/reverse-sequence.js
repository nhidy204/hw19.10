let str = "123abc";
let reverse = "";
for (let i = str.length - 1; i >= 0; i--) {
    reverse += str[i];
}
console.log(reverse);