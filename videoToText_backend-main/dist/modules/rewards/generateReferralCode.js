"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralCode = void 0;
const getByReferCode_1 = require("./getByReferCode");
const generateReferralCode = async () => {
    let isUnique = false;
    while (!isUnique) {
        let referCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        let existingUser = await (0, getByReferCode_1.getByReferCode)(referCode);
        if (!existingUser) {
            isUnique = true;
            return referCode;
        }
    }
};
exports.generateReferralCode = generateReferralCode;
//# sourceMappingURL=generateReferralCode.js.map