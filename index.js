//Require the necessary discord.js classes
const CardinalBot = require("./utility/bot.js");
const CardinalLogger = require("./utility/CardinalLogger.js");
const DataHandler = require("./utility/DataHandler.js");
const ServiceHandler = require("./utility/ServiceHandler.js");
const fs = require("node:fs");
const path = require("node:path");
const Discord = require("discord.js");
/* {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} */
const config = require("./config.json");
const CommandHandler = require("./utility/CommandHandler.js");

const util = {};

util.logger = new CardinalLogger(util);
util.logger.log(`Initializing bot...`);
util.path = path;
util.fs = fs;
util.config = config;
util.lib = Discord;
util.bot = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageTyping,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.MessageContent,
  ],
});
util.commandHandler = new CommandHandler(util);
util.services = new ServiceHandler(util);
util.dataHandler = new DataHandler(util);
util.BotClass = new CardinalBot(util);

// This doesn't work in d.js V14 OR I've implemented it wrong

// util.buildEmbed = function (title, description, fields, thumbnail) {
//   let embed = new Discord.EmbedBuilder()
//     .setTitle(title)
//     //.setColor(colour)
//     .setDescription(description)
//     .setThumbnail(thumbnail)
//     .addFields(fields);
//   return embed;
// };