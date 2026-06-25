"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    const dbUrl = process.env.DB_URL || "";
    if (!dbUrl) {
        throw new Error("❌ DB_URL is not set in .env file");
    }
    try {
        await mongoose_1.default.connect(dbUrl, {
            dbName: process.env.DB_NAME,
        });
        console.log(`✅ MongoDB Connected Successfully → ${dbUrl}${process.env.DB_NAME}`);
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        throw error;
    }
};
exports.connectDb = connectDb;
//# sourceMappingURL=dbConnections.js.map