import { cert, initializeApp } from "firebase-admin/app";

export const firebase = () => {
  let serviceAccount: any;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e: any) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable directly:", e);
      
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
      console.error("FIREBASE_SERVICE_ACCOUNT length:", raw.length);
      const safeSubstring = raw.substring(Math.max(0, 140), Math.min(raw.length, 240));
      console.error(`Sub-string around index 140-240: "${safeSubstring}"`);
      
      // Mask all letters and numbers to inspect the structure securely
      const masked = raw.replace(/[a-zA-Z0-9]/g, "x");
      console.error("Masked structure for debugging:\n", masked);
      
      try {
        const extractField = (field: string) => {
          const match = raw.match(new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`));
          if (match) return match[1];
          const matchMulti = raw.match(new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,|\\s*})`));
          return matchMulti ? matchMulti[1] : null;
        };

        const project_id = extractField("project_id");
        let private_key = extractField("private_key");
        const client_email = extractField("client_email");
        const private_key_id = extractField("private_key_id");
        const client_id = extractField("client_id");

        if (project_id && private_key && client_email) {
          // Normalize private key: convert escaped newlines into real newlines, and strip any leftover backslashes
          private_key = private_key
            .replace(/\\n/g, "\n")
            .replace(/\\/g, "")
            .replace(/\n\n/g, "\n");
          
          serviceAccount = {
            type: "service_account",
            project_id,
            private_key_id,
            private_key,
            client_email,
            client_id,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(client_email)}`,
          };
          console.log("Successfully parsed FIREBASE_SERVICE_ACCOUNT using fallback regex parser!");
        } else {
          throw new Error("Fallback parser could not extract required fields");
        }
      } catch (fallbackError) {
        console.error("Fallback parser also failed:", fallbackError);
        serviceAccount = require("../../firebase-admin.json.json");
      }
    }
  } else {
    serviceAccount = require("../../firebase-admin.json.json");
  }
  return initializeApp({
    credential: cert(serviceAccount),
  });
};
