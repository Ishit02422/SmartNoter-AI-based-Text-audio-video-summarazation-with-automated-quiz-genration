import { messaging } from "firebase-admin";
import { MulticastMessage } from "firebase-admin/lib/messaging/messaging-api";

export const sendNotification = async (notification: MulticastMessage) => {
  const tokens = removeEmptyToken(notification.tokens, ["", null, undefined]);

  if (tokens.length) {
    messaging()
      .sendEachForMulticast(notification)
      .then(async (response) => {
        console.log("Notification Send Successfully....");
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  }
};

export const removeEmptyToken = (arr: string[], value: string[]) => {
  var i = 0;
  if (!arr.length) return [];
  while (i < arr.length) {
    if (value.includes(arr[i])) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
};
