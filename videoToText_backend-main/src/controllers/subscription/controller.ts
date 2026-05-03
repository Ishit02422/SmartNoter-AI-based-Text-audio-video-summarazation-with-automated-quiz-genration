import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import {
  getSubscriptionByReceiptId,
  saveSubscription,
} from "../../modules/subscription";
import { get as _get } from "lodash";
import moment from "moment";
import { google } from "googleapis";
import axios from "axios";
import { SubscriptionModel } from "../../modules/subscription/schema";
import { taskSchedule } from "../../helper/taskSchedule";
import { IUser, updateUser } from "../../modules/user";
import { UserModel } from "../../modules/user/schema";
export default class Controller {
  private readonly updateCoinsSchema = Joi.object().keys({
    receiptId: Joi.string().required(),
    data: Joi.string().required(),
    purchase: Joi.string().required(),
    deviceId: Joi.string().required(),
    appType: Joi.string().required(),
    price: Joi.string().required(),
    store: Joi.string().required(),
    subscriptionType: Joi.string()
      .valid("WEEKLY", "MONTHLY", "YEARLY")
      .required(),
  });
  protected readonly purchaseCoinsSubscriptionController = async (
    req: Request,
    res: Response
  ) => {
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
          if (isError(e)) {
            res.status(422).json({ message: e.message });
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      // const user = await getUserById(authUser._id);
      const subscription = await getSubscriptionByReceiptId(
        payloadValue.receiptId
      );
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
      const auth = new google.auth.GoogleAuth({
        keyFile: "./credentials/keyFile.json",
        scopes: process.env.ANDROID,
      });

      let productId;

      if (payloadValue.subscriptionType == "WEEKLY") {
        productId = "animart_weekly";
      } else if (payloadValue.subscriptionType == "MONTHLY") {
        productId = "animart_6month";
      } else if (payloadValue.subscriptionType == "YEARLY") {
        productId = "animart_yearly";
      }
      const playDeveloper = google.androidpublisher({
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
      } else {
        const response = await axios.post(
          process.env.IOS, // For production environment
          {
            "receipt-data": payloadValue.data,
            password: process.env.IOS_PASSWORD,
            "exclude-old-transactions": false,
          }
        );
        // fs.writeFileSync("payloadValue1.json", JSON.stringify(response.data));
        const {
          status,
          latest_receipt_info,
          latest_receipt,
          pending_renewal_info,
        } = response.data;
        if (status === 0) {
          // Successful receipt validation
          const validReceiptInfo = latest_receipt_info.find(
            (receipt) => receipt.transaction_id === payloadValue.receiptId
          );

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
          } else {
            // Invalid subscription
            console.log("Invalid subscription receipt");
            flag = false;
            return res
              .status(555)
              .json({ message: "Invalid subscription receipt." });
          }
        } else {
          // Receipt validation failed
          console.log(
            "Receipt validation failed from AppStore from Subscription."
          );
          flag = false;
          return res.status(500).json({
            message: "Something happened wrong try again after sometime.",
          });
        }
      }
      if (flag) {
        const subscription = await saveSubscription(
          new SubscriptionModel({
            receiptId: payloadValue.receiptId,
            userId: authUser._id,
            data: payloadValue.data,
            deviceId: payloadValue.deviceId,
            appType: payloadValue.appType,
            price: payloadValue.price,
            store: payloadValue.store,
            subscriptionType: payloadValue.subscriptionType,
            detail,
          })
        );
        const type = String(payloadValue.subscriptionType).toUpperCase();
        let expiredTime;

        switch (type) {
          case "WEEKLY":
            expiredTime = moment()
              .add(7, "days")
              .add(3, "minutes")
              .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            break;

          case "MONTHLY":
            expiredTime = moment()
              .add(1, "months")
              .add(3, "minutes")
              .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            break;

          case "YEARLY":
            expiredTime = moment()
              .add(1, "years")
              .add(3, "minutes")
              .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            break;

          default:
            return res
              .status(400)
              .json({ message: "please provide valid subscriptionType" });
        }

        await taskSchedule(expiredTime, authUser._id);
        await updateUser(
          new UserModel({
            ...authUser,
            premiumExpiryDate: expiredTime,
            isProUser: true,
            dailyCredits: 50,
            premiumType: payloadValue.subscriptionType,
          })
        );
        return res
          .status(200)
          .json({ message: "subscription purchased successfully." });
      }
    } catch (error) {
      console.log(
        "error",
        "error in purchasing user#################### ",
        error
      );
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
