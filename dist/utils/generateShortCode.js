"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortCode = generateShortCode;
const crypto_1 = require("crypto");
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateShortCode(length = 7) {
    const bytes = (0, crypto_1.randomBytes)(length);
    let code = "";
    for (let i = 0; i < length; i++) {
        code += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return code;
}
//# sourceMappingURL=generateShortCode.js.map