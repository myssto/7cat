import { APIEmoji, APIPartialEmoji, ChatInputCommandInteraction, inlineCode, parseEmoji } from "discord.js";
import BaseEmbed from "@common/BaseEmbed";
import Command from "@common/Command";
import { createEmoji } from "./create-emoji";

export default <Partial<Command>>{
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const emojiRef = interaction.options.getString("emoji", true);
    let emoji: APIEmoji | APIPartialEmoji | null;
    try {
      emoji = parseEmoji(emojiRef);
      if (emoji === null || !emoji?.id || !emoji?.name) {
        throw new Error(`Unable to parse invalid emoji: ${emojiRef}`);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        await interaction.reply({
          embeds: [new BaseEmbed().setDescription(`An error occurred trying to create the emoji:\n\n${inlineCode(err.message)}`)],
          ephemeral: true,
        });
      }
      return;
    }
    const emojiURL = emoji.animated
      ? `https://cdn.discordapp.com/emojis/${emoji.id}.gif`
      : `https://cdn.discordapp.com/emojis/${emoji.id}.png`;

    createEmoji(interaction, { attachment: emojiURL, name: emoji.name });
  },
};