"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const dotenv_1 = require("dotenv");
const redis_1 = require("redis");
(0, dotenv_1.config)();
exports.redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
    // password: process.env.REDIS_PASSWORD,
});
//# sourceMappingURL=redis.js.map