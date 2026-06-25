"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveChat = void 0;
const schema_1 = require("./schema");
/**
 * function for save chat in db
 * @param chat
 * @returns chat itself
 */
const saveChat = async (chat) => {
    const savedChat = await schema_1.ChatWithAiModel.create(chat);
    return savedChat;
};
exports.saveChat = saveChat;
//# sourceMappingURL=saveChat.js.map