"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../../../modules/user");
class Controller {
    constructor() {
        this.getAllUser = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request !");
                }
                const userId = req.params.id;
                if (userId) {
                    const populatedUser = await (0, user_1.getPopulatedUserById)(userId);
                    return res.status(200).json(populatedUser);
                }
                else {
                    const allPopulatedUser = await (0, user_1.getAllUser)();
                    return res.status(200).json(allPopulatedUser);
                }
            }
            catch (error) {
                console.log("error", "error in getAllUser", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime",
                    error: JSON.stringify(error),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=user.controller.js.map