import "reflect-metadata";

import { importx } from "@discordx/importer";
import { Client, ClientOptions } from "discordx";

import { errorLogging, logger } from "./logger.js";

export class DragonBot extends Client {
  constructor(options: ClientOptions) {
    super(options);
  }

  async init() {
    if (!process.env["BOT_TOKEN"]) {
      errorLogging("NO BOT TOKEN");
      throw Error("No token");
    }

    try {
      if (process.env["DEV"])
        await importx(`${process.cwd()}/src/{events,commands}/**/*.{js,ts}`);
      else
        await importx(`${process.cwd()}/dist/{events,commands}/**/*.{js,ts}`);

      await this.login(process.env["BOT_TOKEN"]!);
      this.botId = this.user!.id;

      await this.initApplicationCommands();
      await this.initApplicationPermissions();

      logger.info("bot initialized");
    } catch (error: any) {
      errorLogging("Bot initialize failed", { reason: error });
    }
  }
}
