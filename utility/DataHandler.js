const sqlite = require("sqlite3").verbose();

class DataHandler {
  constructor(util) {
    this.util = util;
    if (!util.fs.existsSync(__dirname + "/../data/Cardinal.db")) {
      let timeout = 5000;
      util.logger.log(
        `Setting timeout to create server configs to ${(timeout / 1000).toFixed(
          2
        )} seconds.`
      );
      setTimeout(() => {
        util.bot.guilds.cache.forEach((guild) => {
          let log_channel = null;
          let log_enabled = 0;
          let muted_role = null;

          guild.channels.cache.forEach((channel) => {
            if (
              (channel.type == 0 && channel.name.toLowerCase() == "📜│logs") ||
              (channel.type == 0 && channel.name.toLowerCase() == "logs")
            ) {
              log_channel = channel.id;
              log_enabled = 1;
            }
          });
          guild.roles.cache.forEach((role) => {
            if (
              !role.permissions.has("Administrator", { checkAdmin: true }) &&
              role.name == "Muted"
            ) {
              muted_role = role.id;
            }
          });

          util.dataHandler
            .getDatabase()
            .run(
              "INSERT INTO ServerConfig (GuildId, LogEnabled, LogChannel, MutedRole, DisabledCmds) VALUES(?, ?, ?, ?, ?);",
              [guild.id, log_enabled, log_channel, muted_role, "[]"],
              (err) => {
                util.logger.log(
                  `Set guild data for: ${guild.name} (${guild.id}) members: ${guild.memberCount}`
                );
                if (err) {
                  util.logger.error(err.message);
                  return;
                }
                util.logger.log("    - Initialized ServerInfo.");
                if (!muted_role)
                  util.logger.log("    - No muted role could be found!");
                if (!log_channel)
                  util.logger.log("    - No log channel could be found!");
              }
            );
        });
      }, timeout);
    }

    this.db = new sqlite.Database(__dirname + "/../data/Cardinal.db");
    this.db
      .run(
        "CREATE TABLE IF NOT EXISTS ServerConfig (Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, GuildId VARCHAR(18) NOT NULL, LogEnabled BOOLEAN, LogChannel VARCHAR(18), MutedRole VARCHAR(18), DisabledCmds MEDIUMBLOB NOT NULL);"
      )
      .on("error", (err) => {
        util.logger.error(
          "Error occured while trying to create ServerConfig table, " +
            err.message
        );
      });
    this.db
      .run(
        "CREATE TABLE IF NOT EXISTS DiscordUserData (UserID	INTEGER NOT NULL UNIQUE, UserName TEXT NOT NULL, GuildId INTEGER, VIP_Tier INTEGER, VIPLevel INTEGER, VIP_Exp INTEGER, LevelXp INTEGER, Xp INTEGER, ChatLvl INTEGER, TotalXp INTEGER, ChatExp BLOB, Birthday TEXT, LastXpGain TEXT, PRIMARY KEY(UserID));"
      )
      .on("error", (err) => {
        util.logger.error(
          "Error occured while trying to create DiscordUserData table, " +
            err.message
        );
      });
  }

  getGuildConfig(guild_id, callback) {
    this.getDatabase().all(
      "SELECT * FROM ServerConfig WHERE GuildId = ?;",
      [guild_id],
      (err, rows) => {
        if (err) {
          this.util.logger.error(err.message);
          callback(err, null);
        }
        let res;
        rows.forEach((row) => {
          res = {
            LogEnabled: row.LogEnabled,
            LogChannel: row.LogChannel,
            MutedRole: row.MutedRole,
            DisabledCmds: JSON.parse(row.DisabledCmds),
          };
        });
        callback(err, res);
      }
    );
  }

  getUserInfo(user_id, callback) {
    this.getDatabase().get(
      "SELECT * FROM DiscordUserData WHERE UserId = ?;",
      [user_id],
      (err, row) => {
        if (err) {
          this.util.logger.error(err.message);
          callback(err, null);
        }
        if (!row) {
          // User data doesn't exist in the database
          callback(null, null); // Pass null for both err and res
          return; // Exit the function
        }
        let res = {
          UserID: row.UserID,
          UserName: row.UserName,
          GuildId: row.GuildId,
          VIP_Tier: row.VIP_Tier,
          VIPLevel: row.VIPLevel,
          VIP_Exp: row.VIP_Exp,
          LevelXp: row.LevelXp,
          Xp: row.Xp,
          ChatLvl: row.ChatLvl,
          TotalXp: row.TotalXp,
          ChatExp: row.ChatExp,
          Birthday: row.Birthday,
          LastXpGain: row.LastXpGain,
        };
        callback(err, res);
      }
    );
  }

  populateDisabledCmds(guild) {
    this.getDatabase().run(
      "UPDATE ServerConfig SET DisabledCmds = ? WHERE GuildId = ?",
      ["[]", guild.id],
      (err) => {
        if (err) {
          this.util.logger.error(err.message);
          return;
        }
        this.util.logger.log(
          `Populated DisabledCmds database entry for ${guild.name} (${guild.id})`
        );
      }
    );
  }

  getTopUsers(limit, callback){
    this.getDatabase().all(
      "SELECT * FROM DiscordUserData ORDER BY ChatExp DESC LIMIT ?;",
      [limit],
      (err, rows) => {
        if (err) {
          this.util.logger.error(err.message);
          callback(err, null);
        }
        callback(err, rows);
      }
    );
  }

  executeSQL(sql) {
    this.db.run(sql);
  }

  getDatabase() {
    return this.db;
  }
}

module.exports = DataHandler;