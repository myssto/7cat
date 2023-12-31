import { Collection, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import Command from "@common/Command";
import ExtendedClient from "@common/ExtendedClient";
import { config } from "dotenv";
import { resolve } from "path";

const envFileName = process.env.NODE_ENV === "development" ? ".dev.env" : ".env";
config({ path: resolve(process.cwd(), envFileName) });

const args = process.argv;
const deployGlobal = args.includes("--global");

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("Token not found in environment variables.");
}

const clientId = process.env.CLIENT_ID;
if (!clientId) {
  throw new Error("Client ID not found in environment variables.");
}

const guildId = process.env.GUILD_ID;
if (!guildId && !deployGlobal) {
  throw new Error("Guild ID not found in environment variables.");
}

const rest = new REST({ version: "10" }).setToken(token);

function readCommands(
  commandsCollection: Collection<string, Command>,
): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
  const commands = Array<RESTPostAPIChatInputApplicationCommandsJSONBody>();
  commandsCollection.forEach(command => {
    if (command.devOnly && deployGlobal) return;
    commands.push(command.data.toJSON());
  });

  return commands;
}

(async () => {
  try {
    const commandsCollection = await ExtendedClient.loadCommands(resolve(__dirname, "..", "src", "commands"));
    const commands = readCommands(commandsCollection);
    // convert commands to an array of Command

    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    let data: any;

    // The put method is used to fully refresh all commands in the guild with the current set
    if (deployGlobal) {
      console.log("Deploying global commands.");
      data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
    } else {
      console.log("Deploying guild commands.");
      data = await rest.put(Routes.applicationGuildCommands(clientId, guildId!), {
        body: commands,
      });
    }

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
