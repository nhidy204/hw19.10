function normalizeWords(str) {
    return str
        .toLowerCase()
        .replace(/[-_]+/g, " ")
        .trim()
        .split(/\s+/);
}
function toPascalCase(str) {
    return normalizeWords(str)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}
function toPascalCaseKeys(obj) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[toPascalCase(key)] = value;
        return acc;
    }, {});
}
const obj = {
    "first_name": "John",
    "last_name": "Doe",
    "age": 30
};
console.log(toPascalCaseKeys(obj));
