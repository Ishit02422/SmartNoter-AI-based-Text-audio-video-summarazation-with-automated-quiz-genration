"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlashCard = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param source
 * @param summaryId
 * @param userId
 * @returns cards
 */
const getFlashCard = async (source, summaryId, userId) => {
    const cards = await schema_1.FlashCardModel.find({ source, summaryId, userId })
        .sort({
        createdAt: 1,
    })
        .lean();
    return cards;
};
exports.getFlashCard = getFlashCard;
//# sourceMappingURL=getFlashCard.js.map