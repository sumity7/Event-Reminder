import userModal from "../models/userModel.js";
import { generateOccasionMessage } from "../utils/reminder.js";
import axios from "axios";

const festival = [
  // Diwali
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525261/xdiljj8fcuzcqeql3nvi.png",
  // Rakshabandhan
  "https://res.cloudinary.com/detirn2nl/image/upload/v1753525260/j0jf0ad3wd98pxzt94qr.png",
];

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

function getYearsSince(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  let years = today.getFullYear() - date.getFullYear();
  const beforeAnniversary =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  if (beforeAnniversary) years--;
  return years;
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
        const age = getYearsSince(ev.date);
        const recipient_name = ev.name;
        const event_type = ev.event;
        const custom_message = await generateOccasionMessage({
          age,
          event_type,
          relation: ev.relation,
        });

        let imageUrl =
          "https://res.cloudinary.com/detirn2nl/image/upload/v1753525261/xdiljj8fcuzcqeql3nvi.png";
        if (event_type === "Birthday") {
          const randomIndex = Math.floor(Math.random() * birthday.length);
          imageUrl = birthday[randomIndex];
        } else if (event_type === "Festival") {
          const randomIndex = Math.floor(Math.random() * festival.length);
          imageUrl = festival[randomIndex];
        } else if (event_type === "Anniversary") {
          const randomIndex = Math.floor(Math.random() * anniversary.length);
          imageUrl = anniversary[randomIndex];
        }

        try {
          const response = await axios({
            url: `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_APP_ID}/messages`,
            method: "post",
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            data: {
              messaging_product: "whatsapp",
              to: `91${ev.phone}`,
              type: "template",
              template: {
                name: "event_reminder",
                language: {
                  code: "en",
                },
                components: [
                  {
                    type: "header",
                    parameters: [
                      {
                        type: "image",
                        image: {
                          link: imageUrl,
                        },
                      },
                    ],
                  },
                  {
                    type: "body",
                    parameters: [
                      {
                        type: "text",
                        parameter_name: "recipient_name",
                        text: recipient_name,
                      },
                      {
                        type: "text",
                        parameter_name: "event_type",
                        text: event_type,
                      },
                      {
                        type: "text",
                        parameter_name: "custom_message",
                        text: custom_message,
                      },
                      {
                        type: "text",
                        parameter_name: "sender_name",
                        text: sender_name,
                      },
                    ],
                  },
                ],
              },
            },
          });
          console.log(response.data);
        } catch (error) {
          console.error(
            "WhatsApp API Error:",
            error.response?.data || error.message,
          );
        }
      }
    }
  }
}
