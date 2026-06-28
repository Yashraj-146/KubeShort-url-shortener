"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = require("./routes");
const error_handler_1 = require("./middleware/error-handler");
const app = (0, express_1.default)();
/**
 * =====================================
 * Global Middleware
 * =====================================
 */
// Security headers
app.use((0, helmet_1.default)());
// Enable Cross-Origin Resource Sharing
app.use((0, cors_1.default)());
// Parse incoming JSON requests
app.use(express_1.default.json());
// Parse URL-encoded request bodies
app.use(express_1.default.urlencoded({ extended: true }));
/**
 * =====================================
 * Root Endpoint
 * =====================================
 */
app.get("/", (_req, res) => {
    res.status(200).json({
        name: "URL Shortener API",
        version: "1.0.0",
        status: "running",
    });
});
/**
 * =====================================
 * API Routes
 * =====================================
 */
app.use("/api/v1", routes_1.apiRouter);
/**
 * =====================================
 * 404 Handler
 * =====================================
 */
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});
/**
 * =====================================
 * Global Error Handler
 * =====================================
 */
app.use(error_handler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map