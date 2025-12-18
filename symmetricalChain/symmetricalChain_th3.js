function symmetricalChainV5(string) {
    const code1 = '1'.charCodeAt(0);
    const code9 = '9'.charCodeAt(0);
    const codeA = 'a'.charCodeAt(0);
    const codeZ = 'z'.charCodeAt(0);
    const regex = /[a-z0-9]/g;
    function replacer(match) {
        const charCode = match.charCodeAt(0);
        if (charCode >= code1 && charCode <= code9) {
            const symmetricCode = (code1 + code9) - charCode;
            return String.fromCharCode(symmetricCode);
        }
        const symmetricCode = (codeA + codeZ) - charCode;
        return String.fromCharCode(symmetricCode);
    }
    return string.replace(regex, replacer);
}
console.log(symmetricalChainV5("123abc"));   