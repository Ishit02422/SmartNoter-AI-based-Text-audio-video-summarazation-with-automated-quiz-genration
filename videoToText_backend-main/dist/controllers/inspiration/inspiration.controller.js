"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const inspiration_1 = require("../../modules/inspiration");
class Controller {
    constructor() {
        this.get = async (req, res) => {
            try {
                // const authUser = req.authUser;
                // if (!authUser) {
                //   return res.status(403).json("unauthorized request");
                // }
                const category = req.params.category;
                let inspirations;
                if (category == "All") {
                    inspirations = await (0, inspiration_1.getInspiration)();
                }
                else {
                    inspirations = await (0, inspiration_1.getInspirationByCategory)(category);
                }
                return res.status(200).json(inspirations);
            }
            catch (error) {
                console.log("error", "error in getting inspiration#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.getCategory = async (req, res) => {
            try {
                const category = [
                    "All",
                    "Motivation",
                    "Inspiration",
                    "Happiness",
                    "Love",
                    "Life",
                    "Success",
                    "Relationship",
                    "Friendship",
                    "Money",
                    "Health",
                    "Humor",
                    "Leadership",
                    "Education",
                    "Work",
                    "Art",
                    "Science",
                    "Technology",
                    "Sports",
                    "Music",
                    "Movies",
                    "Books",
                    "Travel",
                    "Food",
                    "Fashion",
                    "Nature",
                    "Animals",
                    "Spirituality",
                    "Religion",
                    "Politics",
                ];
                return res.status(200).send(category);
            }
            catch (err) {
                console.log("########## Error in getCategory", err);
                return res.status(500).json({ error: (0, lodash_1.get)(err, "message") });
            }
        };
        this.getById = async (req, res) => {
            try {
                // const authUser = req.authUser;
                // if (!authUser) {
                //   return res.status(403).json("unauthorized request");
                // }
                const inspirationId = req.params.id;
                const inspirations = await (0, inspiration_1.getInspirationById)(inspirationId);
                return res.status(200).json(inspirations);
            }
            catch (error) {
                console.log("error", "error in getting inspiration#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=inspiration.controller.js.map