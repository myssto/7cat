import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  userMention,
} from "discord.js";
import Command from "@common/Command";
import { baseColor } from "@common/BaseEmbed";

export default <Command>{
  data: new SlashCommandBuilder()
    .setName("pfp")
    .setDescription("Display a user's profile picture")
    .addUserOption(option => option.setName("user").setDescription("Target user").setRequired(true))
    .addBooleanOption(option => option.setName("ephemeral").setDescription("Make response ephemeral").setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("user", true);
    const ephemeral = interaction.options.getBoolean("ephemeral", false) ?? false;
    const pfpURL = user.displayAvatarURL({ extension: "png", forceStatic: false, size: 2048 });

    const embed = new EmbedBuilder()
      .setDescription(userMention(user.id))
      .setImage(pfpURL)
      .setColor(user.accentColor ?? baseColor);
    const linkButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Link")
      .setURL(pfpURL);
    const row = new ActionRowBuilder().addComponents(linkButton);

    await interaction.reply({
      embeds: [embed],
      // Some sort of typing error within DJS that disallows adding components as described in the docs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line: Unreachable code error
      components: [row],
      ephemeral: ephemeral,
    });
  },
};