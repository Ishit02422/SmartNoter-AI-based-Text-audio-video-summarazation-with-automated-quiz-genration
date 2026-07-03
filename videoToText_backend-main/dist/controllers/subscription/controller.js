"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importStar(require("joi"));
const subscription_1 = require("../../modules/subscription");
const lodash_1 = require("lodash");
const moment_1 = __importDefault(require("moment"));
const googleapis_1 = require("googleapis");
const axios_1 = __importDefault(require("axios"));
const schema_1 = require("../../modules/subscription/schema");
const taskSchedule_1 = require("../../helper/taskSchedule");
const user_1 = require("../../modules/user");
const schema_2 = require("../../modules/user/schema");
class Controller {
    constructor() {
        this.updateCoinsSchema = joi_1.default.object().keys({
            receiptId: joi_1.default.string().required(),
            data: joi_1.default.string().required(),
            purchase: joi_1.default.string().required(),
            deviceId: joi_1.default.string().required(),
            appType: joi_1.default.string().required(),
            price: joi_1.default.string().required(),
            store: joi_1.default.string().required(),
            subscriptionType: joi_1.default.string()
                .valid("WEEKLY", "MONTHLY", "YEARLY")
                .required(),
        });
        this.purchaseCoinsSubscriptionController = async (req, res) => {
            try {
                // console.log(moment().add(7, "days").format("YYYY-MM-DDTHH:mm:ss.SSSZ"), ">>>>>");
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("Unauthorized Request");
                }
                const payloadValue = await this.updateCoinsSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    console.log(e);
                    if ((0, joi_1.isError)(e)) {
                        res.status(422).json({ message: e.message });
                    }
                    else {
                        res.status(422).json({ message: e.message });
                    }
                });
                if (!payloadValue) {
                    return;
                }
                // const user = await getUserById(authUser._id);
                const subscription = await (0, subscription_1.getSubscriptionByReceiptId)(payloadValue.receiptId);
                if (subscription) {
                    console.log("receiptId repeated");
                    return res.status(500).json({
                        message: "Something happened wrong try again after sometime.",
                    });
                }
                const regex = /^GPA\.\d{4}-\d{4}-\d{4}-\d{5}$/;
                let detail;
                let flag = false;
                // console.log(payloadValue.receiptId, "receiptId");
                const auth = new googleapis_1.google.auth.GoogleAuth({
                    keyFile: "./credentials/keyFile.json",
                    scopes: process.env.ANDROID,
                });
                let productId;
                if (payloadValue.subscriptionType == "WEEKLY") {
                    productId = "animart_weekly";
                }
                else if (payloadValue.subscriptionType == "MONTHLY") {
                    productId = "animart_6month";
                }
                else if (payloadValue.subscriptionType == "YEARLY") {
                    productId = "animart_yearly";
                }
                const playDeveloper = googleapis_1.google.androidpublisher({
                    version: "v3",
                    auth,
                });
                // fs.writeFileSync("payloadValue.json", JSON.stringify(payloadValue));
                let formattedExpiryDate;
                if (regex.test(payloadValue.receiptId)) {
                    flag = true;
                    // const response = await playDeveloper.purchases.subscriptions.get({
                    //   packageName: process.env.PACKAGE_NAME,
                    //   subscriptionId: productId,
                    //   token: payloadValue.data,
                    // });
                    // let expiryTime = parseInt(response.data.expiryTimeMillis);
                    // const expiryDate = new Date(expiryTime);
                    // const date = moment(expiryDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                    // detail = {
                    //   linkedPurchaseToken: response.data.linkedPurchaseToken,
                    //   expiryTime: date,
                    // };
                }
                else {
                    const response = await axios_1.default.post(process.env.IOS, // For production environment
                    {
                        "receipt-data": payloadValue.data,
                        password: process.env.IOS_PASSWORD,
                        "exclude-old-transactions": false,
                    });
                    // fs.writeFileSync("payloadValue1.json", JSON.stringify(response.data));
                    const { status, latest_receipt_info, latest_receipt, pending_renewal_info, } = response.data;
                    if (status === 0) {
                        // Successful receipt validation
                        const validReceiptInfo = latest_receipt_info.find((receipt) => receipt.transaction_id === payloadValue.receiptId);
                        if (validReceiptInfo) {
                            // Valid subscription
                            detail = {
                                environment: response.data.environment,
                                latestReceipt: validReceiptInfo,
                                latestData: latest_receipt,
                            };
                            // Check if the subscription is canceled
                            const isCanceled = validReceiptInfo.cancellation_date !== undefined;
                            console.log("isCanceled", isCanceled);
                            // Check if the subscription is auto-renewable
                            const isAutoRenewable = validReceiptInfo.auto_renew_status === "1";
                            console.log("isAutoRenewable", isAutoRenewable);
                            // Check if there is a pending renewal
                            const isPendingRenewal = pending_renewal_info.length > 0;
                            console.log("isPendingRenewal", isPendingRenewal);
                            flag = true;
                            // Process the subscription information as needed
                            // ...
                        }
                        else {
                            // Invalid subscription
                            console.log("Invalid subscription receipt");
                            flag = false;
                            return res
                                .status(555)
                                .json({ message: "Invalid subscription receipt." });
                        }
                    }
                    else {
                        // Receipt validation failed
                        console.log("Receipt validation failed from AppStore from Subscription.");
                        flag = false;
                        return res.status(500).json({
                            message: "Something happened wrong try again after sometime.",
                        });
                    }
                }
                if (flag) {
                    const subscription = await (0, subscription_1.saveSubscription)(new schema_1.SubscriptionModel({
                        receiptId: payloadValue.receiptId,
                        userId: authUser._id,
                        data: payloadValue.data,
                        deviceId: payloadValue.deviceId,
                        appType: payloadValue.appType,
                        price: payloadValue.price,
                        store: payloadValue.store,
                        subscriptionType: payloadValue.subscriptionType,
                        detail,
                    }));
                    const type = String(payloadValue.subscriptionType).toUpperCase();
                    let expiredTime;
                    switch (type) {
                        case "WEEKLY":
                            expiredTime = (0, moment_1.default)()
                                .add(7, "days")
                                .add(3, "minutes")
                                .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                            break;
                        case "MONTHLY":
                            expiredTime = (0, moment_1.default)()
                                .add(1, "months")
                                .add(3, "minutes")
                                .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                            break;
                        case "YEARLY":
                            expiredTime = (0, moment_1.default)()
                                .add(1, "years")
                                .add(3, "minutes")
                                .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                            break;
                        default:
                            return res
                                .status(400)
                                .json({ message: "please provide valid subscriptionType" });
                    }
                    await (0, taskSchedule_1.taskSchedule)(expiredTime, authUser._id);
                    await (0, user_1.updateUser)(new schema_2.UserModel({
                        ...authUser,
                        premiumExpiryDate: expiredTime,
                        isProUser: true,
                        dailyCredits: 8,
                        premiumType: payloadValue.subscriptionType,
                    }));
                    return res
                        .status(200)
                        .json({ message: "subscription purchased successfully." });
                }
            }
            catch (error) {
                console.log("error", "error in purchasing user#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=controller.js.map