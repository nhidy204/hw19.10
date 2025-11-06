/*
const flatArr = [
    [1, 2],
    [3, [4, 5]], 
    [6, 7, [8, 9]]
]
const flatArray = flatArr.flat(Infinity);
console.log(flatArray);*/

/*const flatArr = [[1, 2], [3, [4, 5]], [6, 7, [8, 9]]];

function fl(arr) {
    return arr.reduce((acc, item) => {
        return acc.concat(Array.isArray(item) ? fl(item) : item);
    }, []); 
}
console.log(fl(flatArr));*/

const flatArr = [[1, 2], [3, [4, 5]], [6, 7, [8, 9]]];
function fl(arr) {
    let result = [];
    for (let item of arr) {
        if (Array.isArray(item)) {
            result = result.concat(fl(item));
        } else {
            result.push(item);
        }
    }
    return result;
}
console.log(fl(flatArr));