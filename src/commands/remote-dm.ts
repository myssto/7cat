import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { replyWithError, searchUsers } from "@common/Function";
import BaseEmbed from "@common/BaseEmbed";
import Command from "@common/Command";

export default <Command> {
  data: new SlashCommandBuilder()
    .setName("remote-dm")
    .setDescription("DM a user from the bot's account")
    .setDMPermission(false)
    .addStringOption(option => (option.setName("user").setDescription("Target user").setRequired(true)))
    .addStringOption(option => (option.setName("message").setDescription("Message content").setRequired(true))),
  devOnly: true,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const messageContent = interaction.options.getString("message", true);
    if (messageContent === " ") {
      await interaction.reply({
        embeds: [new BaseEmbed().setDescription("Message content cannot be empty!")],
      });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const searchTarget = interaction.options.getString("user", true);
    let targetUser = await searchUsers(searchTarget, interaction);
    if (!targetUser) {
      await interaction.followUp({
        embeds: [new BaseEmbed().setDescription("Could not locate target user!")],
      });
      return;
    }
    if (targetUser instanceof GuildMember) {
      targetUser = targetUser.user;
    }
    try {
      await targetUser.send({ content: messageContent });
      interaction.followUp({ embeds: [new BaseEmbed().setDescription(`Message successfully sent to ${targetUser.tag}`)], ephemeral: true });
    } catch (err) {
      if (err instanceof Error) {
        await replyWithError(interaction, err);
      }
      return;
    }
  },
};