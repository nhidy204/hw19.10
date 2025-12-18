function assign<
  O extends object,
  K extends PropertyKey,
  V
>(obj: O, key: K, value: V): asserts obj is O & { [P in K]: V } {
  (obj as any)[key] = value;
}

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

type PascalCase<S extends string> =
  S extends `${infer F}_${infer R}`
    ? `${Capitalize<F>}${PascalCase<R>}`
    : S extends `${infer F}-${infer R}`
      ? `${Capitalize<F>}${PascalCase<R>}`
      : Capitalize<S>;

export function toPascalCaseKeys<T extends object>(
  obj: T
): { [K in keyof T as PascalCase<string & K>]: T[K] } {

  const result = {} as { [K in keyof T as PascalCase<string & K>]: T[K] };

  for (const key in obj) {
    const newKey = toPascalCase(key) as PascalCase<string & keyof T>;
    assign(result, newKey, obj[key]);
  }

  return result;
}

const obj = {
  first_name: "John",
  last_name: "Doe",
  age: 30
};

const r = toPascalCaseKeys(obj);
