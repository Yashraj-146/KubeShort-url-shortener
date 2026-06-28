"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const schema_1 = require("./schema");
const service_1 = require("./service");
class AuthController {
    static async googleLogin(req, res, next) {
        try {
            /**
             * Validate request body
             */
            const request = schema_1.googleAuthSchema.parse(req.body);
            /**
             * Authenticate user
             */
            const response = await service_1.AuthService.authenticateWithGoogle(request);
            /**
             * Return response
             */
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=controller.js.map