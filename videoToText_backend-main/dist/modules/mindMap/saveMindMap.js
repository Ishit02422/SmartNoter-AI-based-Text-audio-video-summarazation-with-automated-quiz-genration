"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMindMap = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param data
 * @returns savedMindMap
 */
const saveMindMap = async (data) => {
    const savedMindMap = await schema_1.MindMapModel.create(data);
    return savedMindMap;
};
exports.saveMindMap = saveMindMap;
//# sourceMappingURL=saveMindMap.js.map