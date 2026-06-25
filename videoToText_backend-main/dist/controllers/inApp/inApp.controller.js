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
const axios_1 = __importDefault(require("axios"));
const joi_1 = __importStar(require("joi"));
const lodash_1 = require("lodash");
const inApp_1 = require("../../modules/inApp");
const user_1 = require("../../modules/user");
const moment_1 = __importDefault(require("moment"));
const googleapis_1 = require("googleapis");
const node_cron_1 = __importDefault(require("node-cron"));
const updateInApp_1 = require("../../modules/inApp/updateInApp");
class Controller {
    constructor() {
        this.updateGlitterSchema = joi_1.default.object().keys({
            // receiptId: Joi.string().regex(/^(\d{16}|GPA\.\d{4}-\d{4}-\d{4}-\d{5})$/),
            receiptId: joi_1.default.string().required(),
            userId: joi_1.default.string().required(),
            data: joi_1.default.string().required(),
            glitter: joi_1.default.number().required(),
            purchase: joi_1.default.string().required(),
            deviceId: joi_1.default.string().optional(),
            appType: joi_1.default.string().required(),
            price: joi_1.default.string().required(),
            store: joi_1.default.string().required(),
        });
        this.updateCoinsSchema = joi_1.default.object().keys({
            receiptId: joi_1.default.string().required(),
            data: joi_1.default.string().required(),
            purchase: joi_1.default.string().required(),
            deviceId: joi_1.default.string().required(),
            appType: joi_1.default.string().required(),
            price: joi_1.default.string().required(),
            store: joi_1.default.string().required(),
            subscriptionType: joi_1.default.string()
                .valid("WEEKLY", "MONTHLY", "6-MONTHLY", "YEARLY", "YEARLY_OFFER")
                .required(),
        });
        this.taskSchedule = async (date, userId) => {
            // debugger;
            // console.log(userId, "**********");
            // console.log(date, "?????????????????");
            let [year, month, day, hour, minute] = date.split(/[- :T]/);
            // console.log(year, month, day, hour, minute, "year, month, day, hour, minute");
            // console.log(`${minute} ${hour} ${day} ${month} *`, "cron expression");
            // Schedule the task using node-cron
            node_cron_1.default.schedule(`${minute} ${hour} ${day} ${month} *`, async () => {
                const user = await (0, user_1.getUserById)(userId);
                console.log("your subscription end", new Date());
                const inApp = await (0, inApp_1.getInAppByUserId)(user._id.toString());
                if (inApp.length > 0) {
                    // console.log(inApp[0].detail.latestData, "inApp[0].detail.latestData");
                    // console.log(inApp[0].detail, "%%%%%%%%%%%%");
                    let isPro = false;
                    if (inApp[0].appType == "isIos") {
                        // console.log("ios");
                        const response = await axios_1.default.post(process.env.IOS, // For production environment
                        {
                            //@ts-ignore
                            "receipt-data": inApp[0].detail.latestData,
                            password: process.env.IOS_PASSWORD,
                            "exclude-old-transactions": false,
                        });
                        const { status, latest_receipt_info, latest_receipt, pending_renewal_info, } = response.data;
                        if (status === 0) {
                            // Successful receipt validation
                            const validReceiptInfo = latest_receipt_info.find((receipt) => receipt.transaction_id === inApp[0].receiptId);
                            // console.log(validReceiptInfo, ":::::::::::::::::");
                            if (validReceiptInfo) {
                                // Valid subscription
                                inApp[0].detail = {
                                    environment: response.data.environment,
                                    latestReceipt: validReceiptInfo,
                                    latestData: latest_receipt,
                                };
                                // console.log(pending_renewal_info, "????????????????????");
                                // Check if the subscription is auto-renewable
                                // const isAutoRenewable = validReceiptInfo.auto_renew_status === "1";
                                const isAutoRenewable = pending_renewal_info[0].auto_renew_status == "1";
                                // console.log("isAutoRenewableeeeeeeeeeee", isAutoRenewable);
                                // console.log("isAutoRenewable", isAutoRenewable);
                                if (!isAutoRenewable) {
                                    // console.log(user, "^^^^^^^^^^^^^^^^^^^^^^");
                                    await (0, user_1.updateUser)(new user_1.User({
                                        ...user,
                                        isProUser: false,
                                        isPurchased: false,
                                        token: user.token,
                                        premiumType: "FREE",
                                        premiumExpiryDate: null,
                                    }));
                                    isPro = false;
                                }
                            }
                            else {
                                // Invalid subscription
                                console.log("Invalid subscription receipt");
                                await (0, user_1.updateUser)(new user_1.User({
                                    ...user,
                                    isProUser: false,
                                    isPurchased: false,
                                    token: user.token,
                                    premiumType: "FREE",
                                }));
                                isPro = false;
                            }
                        }
                        else {
                            await (0, user_1.updateUser)(new user_1.User({
                                ...user,
                                isProUser: false,
                                isPurchased: false,
                                token: user.token,
                                premiumType: "FREE",
                                premiumExpiryDate: null,
                            }));
                            isPro = false;
                        }
                    }
                    else if (inApp[0].appType == "isAndroid") {
                        const regex = /^GPA\.\d{4}-\d{4}-\d{4}-\d{5}(?:\.\.(?:[0-5]))?$/;
                        const auth = new googleapis_1.google.auth.GoogleAuth({
                            keyFile: "./credentials/keyFile.json",
                            scopes: process.env.ANDROID,
                        });
                        let productId;
                        let flag = false;
                        if (inApp[0].premiumType == "WEEKLY") {
                            productId = "askai_weekly";
                        }
                        else if (inApp[0].premiumType == "MONTHLY") {
                            productId = "askai_monthly";
                        }
                        else if (inApp[0].premiumType == "YEARLY_OFFER") {
                            productId = "askgpt_yearly_offer";
                        }
                        else if (inApp[0].premiumType == "YEARLY") {
                            productId = "askai_yearly";
                        }
                        const playDeveloper = googleapis_1.google.androidpublisher({
                            version: "v3",
                            auth,
                        });
                        if (regex.test(inApp[0].receiptId)) {
                            flag = true;
                            const response = await playDeveloper.purchases.subscriptions.get({
                                packageName: process.env.PACKAGE_NAME,
                                subscriptionId: productId,
                                token: inApp[0].data,
                            });
                            // console.log(response.data, "response");
                            // console.log(response.data.autoRenewing, "response1");
                            // console.log(!response.data.autoRenewing, "response2");
                            if (!response.data.autoRenewing) {
                                await (0, user_1.updateUser)(new user_1.User({
                                    ...user,
                                    isProUser: false,
                                    isPurchased: false,
                                    token: user.token,
                                    premiumType: "FREE",
                                    premiumExpiryDate: null,
                                }));
                                isPro = false;
                            }
                            else {
                                let expiryTime = parseInt(response.data.expiryTimeMillis);
                                const expiryDate = new Date(expiryTime);
                                const formattedExpiryDate = expiryDate.toISOString();
                                // console.log(formattedExpiryDate, "formattedExpiryDate");
                                //@ts-ignore
                                inApp[0].detail.expiryTime = formattedExpiryDate;
                                await (0, updateInApp_1.updateInApp)(new inApp_1.InApp({
                                    ...inApp[0].toObject(),
                                    receiptId: response.data.orderId,
                                }));
                                let expiredTime;
                                if (inApp[0].premiumType == "WEEKLY") {
                                    expiredTime = (0, moment_1.default)()
                                        .add(7, "days")
                                        .add(3, "minutes")
                                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                                    await this.taskSchedule(expiredTime, user._id);
                                }
                                else if (inApp[0].premiumType == "MONTHLY") {
                                    expiredTime = (0, moment_1.default)()
                                        .add(1, "months")
                                        .add(3, "minutes")
                                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                                    await this.taskSchedule(expiredTime, user._id);
                                }
                                else if (inApp[0].premiumType == "YEARLY_OFFER") {
                                    expiredTime = (0, moment_1.default)()
                                        .add(1, "years")
                                        .subtract(3, "minutes")
                                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                                    await this.taskSchedule(expiredTime, user._id);
                                }
                                else if (inApp[0].premiumType == "YEARLY") {
                                    expiredTime = (0, moment_1.default)()
                                        .add(1, "years")
                                        .subtract(3, "minutes")
                                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                                    await this.taskSchedule(expiredTime, user._id);
                                }
                                await (0, user_1.updateUser)(new user_1.User({
                                    ...user,
                                    premiumExpiryDate: expiredTime,
                                    isProUser: true,
                                    isPurchased: true,
                                    premiumType: inApp[0].premiumType,
                                    token: user.token,
                                }));
                                isPro = true;
                            }
                        }
                        else {
                            // console.log("elseeeeeeeeeeeeeeeeeee");
                            await (0, user_1.updateUser)(new user_1.User({
                                ...user,
                                isProUser: false,
                                isPurchased: false,
                                token: user.token,
                                premiumType: "FREE",
                            }));
                        }
                    }
                    else {
                        await (0, user_1.updateUser)(new user_1.User({
                            ...user,
                            isProUser: false,
                            isPurchased: false,
                            token: user.token,
                            premiumType: "FREE",
                        }));
                        isPro = false;
                    }
                }
            });
        };
        this.purchaseGlitter = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("Unauthorized Request");
                }
                const payloadValue = await this.updateGlitterSchema
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
                const inApp = await (0, inApp_1.getInAppByReceiptId)(payloadValue.receiptId);
                if (inApp) {
                    console.log("receiptId repeated");
                    return res.status(500).json({
                        message: "Something happened wrong try again after sometime.",
                    });
                }
                let flag = false;
                const regex = /^GPA\.\d{4}-\d{4}-\d{4}-\d{5}$/;
                // const regex = /^GPA/;
                if (regex.test(payloadValue.receiptId)) {
                    flag = true;
                }
                else {
                    const response = await axios_1.default.post(process.env.IOS, // For production environment
                    {
                        "receipt-data": payloadValue.data,
                    });
                    if (response.data.status !== 0 &&
                        response.data.receipt.in_app.length > 0 &&
                        response.data.receipt.in_app[0].original_transaction_id ==
                            payloadValue.receiptId) {
                        console.log("receipt validation failed from appStore ");
                        await (0, inApp_1.saveInApp)(new inApp_1.InApp({
                            receiptId: payloadValue.receiptId,
                            userId: authUser._id.toString(),
                            data: payloadValue.data,
                            glitter: 0,
                            deviceId: payloadValue.deviceId,
                            appType: payloadValue.appType,
                            price: payloadValue.price,
                            store: payloadValue.store,
                            purchase: payloadValue.purchase,
                        }));
                        return res.status(500).json({
                            message: "Something happened wrong try again after sometime.",
                        });
                    }
                    else {
                        flag = true;
                    }
                }
                if (flag) {
                    const addFree = payloadValue.purchase.split("+");
                    if (addFree.length > 0 && addFree[1] == " Ad Free") {
                        await (0, user_1.updateUser)(new user_1.User({
                            ...authUser,
                            glitter: authUser.glitter + payloadValue.glitter,
                            isProUser: true,
                            isPurchased: true,
                        }));
                    }
                    else {
                        await (0, user_1.updateUser)(new user_1.User({
                            ...authUser,
                            glitter: authUser.glitter + payloadValue.glitter,
                            isPurchased: true,
                        }));
                    }
                    await (0, inApp_1.saveInApp)(new inApp_1.InApp({
                        receiptId: payloadValue.receiptId,
                        userId: authUser._id.toString(),
                        data: payloadValue.data,
                        glitter: payloadValue.glitter,
                        deviceId: payloadValue.deviceId,
                        appType: payloadValue.appType,
                        price: payloadValue.price,
                        store: payloadValue.store,
                        purchase: payloadValue.purchase,
                    }));
                    flag = null;
                    return res
                        .status(200)
                        .json({ message: "glitter purchased successfully." });
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
        this.purchaseSubscriptionController = async (req, res) => {
            var _a;
            try {
                // console.log(moment().add(7, "days").format("YYYY-MM-DDTHH:mm:ss.SSSZ"), ">>>>>");
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("Unauthorized Request");
                }
                const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
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
                const subscription = await (0, inApp_1.getInAppByReceiptId)(payloadValue.receiptId);
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
                    productId = "askgpt_weekly";
                }
                else if (payloadValue.subscriptionType == "MONTHLY") {
                    productId = "askgpt_monthly";
                }
                //  else if (payloadValue.subscriptionType == "6-MONTHLY") {
                //   productId = "askgpt_6month";
                // }
                else if (payloadValue.subscriptionType == "YEARLY_OFFER") {
                    productId = "askgpt_yearly_offer";
                }
                else if (payloadValue.subscriptionType == "YEARLY") {
                    productId = "askgpt_yearly";
                }
                const playDeveloper = googleapis_1.google.androidpublisher({
                    version: "v3",
                    auth,
                });
                // fs.writeFileSync("payloadValue.json", JSON.stringify(payloadValue));
                let formattedExpiryDate;
                if (regex.test(payloadValue.receiptId)) {
                    flag = true;
                    const response = await playDeveloper.purchases.subscriptions.get({
                        packageName: process.env.PACKAGE_NAME,
                        subscriptionId: productId,
                        token: payloadValue.data,
                    });
                    let expiryTime = parseInt(response.data.expiryTimeMillis);
                    const expiryDate = new Date(expiryTime);
                    const date = (0, moment_1.default)(expiryDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                    detail = {
                        linkedPurchaseToken: response.data.linkedPurchaseToken,
                        expiryTime: date,
                    };
                }
                else {
                    const response = await axios_1.default.post(process.env.IOS, // For production environment
                    {
                        "receipt-data": payloadValue.data,
                        password: process.env.PASSWORD,
                        "exclude-old-transactions": false,
                    });
                    // console.log(process.env.IOS, "ios", process.env.PASSWORD, "password");
                    // fs.writeFileSync("payloadValue1.json", JSON.stringify(response.data));
                    const { status, latest_receipt_info, latest_receipt, pending_renewal_info, } = response.data;
                    // console.log("status", status);
                    // console.log("dataaaaaaaaaa", response.data);
                    if (status === 0) {
                        // console.log("me to if k andar hu");
                        // Successful receipt validation
                        const validReceiptInfo = latest_receipt_info.find((receipt) => receipt.transaction_id === payloadValue.receiptId);
                        if (validReceiptInfo) {
                            // console.log("validReceiptInfo", validReceiptInfo);
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
                    const subscription = await (0, inApp_1.saveInApp)(new inApp_1.inAppModel({
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
                    let expiredTime;
                    let plan;
                    if (payloadValue.subscriptionType == "WEEKLY") {
                        expiredTime = (0, moment_1.default)()
                            .add(7, "days")
                            .add(3, "minutes")
                            .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                        plan = "WEEKLY";
                    }
                    else if (payloadValue.subscriptionType == "MONTHLY") {
                        expiredTime = (0, moment_1.default)()
                            .add(1, "months")
                            .add(3, "minutes")
                            .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                        plan = "MONTHLY";
                    }
                    //  else if (payloadValue.subscriptionType == "6-MONTHLY") {
                    //   expiredTime = moment()
                    //     .add(6, "months")
                    //     .add(3, "minutes")
                    //     .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                    // }
                    else if (payloadValue.subscriptionType == "YEARLY_OFFER") {
                        expiredTime = (0, moment_1.default)()
                            .add(1, "years")
                            .subtract(3, "minutes")
                            .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                        plan = "YEARLY";
                    }
                    else if (payloadValue.subscriptionType == "YEARLY") {
                        expiredTime = (0, moment_1.default)()
                            .add(1, "years")
                            .subtract(3, "minutes")
                            .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                        plan = "YEARLY";
                    }
                    else {
                        res
                            .status(500)
                            .json({ message: "please provide valid subscriptionType" });
                    }
                    await this.taskSchedule(expiredTime, authUser._id);
                    await (0, user_1.updateUser)(new user_1.User({
                        ...authUser,
                        premiumExpiryDate: expiredTime,
                        isProUser: true,
                        isPurchased: true,
                        premiumType: plan,
                        token,
                        dailyCredits: 0,
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
//# sourceMappingURL=inApp.controller.js.map