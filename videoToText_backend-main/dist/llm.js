"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLlm = void 0;
const google_genai_1 = require("@langchain/google-genai");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../.env") });
const getLlm = async (keyIndex = 0) => {
    const keysStr = process.env.GOOGLE_API_KEY || "";
    const keys = keysStr.split(",").map((k) => k.trim()).filter(Boolean);
    const selectedKey = keys[keyIndex % keys.length] || "";
    return new google_genai_1.ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: selectedKey,
        maxRetries: 2,
    });
};
exports.getLlm = getLlm;
//# sourceMappingURL=llm.js.map