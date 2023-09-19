import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { ContextCommand } from "@common/Command";
import { executeContext } from "./camtime";

export default <ContextCommand>{
  data: new ContextMenuCommandBuilder()
    .setName("Cam Time")
    .setDMPermission(false)
    .setType(ApplicationCommandType.Message),
  async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    executeContext(interaction);
  },
};