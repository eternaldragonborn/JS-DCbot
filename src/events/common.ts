import { Client, Discord, On } from "discordx";

import type { ArgsOf } from "discordx";

@Discord()
export class CommonEvents {
  @On({ event: "interactionCreate" })
  async onInteractionCreate(
    [interaction]: ArgsOf<"interactionCreate">,
    client: Client,
  ) {
    await client.executeInteraction(interaction);
  }
}
