function mirror(string) {
    let nums = "0123456789";
    let letters = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let chart of string) {
        if (nums.includes(chart)) {
            result += nums[10 - nums.indexOf(chart)];
        } else if (letters.includes(chart)) {
            result += letters[25 - letters.indexOf(chart)];
        } else {
            result += chart;
        }
    }
    return result;
}
console.log(mirror("123abc")); 


