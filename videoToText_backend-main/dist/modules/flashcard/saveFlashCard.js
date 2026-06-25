"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFlashCard = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param flashCard
 * @returns savedCards[]
 */
const saveFlashCard = async (flashCard) => {
    const savedCard = await schema_1.FlashCardModel.create(flashCard);
    return savedCard;
};
exports.saveFlashCard = saveFlashCard;
//# sourceMappingURL=saveFlashCard.js.map