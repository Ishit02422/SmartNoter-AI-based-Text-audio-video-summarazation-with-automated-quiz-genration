import dotenv from "dotenv";
dotenv.config();
import cron from "node-cron";
import App from "./app";
import { connectDb } from "./dbConnections";
import { dailyCreditReset } from "./modules/user/dailyCreditReset";

process.env.TZ = "UTC";

const serverPort = process.env.PORT || 6001;

// 🔥 Connect DB & Start Server
connectDb()
  .then(() => {
    App.start(Number(serverPort));
    App.instance.listen(serverPort, () => {
      console.log(
        `🚀 Server running on port ${serverPort} | ENV: ${process.env.NODE_ENV}`
      );
    });
  })
  .catch((error) => {
    console.log("❌ Error while connecting to database", error);
  });

// 🔥 Cron Jobs
cron.schedule("0 0 * * *", async () => {
  console.log("Running Daily Credit Reset...");
  await dailyCreditReset();
});