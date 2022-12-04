import {DragonBot, db, logger, errorLogging} from "./modules/index.js";

const bot = new DragonBot({
  intents: [32767],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  simpleCommand: {
    prefix: "+",
  },
});

async function initialize() {
  await db.init();
  await bot.init();
}

initialize().catch(e => {
  errorLogging("Bot初始化錯誤", {reason: e});
});

export { bot };
