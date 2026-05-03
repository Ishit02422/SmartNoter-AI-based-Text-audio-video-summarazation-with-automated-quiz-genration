import { config } from "dotenv";
import path from "path";

config({ path: path.join(__dirname, ".env") });

console.log("DB_URL:", process.env.DB_URL);
console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);
