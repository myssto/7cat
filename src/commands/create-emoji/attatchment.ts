import { createEmoji, validateName, validateURL } from "./create-emoji";
import { ChatInputCommandInteraction } from "discord.js";
import Command from "@common/Command";

export default <Partial<Command>>{
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const attachment = interaction.options.getAttachment("image", true);
    if (!(await validateURL(attachment.url, interaction))) return;

    const emojiName = interaction.options.getString("name", true);
    if (!(await validateName(emojiName, interaction))) return;

    createEmoji(interaction, { attachment: attachment.url, name: emojiName });
  },
};