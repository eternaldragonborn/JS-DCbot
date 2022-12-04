import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { ButtonComponent, Discord, Guild, Slash } from "discordx";

import { guilds } from "../../constants/const.js";

@Discord()
@Guild([guilds.test])
export class Example {
  @Slash("hello")
  async hello(interaction: CommandInteraction) {
    await interaction.deferReply();

    // Create the button, giving it the id: "hello-btn"
    const helloBtn = new MessageButton()
      .setLabel("Hello")
      .setEmoji("👋")
      .setStyle("PRIMARY")
      .setCustomId("hello-btn");

    // Create a MessageActionRow and add the button to that row.
    const row = new MessageActionRow().addComponents(helloBtn);

    interaction.editReply({
      content: "Say hello to bot",
      components: [row],
    });
  }

  // register a handler for the button with id: "hello-btn"
  @ButtonComponent("hello-btn")
  myBtn(interaction: ButtonInteraction) {
    interaction.reply(`👋 ${interaction.member}`);
  }
}
