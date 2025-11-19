function mirror(str) {
    let nums = "0123456789";
    let letters = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let char of str) {
        if (nums.includes(char)) {
            result += nums[10 - nums.indexOf(char)];
        } else if (letters.includes(char)) {
            result += letters[25 - letters.indexOf(char)];
        } else {
            result += char;
        }
    }
    return result;
}
console.log(mirror("123abc")); 