import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import BaseEmbed from "@common/BaseEmbed";
import { ContextCommand } from "@common/Command";

export default <ContextCommand>{
  data: new ContextMenuCommandBuilder()
    .setName("LGTFY")
    .setDMPermission(false)
    .setType(ApplicationCommandType.Message),
  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const question = interaction.targetMessage.content;
    const embed = new BaseEmbed()
      .setTitle(question)
      .setURL(`https://letmegooglethat.com/?q=${question.replace(/ /g, "+")}`);
    interaction.reply({ embeds: [embed] });
  },
};