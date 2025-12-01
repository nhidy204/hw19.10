function symmetricalChain(string) {
    return string
        .split("")
        .map(char => {
            if (/\d/.test(char)) {
                const origin = Number(char);
                const symmetric = 10 - origin;
                return String(symmetric);
            }
            if (/[a-z]/.test(char)) {
                const codeA = 'a'.charCodeAt(0);
                const codeZ = 'z'.charCodeAt(0);
                const symmetricCode = codeZ - (char.charCodeAt(0) - codeA);
                return String.fromCharCode(symmetricCode);
            }
            return char;
        })
        .join('')
}
console.log(symmetricalChain("123abc"))
