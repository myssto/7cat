import { createEmoji, validateName, validateURL } from "./create-emoji";
import { ChatInputCommandInteraction } from "discord.js";
import Command from "@common/Command";

export default <Partial<Command>>{
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const emojiURL = interaction.options.getString("url", true);
    if (!(await validateURL(emojiURL, interaction))) return;

    const emojiName = interaction.options.getString("name", true);
    if (!(await validateName(emojiName, interaction))) return;

    createEmoji(interaction, { attachment: emojiURL, name: emojiName });
  },
};