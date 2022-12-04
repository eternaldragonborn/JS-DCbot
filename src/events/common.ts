import { Client, Discord, Guard, On } from "discordx";

import { logger } from "../modules/logger.js";
import { NotBot } from "./guards.js";

import type { ArgsOf } from "discordx";

@Discord()
export class CommonEvents {
  @On("ready")
  async onReady([client]: ArgsOf<"ready">) {
    logger.info(`Bot login as ${client.user.username}`);
  }

  @On("interactionCreate")
  async onInteractionCreate(
    [interaction]: ArgsOf<"interactionCreate">,
    client: Client,
  ) {
    await client.executeInteraction(interaction);
  }

  @On("messageReactionAdd")
  @Guard(NotBot)
  async onReactionAdd(
    [reaction, user]: ArgsOf<"messageReactionAdd">,
    client: Client,
  ) {
    await client.executeReaction(reaction, user);
  }
}
