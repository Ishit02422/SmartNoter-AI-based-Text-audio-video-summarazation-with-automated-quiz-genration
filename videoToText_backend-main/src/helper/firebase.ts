import { cert, initializeApp } from "firebase-admin/app";

export const firebase = () => {
  const serviceAccount = require("../../firebase-admin.json.json");
  return initializeApp({
    credential: cert(serviceAccount),
  });
};
