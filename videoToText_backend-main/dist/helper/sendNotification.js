"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEmptyToken = exports.sendNotification = void 0;
const firebase_admin_1 = require("firebase-admin");
const sendNotification = async (notification) => {
    const tokens = (0, exports.removeEmptyToken)(notification.tokens, ["", null, undefined]);
    if (tokens.length) {
        (0, firebase_admin_1.messaging)()
            .sendEachForMulticast(notification)
            .then(async (response) => {
            console.log("Notification Send Successfully....");
        })
            .catch((error) => {
            console.log("Error sending message:", error);
        });
    }
};
exports.sendNotification = sendNotification;
const removeEmptyToken = (arr, value) => {
    var i = 0;
    if (!arr.length)
        return [];
    while (i < arr.length) {
        if (value.includes(arr[i])) {
            arr.splice(i, 1);
        }
        else {
            ++i;
        }
    }
    return arr;
};
exports.removeEmptyToken = removeEmptyToken;
//# sourceMappingURL=sendNotification.js.map