import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageReaction,
  VoiceState,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  ContextMenuCommandInteraction,
} from "discord.js";
import { GuardFunction, SimpleCommandMessage } from "discordx";

import type { ArgsOf } from "discordx";

export const NotBot: GuardFunction<
  | ArgsOf<"messageCreate" | "messageReactionAdd" | "voiceStateUpdate">
  | ButtonInteraction
  | ChannelSelectMenuInteraction
  | CommandInteraction
  | ContextMenuCommandInteraction
  | MentionableSelectMenuInteraction
  | ModalSubmitInteraction
  | StringSelectMenuInteraction
  | SimpleCommandMessage
> = async (arg, client, next, guardData) => {
  const argObj = arg instanceof Array ? arg[0] : arg;
  const user =
    argObj instanceof CommandInteraction
      ? argObj.user
      : argObj instanceof MessageReaction
      ? argObj.message.author
      : argObj instanceof VoiceState
      ? argObj.member?.user
      : argObj instanceof Message
      ? argObj.author
      : argObj instanceof SimpleCommandMessage
      ? argObj.message.author
      : argObj instanceof ButtonInteraction ||
        argObj instanceof ChannelSelectMenuInteraction ||
        argObj instanceof CommandInteraction ||
        argObj instanceof ContextMenuCommandInteraction ||
        argObj instanceof MentionableSelectMenuInteraction ||
        argObj instanceof ModalSubmitInteraction ||
        argObj instanceof StringSelectMenuInteraction
      ? argObj.member?.user
      : argObj.message.author;

  if (!user?.bot) {
    guardData.message = "the NotBot guard passed";
    await next();
  }
};
