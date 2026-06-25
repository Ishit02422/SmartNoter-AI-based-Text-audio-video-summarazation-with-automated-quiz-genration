"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveHistory = void 0;
const history_1 = require("./schema/history");
/**
 *
 * @param data
 * @returns savedData
 */
const saveHistory = async (data) => {
    const savedData = await new history_1.HistoryModel(data).save();
    return savedData;
};
exports.saveHistory = saveHistory;
//# sourceMappingURL=saveHistory.js.map