"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
class Controller {
    constructor() {
        this.createOrder = async (req, res) => {
            try {
                const authUser = req.authUser;
                const { amount, currency = "INR" } = req.body;
                if (!amount) {
                    return res.status(400).json({ message: "Amount is required" });
                }
                const instance = new razorpay_1.default({
                    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey",
                    key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
                });
                const options = {
                    amount: amount * 100, // amount in smallest currency unit (paise)
                    currency,
                    receipt: `receipt_order_${Date.now()}`,
                };
                const order = await instance.orders.create(options);
                if (!order) {
                    return res.status(500).json({ message: "Some error occured with Razorpay" });
                }
                res.status(200).json({ success: true, order });
            }
            catch (error) {
                console.error("Error creating razorpay order", error);
                res.status(500).json({ message: error.message });
            }
        };
        this.verifyPayment = async (req, res) => {
            try {
                const authUser = req.authUser;
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
                if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                    return res.status(400).json({ message: "Missing razorpay payment details" });
                }
                const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummysecret";
                const body = razorpay_order_id + "|" + razorpay_payment_id;
                const expectedSignature = crypto_1.default
                    .createHmac("sha256", key_secret)
                    .update(body.toString())
                    .digest("hex");
                const isAuthentic = expectedSignature === razorpay_signature;
                if (isAuthentic) {
                    // Payment is successful. 
                    // TODO: Update User model here (e.g. set isProUser = true or update credits)
                    // await updateUser(new UserModel({ ...authUser, isProUser: true, dailyCredits: 50 }));
                    return res.status(200).json({
                        success: true,
                        message: "Payment verified successfully",
                    });
                }
                else {
                    return res.status(400).json({ success: false, message: "Invalid Signature" });
                }
            }
            catch (error) {
                console.error("Error verifying payment", error);
                res.status(500).json({ message: error.message });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=controller.js.map