import { MessageButton } from "discord.js";

const owner = "384233645621248011";

const manager = [
  owner,
  "590430031281651722", // Traveler
  "546614210243854337", // Juxta
  "501782173364518912", // Raticate
];

const guilds = {
  test: "719132687897591808",
  furry: "968540758107910164",
  main: ["719132687897591808", "968540758107910164"],
};

const testChannel = "855768767330385962";
const channels = {
  test: testChannel,
  subscribe_notification: "968540758594449466",
  subscribe_category: "968540758594449461",
  subscribe_overview: "968540758594449467",
  book: {
    test: testChannel,
    subscriber: "968540758594449463",
    freeResource: "968540758418292790",
  },
};

const roles = {
  subscriber: "968540758107910173",
};

const emojis = {
  snack: "🐍",
  deleteMessage: "❎",
};

const websiteButton = new MessageButton({
  label: "網站連結",
  type: "BUTTON",
  style: "LINK",
  url: "https://fafnir-web.fly.dev/subscribe-sys",
});

export { owner, manager, guilds, channels, roles, emojis, websiteButton };
