import { GatewayIntentBits, Partials } from "discord.js";
import { DragonBot, db, errorLogging } from "./modules";

const bot = new DragonBot({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  simpleCommand: {
    prefix: "+",
  },
  // botGuilds: process.env.DEV ? [guilds.test] : undefined,
});

async function initialize() {
  await db.init();
  await bot.init();
}

initialize().catch((e) => {
  errorLogging("Bot初始化錯誤", { reason: e });
  return;
});

export { bot };
