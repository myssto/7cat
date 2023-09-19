import { ColorResolvable, EmbedBuilder } from "discord.js";

export const baseColor: ColorResolvable = "#821a99";

export default class BaseEmbed extends EmbedBuilder {
  public baseColor = baseColor;

  public constructor() {
    super();
    this.setColor(this.baseColor);
  }
}