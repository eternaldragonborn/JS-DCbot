import {
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
} from "@discordjs/builders";
import { Message, BaseMessageOptions, PartialMessage } from "discord.js";

/**
 * CSopy `message`'s content, attachments, and embeds to a new payload
 * @param message the message to copy
 * @returns new payload
 */
export const copyMessagePayload = (message: Message | PartialMessage) => {
  const payload: BaseMessageOptions = {
    content: message.content + "\n",
  };

  // attachments
  if (message.attachments) {
    let size = 0;
    let urls = <string[]>[];
    let files = <any[]>[];

    message.attachments.forEach((attachment) => {
      urls.push(attachment.proxyURL);
      files.push(attachment.attachment);
      size += attachment.size;
    });

    // attachment size too large
    if (size < 7.5 * 1024) payload.files = files;
    else payload.content += urls.join("\n");
  }

  // embed
  if (message.embeds.length) payload.embeds = message.embeds;

  return payload;
};

/**
 * Auto delete message sended by `sendMessage` after `delay` sec
 * @param sendMessage the function of sending message
 * @param delay unit: second
 */
export const deleteAfter = async (
  sendMessage: Promise<Message>,
  delay: number = 7,
) => {
  const message = await sendMessage;
  setTimeout(async () => await message.delete(), delay * 1_000);
};

export const newMessageActionRow = () => {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>();
};

export async function getResult<T>(
  fn: Promise<T>,
): Promise<[T, null] | [null, Error]> {
  try {
    const result = await fn;
    return [result, null];
  } catch (e: any) {
    // logger.error(e);
    return [null, e];
  }
}
