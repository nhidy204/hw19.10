function normalizeWords(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/);
}

export function toPascalCase(str: string): string {
  return normalizeWords(str)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function toPascalCaseKeys<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (obj == null || typeof obj !== "object") return {};
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = toPascalCase(key);
    if (!newKey) return acc;
    acc[newKey] = (obj as Record<string, any>)[key];
    return acc;
  }, {} as Record<string, any>);
}

const obj = {
  first_name: "John",
  last_name: "Doe",
  age: 30
};

console.log(toPascalCaseKeys(obj));
