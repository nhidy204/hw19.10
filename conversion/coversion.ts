function normalizeWords(str: string): string[] {
  return str.trim().split(/\s+/);
}

export function toPascalCase(str: string): string {
  return normalizeWords(str)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function toCamelCase(str: string): string {
  const words = normalizeWords(str);
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("")
  );
}

export function toSnakeCase(str: string): string {
  return normalizeWords(str)
    .map(w => w.toLowerCase())
    .join("_");
}

export function toKebabCase(str: string): string {
  return normalizeWords(str)
    .map(w => w.toLowerCase())
    .join("-");
}

console.log(toPascalCase("hello world"));
console.log(toCamelCase("hello world"));
console.log(toSnakeCase("hello world"));
console.log(toKebabCase("hello world"));    
