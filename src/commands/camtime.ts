import * as chrono from "chrono-node";
import {
  ChatInputCommandInteraction,
  CommandInteraction,
  InteractionReplyOptions,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  TimestampStyles,
  inlineCode,
  time,
} from "discord.js";
import BaseEmbed from "@common/BaseEmbed";
import Command from "@common/Command";

// Every one min is equal to 7.83 cam mins
const camConst: number = 7.83;
const errContent: InteractionReplyOptions = { embeds: [new BaseEmbed().setDescription("Error parsing your message!")], ephemeral: true };

export default <Command>{
  data: new SlashCommandBuilder()
    .setName("camtime")
    .setDescription("Convert regular time to Cam time")
    .setDMPermission(false)
    .addStringOption(option => option.setName("time").setDescription("Amount of time (e.g. 20 minutes from now)").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("time", true).toLowerCase();
    const dateRef = interaction.createdAt;
    shared(text, dateRef, interaction);
  },
};

export async function executeContext(interaction: MessageContextMenuCommandInteraction): Promise<void> {
  const { content, createdAt, url } = interaction.targetMessage;
  const ref: chrono.en.ParsingReference = { instant: createdAt };
  shared(content, createdAt, interaction, url, ref);
}

function shared(
  text: string,
  dateRef: Date,
  interaction: CommandInteraction,
  messageURL: string = "",
  ref: chrono.en.ParsingReference = {}
): void {
  const parsed = tryParse(interaction, text, ref);
  if (!parsed) return;

  const diff = (parsed.start.date().getTime() - dateRef.getTime()) / 1000 / 60 * camConst;
  const camTime = new Date(dateRef.getTime() + diff * 60000);

  if (messageURL) messageURL += "\n";
  const embed = new BaseEmbed()
    .setDescription(`${messageURL}
    This will be about ${inlineCode(String(Math.round(diff)))} Cam minutes from then
    \nat ${time(camTime, TimestampStyles.ShortTime)}
    \nor ${time(camTime, TimestampStyles.RelativeTime)}`);

  interaction.reply({ embeds: [embed] });
}

function tryParse(interaction: CommandInteraction, text: string, ref: chrono.en.ParsingReference = {}): undefined | chrono.en.ParsedResult {
  let parsed = chrono.parse(text, ref);
  if (!parsed.length) {
    const newText = assumeMinutes(text);
    if (!newText) {
      interaction.reply(errContent);
      return;
    }
    parsed = chrono.parse(newText, ref);
    if (!parsed.length) {
      interaction.reply(errContent);
      return;
    } else {
      return parsed[0];
    }
  } else {
    return parsed[0];
  }
}

function assumeMinutes(text: string): string | undefined {
  function isNumeric(str: string): boolean {
    if (!Number.isNaN(parseInt(str))) return true;
    return false;
  }

  const test = text.split(" ");
  let idx = -1;
  for (const [idy, word] of test.entries()) {
    if (isNumeric(word)) idx = idy;
  }
  if (idx != -1) {
    test.splice(idx + 1, 0, "mins from now");
    return test.join(" ");
  } else {
    return;
  }
}