import axios from "axios";
import { google } from "googleapis";
import { getUserById, updateUser } from "../modules/user";
import { getSubscriptionByUserId, updateSubscription } from "../modules/subscription";
import { UserModel } from "../modules/user/schema";
import { SubscriptionModel } from "../modules/subscription/schema";

const cron = require("node-cron");
const moment = require("moment");

export const taskSchedule = async (date, userId) => {
  // debugger;

  // console.log(userId, "**********");
  // console.log(date, "?????????????????");

  let [year, month, day, hour, minute] = date.split(/[- :T]/);
  // console.log(year, month, day, hour, minute, "year, month, day, hour, minute");
  // console.log(`${minute} ${hour} ${day} ${month} *`, "cron expression");

  // Schedule the task using node-cron
  cron.schedule(`${minute} ${hour} ${day} ${month} *`, async () => {
    const user = await getUserById(userId);
    console.log("your subscription end", new Date());
    const inApp = await getSubscriptionByUserId(user._id as string);
    if (inApp.length > 0) {
      // console.log(inApp[0].detail.latestData, "inApp[0].detail.latestData");
      // console.log(inApp[0].detail, "%%%%%%%%%%%%");
      let isPro = false;
      if (inApp[0].appType == "isIos") {
        // console.log("ios");

        const response = await axios.post(
          process.env.IOS, // For production environment
          {
            //@ts-ignore
            "receipt-data": inApp[0].detail.latestData,
            password: process.env.IOS_PASSWORD,
            "exclude-old-transactions": false,
          }
        );
        const {
          status,
          latest_receipt_info,
          latest_receipt,
          pending_renewal_info,
        } = response.data;
        if (status === 0) {
          // Successful receipt validation
          const validReceiptInfo = latest_receipt_info.find(
            (receipt) => receipt.transaction_id === inApp[0].receiptId
          );
          console.log(validReceiptInfo, ":::::::::::::::::");

          if (validReceiptInfo) {
            // Valid subscription
            inApp[0].detail = {
              environment: response.data.environment,
              latestReceipt: validReceiptInfo,
              latestData: latest_receipt,
            };
            console.log(pending_renewal_info, "????????????????????");

            // Check if the subscription is auto-renewable
            // const isAutoRenewable = validReceiptInfo.auto_renew_status === "1";
            const isAutoRenewable =
              pending_renewal_info[0].auto_renew_status == "1";
            console.log("isAutoRenewableeeeeeeeeeee", isAutoRenewable);

            console.log("isAutoRenewable", isAutoRenewable);
            if (!isAutoRenewable) {
              console.log(user, "^^^^^^^^^^^^^^^^^^^^^^");

              await updateUser(
                new UserModel({
                  ...user,
                  isProUser: false,
                  isPurchased: false,
                  glitter: 0,
                  premiumType: "FREE",
                })
              );
              isPro = false;
            }
          } else {
            // Invalid subscription
            console.log("Invalid subscription receipt");
            await updateUser(
              new UserModel({
                ...user,
                isProUser: false,
                isPurchased: false,
                glitter: 0,
                premiumType: "FREE",
              })
            );
            isPro = false;
          }
        } else {
          await updateUser(
            new UserModel({
              ...user,
              isProUser: false,
              isPurchased: false,
              glitter: 0,
              premiumType: "FREE",
            })
          );
          isPro = false;
        }
      } else if (inApp[0].appType == "isAndroid") {
        const regex = /^GPA\.\d{4}-\d{4}-\d{4}-\d{5}(?:\.\.(?:[0-5]))?$/;
        const auth = new google.auth.GoogleAuth({
          keyFile: "./credentials/keyFile.json",
          scopes: process.env.ANDROID,
        });
        let productId;
        let flag = false;

        if (inApp[0].subscriptionType == "WEEKLY") {
          productId = "animart_weekly";
        } else if (inApp[0].subscriptionType == "MONTHLY") {
          productId = "animart_6month";
        } else if (inApp[0].subscriptionType == "YEARLY") {
          productId = "animart_yearly";
        }
        const playDeveloper = google.androidpublisher({
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
          console.log(response.data, "response");
          // console.log(response.data.autoRenewing, "response1");
          // console.log(!response.data.autoRenewing, "response2");

          if (!response.data.autoRenewing) {
            await updateUser(
              new UserModel({
                ...user,
                isProUser: false,
                glitter: 0,
                premiumType: "FREE",
              })
            );
            isPro = false;
          } else {
            let expiryTime = parseInt(response.data.expiryTimeMillis);
            const expiryDate = new Date(expiryTime);
            const formattedExpiryDate = expiryDate.toISOString();
            console.log(formattedExpiryDate, "formattedExpiryDate");
            //@ts-ignore
            inApp[0].detail.expiryTime = formattedExpiryDate;
            await updateSubscription(
              new SubscriptionModel({
                ...inApp[0].toObject(),
                receiptId: response.data.orderId,
              })
            );
            let expiredTime;
            if (inApp[0].subscriptionType == "WEEKLY") {
              expiredTime = moment()
                .add(7, "days")
                .add(3, "minutes")
                .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
              await taskSchedule(expiredTime, user._id);
            } else if (inApp[0].subscriptionType == "MONTHLY") {
              expiredTime = moment()
                .add(1, "months")
                .add(3, "minutes")
                .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
              await taskSchedule(expiredTime, user._id);
            } else if (inApp[0].subscriptionType == "YEARLY") {
              expiredTime = moment()
                .add(1, "years")
                .add(3, "minutes")
                .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
              await taskSchedule(expiredTime, user._id);
            }
            await updateUser(
              new UserModel({
                ...user,
                premiumExpiryDate:expiredTime,
                isProUser: true,
                isPurchased: true,
                premiumType: inApp[0].subscriptionType,
                glitter: 0,
              })
            );
            isPro = true;
          }
        } else {
          // console.log("elseeeeeeeeeeeeeeeeeee");
          await updateUser(
            new UserModel({
              ...user,
              isProUser: false,
              isPurchased: false,
              glitter: 0,
              premiumType: "FREE",
            })
          );
        }
      } else {
        await updateUser(
          new UserModel({
            ...user,
             isProUser: false,
              isPurchased: false,
              glitter: 0,
              premiumType: "FREE",
          })
        );
        isPro = false;
      }
    }
  });
};

// export const taskSchedule = async (date, userId) => {
//   const user = await getUserById(userId);
//   // console.log(userId, "**********");
//   // console.log(date, "?????????????????");

//   let [year, month, day, hour, minute] = date.split(/[- :T]/);
//   // console.log(year, month, day, hour, minute, "year, month, day, hour, minute");
//   // Schedule the task using node-cron
//   cron.schedule(`${minute} ${hour} ${day} ${month} *`, async () => {
//     console.log("your subscription end", new Date());
//     const subscription = await getSubscriptionByUserId(user._id);
//     if (subscription.length > 0) {
//       // console.log(subscription[0].detail.latestData, "subscription[0].detail.latestData");
//       // console.log(subscription[0].detail, "%%%%%%%%%%%%");
//       if (subscription[0].appType == "isIos") {
//         // console.log("ios");

//         const response = await axios.post(
//           process.env.IOS, // For production environment
//           {
//             //@ts-ignore
//             "receipt-data": subscription[0].detail.latestData,
//             password: process.env.IOS_PASSWORD,
//             "exclude-old-transactions": false,
//           }
//         );
//         const {
//           status,
//           latest_receipt_info,
//           latest_receipt,
//           pending_renewal_info,
//         } = response.data;

//         // console.log(response.data, "response");
//         if (status === 0) {
//           // Successful receipt validation
//           const validReceiptInfo = latest_receipt_info.find(
//             (receipt) => receipt.transaction_id === subscription[0].receiptId
//           );

//           if (validReceiptInfo) {
//             // Valid subscription
//             subscription[0].detail = {
//               environment: response.data.environment,
//               latestReceipt: validReceiptInfo,
//               latestData: latest_receipt,
//             };

//             // Check if the subscription is auto-renewable
//             const isAutoRenewable = validReceiptInfo.auto_renew_status === "1";
//             console.log("isAutoRenewable", isAutoRenewable);
//             if (!isAutoRenewable) {
//               await updateUser(
//                 new UserModel({
//                   ...user,
//                   isSubscribe: false,
//                   isProUser: false,
//                 })
//               );
//             }
//           } else {
//             // Invalid subscription
//             console.log("Invalid subscription receipt");
//             await updateUser(
//               new UserModel({
//                 ...user,
//                 isProUser: false,
//                 isSubscribe: false,
//               })
//             );
//           }
//         } else {
//           await updateUser(
//             new UserModel({
//               ...user,
//               isProUser: false,
//               isSubscribe: false,
//             })
//           );
//         }
//         // if (
//         //   response.data.status !== 0 &&
//         //   response.data.receipt.in_app.length > 0 &&
//         //   response.data.latest_receipt_info[0].transaction_id !==
//         //     //@ts-ignore
//         //     subscription[0].detail.latestReceipt.transaction_id
//         // ) {
//         //   // console.log("ifffffffffffffffffffff");

//         //   subscription[0].detail = {
//         //     environment: response.data.environment,
//         //     latestReceipt: response.data.latest_receipt_info[0],
//         //     latestData: response.data.latest_receipt,
//         //   };
//         //   const latestsubscription = await saveApp(new subscriptionModel(subscription[0]));
//         // } else {
//         //   // console.log("elseeeeeeeeeeeeeeeeeee");

//         //   await updateUser(
//         //     new UserModel({
//         //       ...user,
//         //       isSubscribe: false,
//         //     })
//         //   );
//         // }
//       } else if (subscription[0].appType == "isAndroid") {
//         // console.log("android");

//         // const regex = /^GPA\.\d{4}-\d{4}-\d{4}-\d{5}$/;
//         const regex = /^GPA\.\d{4}-\d{4}-\d{4}-\d{5}(?:\.\.(?:[0-5]))?$/;
//         // console.log(subscription[0].receiptId, "receiptId");
//         const auth = new google.auth.GoogleAuth({
//           keyFile: "./credentials/keyFile.json",
//           scopes: process.env.ANDROID,
//         });
//         let productId;

//         if (subscription[0].subscriptionType == "WEEKLY") {
//           productId = "animart_weekly";
//         } else if (subscription[0].subscriptionType == "MONTHLY") {
//           productId = "animart_6month";
//         } else if (subscription[0].subscriptionType == "YEARLY") {
//           productId = "animart_yearly";
//         }
//         const playDeveloper = google.androidpublisher({
//           version: "v3",
//           auth,
//         });
//         if (regex.test(subscription[0].receiptId)) {
//           const response = await playDeveloper.purchases.subscriptions.get({
//             packageName: process.env.PACKAGE_NAME,
//             subscriptionId: productId,
//             token: subscription[0].data,
//           });
//           // console.log(response.data, "response");

//           if (!response.data.autoRenewing) {
//             await updateUser(
//               new UserModel({
//                 ...user,
//                 isProUser: false,
//                 isSubscribe: false,
//               })
//             );
//           } else {
//             let expiryTime = parseInt(response.data.expiryTimeMillis);
//             const expiryDate = new Date(expiryTime);
//             const formattedExpiryDate = expiryDate.toISOString();
//             console.log(formattedExpiryDate, "formattedExpiryDate");
//             //@ts-ignore
//             subscription[0].detail.expiryTime = formattedExpiryDate;
//             await updateSubscription(
//               new subscriptionModel({
//                 ...subscription[0].toObject(),
//                 receiptId: response.data.orderId,
//               })
//             );
//             if (subscription[0].subscriptionType == "WEEKLY") {
//               const expiredTime = moment()
//                 .add(7, "days")
//                 .add(3, "minutes")
//                 .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
//               await updateUser(
//                 new UserModel({
//                   ...user,
//                   expiredTime,
//                   isProUser: false,
//                   isSubscribe: true,
//                   // inks: 0,
//                 })
//               );
//               // console.log(expiredTime, "expiredTime@@@@@@@@@@@@@@@@@@@@@@");

//               // await taskSchedule(formattedExpiryDate, authUser._id);
//               await taskSchedule(expiredTime, user._id);
//             } else if (subscription[0].subscriptionType == "MONTHLY") {
//               const expiredTime = moment()
//                 .add(6, "months")
//                 .add(3, "minutes")
//                 .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
//               await updateUser(
//                 new UserModel({
//                   ...user,
//                   expiredTime,
//                   isProUser: false,
//                   isSubscribe: true,
//                   // inks: 0,
//                 })
//               );
//               await taskSchedule(expiredTime, user._id);
//             } else if (subscription[0].subscriptionType == "YEARLY") {
//               const expiredTime = moment()
//                 .add(1, "years")
//                 .add(3, "minutes")
//                 .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
//               await updateUser(
//                 new UserModel({
//                   ...user,
//                   expiredTime,
//                   isProUser: false,
//                   isSubscribe: true,
//                 })
//               );
//               await taskSchedule(expiredTime, user._id);
//             }
//             // const expiredTime = moment()
//             //   // .add(7, "days")
//             //   .add(5, "minutes")
//             //   .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
//             // await updateUser(new UserModel({ ...user, expiredTime: expiredTime }));
//             // await taskSchedule(expiredTime, subscription[0]._id);
//             // await taskSchedule(formattedExpiryDate, subscription[0]._id);
//           }
//         } else {
//           // console.log("elseeeeeeeeeeeeeeeeeee");
//           await updateUser(
//             new UserModel({
//               ...user,
//               isProUser: false,
//               isSubscribe: false,
//             })
//           );
//         }
//       } else {
//         await updateUser(
//           new UserModel({
//             ...user,
//             isProUser: false,
//             isSubscribe: false,
//           })
//         );
//       }
//     }
//   });
// };
