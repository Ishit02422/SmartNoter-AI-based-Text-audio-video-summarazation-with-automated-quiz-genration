"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const node_cron_1 = __importDefault(require("node-cron"));
const app_1 = __importDefault(require("./app"));
const dbConnections_1 = require("./dbConnections");
const dailyCreditReset_1 = require("./modules/user/dailyCreditReset");
process.env.TZ = "UTC";
const serverPort = process.env.PORT || 6001;
// 🔥 Connect DB & Start Server
(0, dbConnections_1.connectDb)()
    .then(() => {
    app_1.default.start(Number(serverPort));
    app_1.default.instance.listen(serverPort, () => {
        console.log(`🚀 Server running on port ${serverPort} | ENV: ${process.env.NODE_ENV}`);
    });
})
    .catch((error) => {
    console.log("❌ Error while connecting to database", error);
});
// 🔥 Cron Jobs
node_cron_1.default.schedule("0 0 * * *", async () => {
    console.log("Running Daily Credit Reset...");
    await (0, dailyCreditReset_1.dailyCreditReset)();
});
//# sourceMappingURL=server.js.map