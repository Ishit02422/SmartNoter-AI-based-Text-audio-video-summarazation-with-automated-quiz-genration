"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIsAdmin = void 0;
const validateIsAdmin = async (req, res, next) => {
    if (!req.isAdmin) {
        res.status(403).json({ message: "Unauthorized requests." }).end();
        return;
    }
    next();
};
exports.validateIsAdmin = validateIsAdmin;
//# sourceMappingURL=validateIsAdmin.js.map