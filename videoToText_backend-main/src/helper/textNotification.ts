import { getAllUserForNotification } from "../modules/user";
import { sendNotification } from "./sendNotification";
export const sendTextNotification = async (notificationType: string) => {
  const users = await getAllUserForNotification();

  let fcmToken: any[] = [];

  const body = [
    "Who Needs a Magic Wand? ✨ Gemini just turned your image into a hilarious masterpiece. Get ready to laugh out loud in our application! 😂🎉",

    "Calling All Artists! 📣 Gemini has whipped up a visual delight from your image. Jump into our application and witness how your creative visions come to life! 🎨",

    "Image + Gemini = Instant Art! 🎨 Your ordinary image just got a sensational makeover with a side-splitting masterpiece. Explore the world of AI-generated creativity in our application! 🤪🎭",

    "Put a Smile on Your Image! 😄 Gemini transformed your picture into a funny artwork that'll brighten your day. Explore, download, and share the joy in our application! 🤣",

    "From Basic to Breathtaking! 😮 Gemini has given your image a makeover it deserves. Explore the humorous side of AI-generated art in our application! 🎭",

    "Attention: Image Gone Wild! 🚀 Gemini has unleashed a hilarious masterpiece based on your input?. Dive into our application and see how your visuals can come to life in unexpected ways! 🎉",

    "It's Raining Laughter! ☔ Gemini just showered your image with a burst of humor. Head to our application and discover the comedic brilliance of AI-generated art! 😆",

    "Unlock the Fun Factory! 🎉 Gemini has cooked up a side-splitting artwork from your image. Join the party in our application and share a laugh with fellow users! 🎭",

    "Image to the Rescue! 🚀 Gemini has elevated your picture from ordinary to extraordinary with a humorous twist. Explore the realm of imaginative creativity in our application and be amazed! 😄",

    "Gemini Presents 🎭 Your image has been transformed into a hilarious masterpiece that will crack you up. Explore, download, and get ready to ROFL in our application! 😂",

    "Turning Dreams into Art! 🌟 Let Gemini weave its magic and turn your image into a laugh-out-loud experience. Explore the wonders in our application and let your imagination run wild! 🎨",

    "Artistic Alchemy Unleashed! 🎨 Gemini has taken your image and turned it into a whimsical masterpiece. Discover the realm of AI-generated art in our application and be captivated! ✨",

    "Image Metamorphosis Complete! 🌀 Watch in awe as Gemini reshapes your image into a hilarious visual delight. Delve into our application and embrace the world of imaginative possibilities! 🎭",

    "Laugh-a-Palooza Activated! 🎉 Gemini has infused your image with humor and created a masterpiece that'll leave you in stitches. Join the fun in our application and share the joy! 😄",

    "Image Overhaul, Courtesy of Gemini! 🖌️ Witness the magic as Gemini turns your image into a comedic work of art. Head to our application and immerse yourself in AI-powered creativity! 🤣",

    "Imagination Ignited by Gemini! 🔥 Let your image come to life with a dose of humor, courtesy of Gemini. Explore the possibilities in our application and prepare for laughter! 😆",

    "Artistry Redefined by Gemini! 🎨 Watch as your image is transformed into a hilarious masterpiece that defies expectations. Step into our application and experience the art of amusement! 🎭",

    "Gemini's Comedy Canvas! 🎨 Discover the artistic prowess of Gemini as it converts your image into a sidesplitting marvel. Dive into our application and let laughter paint the day! 😂",

    "Imaginative Evolution Unveiled! 🚀 Gemini has propelled your image into a realm of humor and creativity. Explore the transformation in our application and unlock the door to endless fun! 🎉",

    "Masterpiece by Gemini 🎨 Your image has been playfully transformed into a laughter-inducing artwork. Immerse yourself in our application, where artistic ingenuity knows no bounds! 🤣",
  ];

  if (users) {
    users.forEach((user) => {
      if (user.FCMToken ?? [].length > 0) {
        fcmToken.push(...(user.FCMToken ?? []));
      }
    });
  }

  const tokens = removeEmptyToken(fcmToken, ["", null, undefined]);

  const number = Math.ceil(fcmToken.length / 490);

  for (let i = 0; i < number; i++) {
    const chunk = tokens.slice(i * 490, (i + 1) * 490);

    const notificationObj = {
      tokens: chunk,
      notification: {
        title: "Gemini: AI Photo Enhancer",
        body: body[Math.floor(Math.random() * body.length)],
      },
      data: {
        type: notificationType,
      },
    };

    await sendNotification(notificationObj);
    // await saveNotification(new Notification({ title: "title", body: "body" }));
  }
};

export const removeEmptyToken = (arr: string[], value: any[]) => {
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
