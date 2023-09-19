import { ContextMenuCommandBuilder, SlashCommandBuilder } from "discord.js";

export default interface Command {
  data: SlashCommandBuilder;
  execute(...args: any): any;
  devOnly?: boolean;
  filePath?: string;
}

export interface ContextCommand {
  data: ContextMenuCommandBuilder;
  execute(...args: any): any;
  devOnly?: boolean;
  filePath?: string;
}