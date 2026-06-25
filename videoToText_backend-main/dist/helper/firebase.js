"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebase = void 0;
const app_1 = require("firebase-admin/app");
const firebase = () => {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }
        catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", e);
            serviceAccount = require("../../firebase-admin.json.json");
        }
    }
    else {
        serviceAccount = require("../../firebase-admin.json.json");
    }
    return (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccount),
    });
};
exports.firebase = firebase;
//# sourceMappingURL=firebase.js.map