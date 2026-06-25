import { cert, initializeApp } from "firebase-admin/app";

export const firebase = () => {
  let serviceAccount: any;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", e);
      serviceAccount = require("../../firebase-admin.json.json");
    }
  } else {
    serviceAccount = require("../../firebase-admin.json.json");
  }
  return initializeApp({
    credential: cert(serviceAccount),
  });
};
