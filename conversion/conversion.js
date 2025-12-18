function normalizeWords(str) {
    return str
        .split(/\s+/);
}
function toPascalCase(str) {
    return normalizeWords(str)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}
function toCamelCase(str) {
    const words = normalizeWords(str);
    return (
        words[0] + words .slice(1).map(words => words.charAt(0).toUpperCase() + words.slice(1)).join("")
    )
}
function toSnakeCase(str) {
    return normalizeWords(str).join("_")
}
function toKebabCase(str) {
    return normalizeWords(str).join("-")
}
console.log(toPascalCase("hello world"));
console.log(toCamelCase("hello world"));    
console.log(toSnakeCase("hello world"));    
console.log(toKebabCase("hello world"));