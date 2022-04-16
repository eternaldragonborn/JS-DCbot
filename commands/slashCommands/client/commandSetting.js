const { MessageEmbed } = require("discord.js");
const {
  SlashCommand,
  CommandOptionType,
  SlashCreatorAPI,
  ApplicationCommandPermissionType,
} = require("slash-create");
const client = require("../../..");

module.exports = class CommandSetting extends SlashCommand {
  // missing access
  constructor(creator) {
    super(creator, {
      name: "slashcommand",
      description: "斜線指令設定",
      guildIDs: ["719132687897591808"],
      options: [
        {
          type: CommandOptionType.SUB_COMMAND_GROUP,
          description: "權限",
          name: "permission",
          options: [
            {
              type: CommandOptionType.SUB_COMMAND,
              name: "setting",
              description: "新增/更改權限設定",
              options: [
                /* {
                        name: 'operation',
                        type: CommandOptionType.STRING,
                        description: '新增/設定',
                        required: true,
                        choices: [{ name: '新增', value: 'add' }, { name: '更改', value: 'edit' }]
                    }, */ {
                  name: "guild",
                  type: CommandOptionType.STRING,
                  description: "要更改權限的伺服器",
                  required: true,
                },
                {
                  name: "command",
                  type: CommandOptionType.STRING,
                  description: "要更改權限的指令",
                  autocomplete: true,
                  required: true,
                },
                {
                  name: "type",
                  type: CommandOptionType.INTEGER,
                  description: "目標種類",
                  required: true,
                  choices: [
                    { name: "使用者", value: 2 },
                    { name: "身分組", value: 1 },
                  ],
                },
                {
                  name: "id",
                  type: CommandOptionType.STRING,
                  description: "目標ID",
                  required: true,
                },
                {
                  name: "permission",
                  type: CommandOptionType.INTEGER,
                  description: "設定權限",
                  required: true,
                  choices: [
                    { name: "是", value: 1 },
                    { name: "否", value: 0 },
                  ],
                },
              ],
            },
            {
              type: CommandOptionType.SUB_COMMAND,
              name: "remove",
              description: "移除權限設定",
              options: [
                {
                  name: "guild",
                  description: "要設定的伺服器",
                  type: CommandOptionType.STRING,
                  required: true,
                },
                {
                  name: "command",
                  type: CommandOptionType.STRING,
                  description: "要移除權限的指令",
                  autocomplete: true,
                  required: true,
                },
                {
                  name: "id",
                  description: "要移除的ID",
                  type: CommandOptionType.STRING,
                  required: true,
                },
              ],
            },
            {
              name: "lookup",
              type: CommandOptionType.SUB_COMMAND,
              description: "查看指令權限設定",
              options: [
                {
                  name: "command",
                  description: "指令",
                  required: true,
                  autocomplete: true,
                  type: CommandOptionType.STRING,
                },
                {
                  name: "guild",
                  description: "伺服器ID",
                  required: true,
                  type: CommandOptionType.STRING,
                },
              ],
            },
            /* {
                    type: CommandOptionType.SUB_COMMAND,
                    description: '預設權限',
                    name: 'default_permission',
                    options: [{
                        name: 'command',
                        type: CommandOptionType.STRING,
                        description: '指令',
                        required: true,
                        autocomplete: true
                    }, {
                        name: 'permission',
                        type: CommandOptionType.INTEGER,
                        description: '權限',
                        required: true,
                        choices: [{ name: '是', value: 1 }, { name: '否', value: 0 }]
                    }]
                } */
          ],
        },
      ],
    });
    this.enabled = false;
    this.filePath = __filename;
    //this.API = new SlashCreatorAPI(creator);
  }

  async autocomplete(ctx) {
    const options = [];
    this.creator.commands.each((command) => {
      options.push({ name: command.commandName, value: command.commandName });
    });
    return options;
  }

  async run(ctx) {
    const subCommand = Object.keys(ctx.options.permission)[0];
    const options = ctx.options.permission[subCommand];
    const guildId = options.guild;
    this.GetCommandId(options.command, guildId).then((commandId) => {
      //client.logger.log(commandId, 'DEBUG');
      switch (subCommand) {
        case "lookup":
          const embed = new MessageEmbed().setTitle(options.command);
          const permissions = this.GetCommandPermissions(guildId, commandId);
          //client.logger.log(JSON.stringify(permissions), 'DEBUG');
          ctx.send("...");
          /* Object.entries(permissions).map(permission => {

                        }) */
          break;
        case "setting":
          return this.PermissionEdit(options);
        case "remove":
        case "default_permission":
      }
    });
  }

  /**
   * 取得指令ID
   */
  async GetCommandId(commandName, guildId) {
    const command = this.creator.commands.find(
      (command) => command.commandName === commandName,
    );
    return (
      command.ids.get(guildId) ??
      this.creator.api.getCommands().then((commands) => {
        return commands.find((command) => command.name === commandName).id;
      })
    );
  }

  async GetCommandPermissions(commandId, guildId) {
    this.creator.api
      .getCommandPermissions(guildId, commandId)
      .then((value) => {
        const permissions = {};
        client.logger.log(JSON.stringify(value.permissions), "DEBUG");

        value.permissions.forEach((permission) => {
          if (permission.type === ApplicationCommandPermissionType.ROLE) {
            const guild = client.guilds.cache.get(guildId);
            //get the role name
            const role = guild.roles.cache.get(permission.id);
            permissions[role.name] = permission.permission;
          } else permissions[`<@${permission.id}>`] = permission.permission;
        });
        return permissions;
      })
      //.then(x => { client.logger.log('x', 'DEBUG'); return x; })
      .catch((err) => {
        client.logger.log(err, "ERROR");
      });
  }

  async PermissionEdit(options) {
    let command = this.creator.commands.find(
      (command) => command.commandName === options.command,
    );
    if (!command) return "無此指令";
    this.GetCommandId(options.command, options.guild).then((commandId) => {
      this.creator.api
        .getCommandPermissions(options.guild, commandId) //設定權限
        .then((value) => {
          const permissions = value.permissions;
          client.logger.log(JSON.stringify(permissions), "DEBUG");
          const permissionIndex = permissions.findIndex(
            (permission) => permission.id === options.id,
          )
            ? //檢查該ID是否已設定過權限
              (permissions[permissionIndex].permission = options.permission)
            : permissions.push({
                id: options.id,
                type: options.type,
                permission: options.permission,
              });
          client.logger.log(JSON.stringify(permissions), "DEBUG");
          //this.creator.api.updateCommandPermissions(options.guild, commandId, permissions);
        })
        .then(() => {
          return "Updated.";
        })
        .catch((err) => {
          return `Update failed\n${String(err)}`;
        });
    });
  }
};
