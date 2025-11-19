export {};

function mirror(str: string): string {
  const mirrorMap: Record<string, string> = {
    '0': '9', '1': '8', '2': '7', '3': '6', '4': '5',
    '5': '4', '6': '3', '7': '2', '8': '1', '9': '0',
    'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v',
    'f': 'u', 'g': 't', 'h': 's', 'i': 'r', 'j': 'q',
    'k': 'p', 'l': 'o', 'm': 'n', 'n': 'm', 'o': 'l',
    'p': 'k', 'q': 'j', 'r': 'i', 's': 'h', 't': 'g',
    'u': 'f', 'v': 'e', 'w': 'd', 'x': 'c', 'y': 'b',
    'z': 'a'
  };

  let result = "";
  for (let char of str) {
    result += mirrorMap[char] ?? char;
  }
  return result;
}

console.log(mirror("123abc")); 
