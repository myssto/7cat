import ExtendedClient from "./common/ExtendedClient";
import { GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { resolve } from "path";

const envFileName = process.env.NODE_ENV === "development" ? ".dev.env" : ".env";

config({ path: resolve(process.cwd(), envFileName) });

const client = new ExtendedClient({
  intents: [GatewayIntentBits.Guilds],
});

client.init();
client.login();