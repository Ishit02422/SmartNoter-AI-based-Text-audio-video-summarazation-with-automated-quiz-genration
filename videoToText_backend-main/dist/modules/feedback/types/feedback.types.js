"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feedback = void 0;
const lodash_1 = require("lodash");
const mongoose_1 = require("mongoose");
class Feedback {
    constructor(input) {
        this._id = (input === null || input === void 0 ? void 0 : input._id)
            ? input === null || input === void 0 ? void 0 : input._id.toString()
            : new mongoose_1.Types.ObjectId().toString();
        // this.feedback = input?.feedback;
        this.email = input === null || input === void 0 ? void 0 : input.email;
        this.deviceId = input === null || input === void 0 ? void 0 : input.deviceId;
        this.appVersion = input === null || input === void 0 ? void 0 : input.appVersion;
        this.deviceName = input === null || input === void 0 ? void 0 : input.deviceName;
        this.deviceVersion = input === null || input === void 0 ? void 0 : input.deviceVersion;
        this.location = input === null || input === void 0 ? void 0 : input.location;
        this.option1 = input === null || input === void 0 ? void 0 : input.option1;
        this.option2 = input === null || input === void 0 ? void 0 : input.option2;
        this.option3 = input === null || input === void 0 ? void 0 : input.option3;
        this.option4 = input === null || input === void 0 ? void 0 : input.option4;
        this.comment = input === null || input === void 0 ? void 0 : input.comment;
        this.buildNumber = input === null || input === void 0 ? void 0 : input.buildNumber;
        this.userId = input === null || input === void 0 ? void 0 : input.userId;
        this.createdAt = input === null || input === void 0 ? void 0 : input.createdAt;
        this.updatedAt = input === null || input === void 0 ? void 0 : input.updatedAt;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
}
exports.Feedback = Feedback;
//# sourceMappingURL=feedback.types.js.map