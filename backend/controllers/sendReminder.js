import userModal from "../models/userModel.js";
import axios from "axios";
import { generateOccasionMessage } from "../utils/reminder.js";

const safe = (val) => {
  if (!val) return "N/A";
  const str = String(val)
    .trim()
    .replace(/[^\x00-\x7F]/g, ""); // Remove all emojis/non-ASCII
  return str.length > 0 ? str : "N/A";
};

const birthday = [
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525166/byst9enfypgr4uhkjkbm.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525101/ixefoctay6s7pklqelat.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525101/b0v8sbhgs7joui6g4jj2.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525102/kkwzhxrulpurlyvp9f2e.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525100/cbwwgbnn94qprb2eka3j.png",
];

const anniversary = [
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525260/xo09pcoxetgnmlg79umc.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525261/wxpeky6clhgxusvbqbmf.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525165/kkmvkvizmhjjdx20xaxj.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525166/lgyiheatwawjcct0ns9l.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525166/yzf2qqnffw9ei0bzxkn0.png",
];

const festival = [
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525261/xdiljj8fcuzcqeql3nvi.png",
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525260/j0jf0ad3wd98pxzt94qr.png",
];

function getImageForEvent(eventType) {
  const type = (eventType || "").toLowerCase();
  let arr;
  if (type.includes("birthday")) arr = birthday;
  else if (type.includes("anniversary")) arr = anniversary;
  else arr = festival;
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function checkAndSendMessages() {
  const users = await userModal.find();
  const today = new Date();

  for (const user of users) {
    const sender_name = user.name;

    for (const ev of user.events) {
      const eventDate = new Date(ev.date);

      if (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth()
      ) {
        console.log("📋 Processing event:", {
          name: ev.name,
          event: ev.event,
          phone: ev.phone,
          relation: ev.relation,
          sender: sender_name,
        });

        let custom_message;
        try {
          custom_message = await generateOccasionMessage({
            age: 0,
            event_type: ev.event,
            relation: ev.relation || "friend",
          });
          // Strip emojis from AI response
          custom_message = custom_message.replace(/[^\x00-\x7F]/g, "").trim();
          console.log("✅ Generated message:", custom_message);
        } catch (err) {
          console.log("⚠️ Groq failed, using fallback:", err.message);
          // No emoji in fallback!
          custom_message = `Wishing you a very happy ${ev.event}. May this day bring you lots of joy and happiness.`;
        }

        const imageUrl = getImageForEvent(ev.event);

        const params = {
          recipient_name: safe(ev.name),
          event_type: safe(ev.event),
          custom_message: safe(custom_message),
          sender_name: safe(sender_name),
        };
        console.log("📤 Parameters being sent:", params);

        try {
          const response = await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: "whatsapp",
              to: `91${ev.phone}`,
              type: "template",
              template: {
                name: "event_reminder",
                language: { code: "en" },
                components: [
                  {
                    type: "header",
                    parameters: [
                      {
                        type: "image",
                        image: { link: imageUrl },
                      },
                    ],
                  },
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: params.recipient_name },
                      { type: "text", text: params.event_type },
                      { type: "text", text: params.custom_message },
                      { type: "text", text: params.sender_name },
                    ],
                  },
                ],
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("✅ Message sent to", ev.phone, ":", response.data);
        } catch (error) {
          console.error(
            `❌ WhatsApp API Error for ${ev.phone}:`,
            error.response?.data || error.message
          );
        }
      }
    }
  }
}