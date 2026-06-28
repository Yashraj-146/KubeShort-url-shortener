"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthSchema = void 0;
const zod_1 = require("zod");
exports.googleAuthSchema = zod_1.z.object({
    idToken: zod_1.z.string().min(1, "Google ID token is required."),
});
//# sourceMappingURL=schema.js.map