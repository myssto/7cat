import { BaseInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, GuildMember, User } from "discord.js";
import BaseEmbed from "./BaseEmbed";

// eslint-disable-next-line no-shadow
export enum SearchUsersChoices {
  Members,
  Users,
  All,
}

/**
* Checks if {@link interaction}.user.id === {@link interaction}.client.application.owner.id.
* Will respond to interaction with an error if false
*
* @param {BaseInteraction} interaction - Interaction to check
* @returns {Promise<boolean>} True or False
*/
export async function checkOwner(interaction: BaseInteraction): Promise<boolean> {
  if (interaction.client.application.owner === null) {
    await replyNoOwner(interaction);
    return false;
  }
  if (interaction.user.id !== interaction.client.application.owner.id) {
    return true;
  } else {
    await replyNoOwner(interaction);
    return false;
  }
}

/**
 * Internal function. Replies with a 'not owner' error embed
 */
async function replyNoOwner(interaction: BaseInteraction): Promise<void> {
  if (interaction.isRepliable()) {
    await interaction.reply({
      embeds: [new BaseEmbed().setDescription("Only the bot owner can use this command")],
      ephemeral: true,
    });
  }
}

/**
* Deep search of client and guild caches to locate a {@link GuildMember} or {@link User}
* object using string input
*
* @param {string} input - Search term
* @param {BaseInteraction} interaction - To pull client
* @param {SearchUsersChoices} searchType - Specifies location of search: Members, Users, or All
* @returns {Promise<GuildMember | User | undefined>} Returns GuildMember, User, or undefined if search returns nothing
*/
export async function searchUsers(
  input: string,
  interaction: BaseInteraction,
  searchType: SearchUsersChoices = SearchUsersChoices.All):
  Promise<GuildMember | User | undefined> {
  let target: GuildMember | User | undefined;
  if (searchType === SearchUsersChoices.All) {
    target = await findGuildMember(input, interaction);
    if (target) return target;
    target = await findUser(input, interaction);
    return target;
  } else if (searchType === SearchUsersChoices.Members) {
    target = await findGuildMember(input, interaction);
    return target;
  } else if (searchType === SearchUsersChoices.Users) {
    target = await findUser(input, interaction);
    return target;
  }
}

/**
* Searches all relavent caches for an associated {@link GuildMember}
*
* @param {string} input - Search term
* @param {BaseInteraction} interaction - To pull client
* @returns {Promise<GuildMember | undefined>} Returns GuildMember or undefined if search returns nothing
*/
async function findGuildMember(input: string, interaction: BaseInteraction): Promise<GuildMember | undefined> {
  if (!interaction.guild) {
    return;
  }
  let member: GuildMember | undefined;

  const filter = input.match(/^<@!?(\d+)>$/);
  if (filter) {
    member = interaction.guild.members.cache.get(filter[1]);
  }
  if (!member) {
    member = interaction.guild.members.cache
      .filter(gm => gm.displayName.toLowerCase().includes(input.toLowerCase()))
      .first();
  }
  if (!member) {
    const members = await interaction.guild.members.search({ query: input, limit: 1 });
    member = members?.first();
  }
  return member;
}

/**
* Searches all relavent caches for an associated {@link User}
*
* @param {string} input - Search term
* @param {BaseInteraction} interaction - To pull client
* @returns {Promise<User | undefined>} Returns User or undefined if search returns nothing
*/
async function findUser(input: string, interaction: BaseInteraction): Promise<User | undefined> {
  let user: User | undefined | null;

  user = interaction.client.users.cache.get(input);
  if (!user) {
    const filter = input.match(/^<@!?(\d+)>$/);
    if (filter) {
      user = interaction.client.users.cache.get(filter[1]);
    }
  }
  if (!user) {
    user = interaction.client.users.cache
      .filter(u => u.tag.toLowerCase().includes(input.toLowerCase()))
      .first();
  }
  if (!user) {
    if (!Number.isNaN(parseInt(input))) {
      user = interaction.client.users.resolve(input);
    }
  }
  if (!user) {
    if (!Number.isNaN(parseInt(input))) {
      user = await interaction.client.users.fetch(input, { cache: true });
    }
  }
  return user ?? undefined;
}

/**
* Reply to an interaction with a boilerplate error embed to maintain consistency
*
* @param {BaseInteraction} interaction - To reply to
* @param {Error} err - The originating error
* @returns {Promise<void>}
*/
export async function replyWithError(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, err: Error): Promise<void> {
  console.error(`Caught error from: ${interaction.commandName}\n${err}`);
  const func = interaction.deferred || interaction.replied ? interaction.followUp : interaction.reply;
  func.call(interaction,
    { embeds: [
      new BaseEmbed()
        .setDescription("Caught an error while executing this command")
        .setTimestamp(),
    ],
    }
  );
}