const flatArr = [
    [1, 2],
    [3, [4, 5]], 
    [6, 7, [8, 9]]
]
const flatArray = flatArr.flat(Infinity);
console.log(flatArray);