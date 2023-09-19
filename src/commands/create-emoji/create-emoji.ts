import {
  ChatInputCommandInteraction,
  GuildEmoji,
  GuildEmojiCreateOptions,
  PermissionFlagsBits,
  SlashCommandBuilder,
  inlineCode,
} from "discord.js";
import BaseEmbed from "@common/BaseEmbed";
import Command from "@common/Command";

export default <Command>{
  data: new SlashCommandBuilder()
    .setName("create-emoji")
    .setDescription("Creates an emoji and adds it to this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
    .addSubcommand(subcommand =>
      subcommand
        .setName("steal")
        .setDescription("Steals an existing emoji")
        .addStringOption(option => option.setName("emoji").setDescription("Which emoji to steal").setRequired(true)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("url")
        .setDescription("Add an emoji from a link")
        .addStringOption(option => option.setName("url").setDescription("URL of the emoji").setRequired(true))
        .addStringOption(option =>
          option
            .setName("name")
            .setDescription("Name of the emoji")
            .setMinLength(2)
            .setMaxLength(32)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("attatchment")
        .setDescription("Add an emoji from an attatchment")
        .addAttachmentOption(option => option.setName("image").setDescription("Image of the emoji").setRequired(true))
        .addStringOption(option =>
          option
            .setName("name")
            .setDescription("Name of the emoji")
            .setMinLength(2)
            .setMaxLength(32)
            .setRequired(true)
        )
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.appPermissions?.has(PermissionFlagsBits.ManageGuildExpressions)) {
      await interaction.reply({
        embeds: [new BaseEmbed().setDescription(`I do not have ${inlineCode("Manage Guild Expressions")} permission in this server!`)],
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const commandModule = await import(`./${subcommand}`);
    const command: Partial<Command> = commandModule.default;

    command.execute?.(interaction);
  },
};

// All three subcommands utilize after collecting inputs
export async function createEmoji(interaction: ChatInputCommandInteraction, options: GuildEmojiCreateOptions): Promise<void> {
  await interaction.deferReply();
  try {
    const emoji = await interaction.guild?.emojis.create(options);
    if (!(emoji instanceof GuildEmoji)) {
      throw new Error(`Unable to create emoji with options: ${options}`);
    }
    const emojiName = emoji.name ?? "unknown";

    const embed = new BaseEmbed()
      .setTitle("Created a new emoji")
      .setImage(emoji.url)
      .setFooter({ text: emojiName });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      await interaction.editReply(
        { embeds: [new BaseEmbed().setDescription(`An error occurred trying to create the emoji:\n\n${inlineCode(err.message)}`)] }
      );
      return;
    }
  }
}

// Input validation
export async function validateURL(url: string, interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (!url.endsWith(".png") && !url.endsWith(".jpg") && !url.endsWith(".jpeg") && !url.endsWith(".gif")) {
    await interaction.reply({
      embeds: [new BaseEmbed().setDescription("Image must be a jpg, png, or gif!")],
      ephemeral: true,
    });
    return false;
  } else {
    return true;
  }
}

export async function validateName(name: string, interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (name.includes(" ")) {
    await interaction.reply({
      embeds: [new BaseEmbed().setDescription("Emoji names cannot include spaces!")],
      ephemeral: true,
    });
    return false;
  } else {
    return true;
  }
}