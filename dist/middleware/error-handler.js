"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
function errorHandler(error, _req, res, _next) {
    /**
     * Zod Validation Errors
     */
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors: error.flatten(),
        });
        return;
    }
    /**
     * Application Errors
     */
    if (error instanceof AppError_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }
    /**
     * Unknown Errors
     */
    console.error(error);
    res.status(500).json({
        success: false,
        message: "Internal Server Error.",
    });
}
//# sourceMappingURL=error-handler.js.map