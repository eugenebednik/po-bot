const fetch = require('node-fetch');

module.exports = {
  name: 'po',
  description: 'Issue a Buff Request to a Protocol Officer.',
  args: true,
  execute(message, args) {
    const allowedCommands = ['+t', '+b', '+r', '+lc'];
    if (!args[0]) {
      message.reply("you must specify a command. Valid commands are `+t`, `+b`, `+r`, `+lc`, `q`, or `done`.");
      return;
    }

    let command = args.shift().toLowerCase();

    if (command === 'done') {
      const data = {
        server_snowflake: message.guild.id,
        discord_snowflake: message.author.id,
      };

      fetch(`${parseInt(process.env.USE_HTTPS) === 1 ? 'https' : 'http'}://${process.env.DASHBOARD_DOMAIN}/api/bot-requests/done`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${process.env.DASHBOARD_API_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          status = response.status;
          return response.json()
        })
        .then(json => {
          const code = parseInt(status);

          if (code === 201) {
            message.reply('thanks for confirming that you are done!');
          } else if (code === 422) {
            message.reply('uh-oh! Something went wrong. Are you sure you have set the Dashboard bot up by running `setup`?');
          } else if (code === 404) {
            message.reply('you have no buff requests in progress.');
          } else if (code === 406) {
            message.reply('no PO is on duty at the moment. Offline queues have been disabled (for now).');
          } else {
            message.reply('uh-oh! Something went wrong. I was unable to mark your buff request as completed. Please notify administration!');
          }
        });
    } else if (command === 'q') {
      fetch(`${parseInt(process.env.USE_HTTPS) === 1 ? 'https' : 'http'}://${process.env.DASHBOARD_DOMAIN}/api/queue/${message.guild.id}`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${process.env.DASHBOARD_API_TOKEN}`,
        },
      })
        .then(response => {
          status = response.status;
          return response.json()
        })
        .then(json => {
          const code = parseInt(status);

          if (code === 200) {
            let msg = 'Current Queue:\n'
            msg += "```css\n";

            msg += '[Grand Maester]\n';
            json.grand_maester.forEach(person => {
              msg += `* ${person.user_name}\n`;
            });
            msg += "\n"

            msg += '[Chief Builder]\n';
            json.chief_builder.forEach(person => {
              msg += `* ${person.user_name}\n`;
            });
            msg += "\n"

            msg += '[Master of Whisperers]\n';
            json.master_of_whisperers.forEach(person => {
              msg += `* ${person.user_name}\n`;
            });
            msg += "\n"

            msg += '[Lord Commander]\n';
            json.lord_commander.forEach(person => {
              msg += `* ${person.user_name}\n`;
            });
            msg += "```\n"

            message.channel.send(msg);

          } else {
            message.reply('uh-oh! Something went wrong. I was unable to mark your buff request as completed. Please notify administration!');
          }
        });
    } else {
      if (allowedCommands.includes(command)) {
        let id;
        switch (command) {
          case '+r':
            id = 1;
            break;
          case '+b':
            id = 2;
            break;
          case '+t':
            id = 3;
            break;
          case '+lc':
            id = 5;
            break;
          default:
            id = 1;
            break;
        }

        let altName = null;
        if (args && args[0]) {
          altName = args.join(' ');
        }

        const data = {
          server_snowflake: message.guild.id,
          user_name: message.member.displayName.replace(/\[\w+\]\s+/gm, ''),
          discord_snowflake: message.author.id,
          request_type_id: id,
          is_alt_request: !!altName,
          alt_name: altName,
        };

        fetch(`${parseInt(process.env.USE_HTTPS) === 1 ? 'https' : 'http'}://${process.env.DASHBOARD_DOMAIN}/api/bot-requests`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${process.env.DASHBOARD_API_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(response => {
            status = response.status;
            return response.json()
          })
          .then(json => {
            const code = parseInt(status);

            if (code === 201) {
              message.reply(`your request for buff has been successfully added to the queue. <@${json.server.on_duty.user.discord_id}> please look at the dashboard and assign the title.`);
            } else if (code === 400) {
              message.reply('unable to create request: you already have a pending request in the queue. Please wait.');
            } else if (code === 422) {
              message.reply('uh-oh! Something went wrong. Are you sure you have set the Dashboard bot up by running `setup`?');
            } else if (code === 406) {
              message.reply('no PO is on duty at the moment. Offline queues have been disabled (for now).');
            } else {
              message.reply('uh-oh! Something went wrong. I was unable to create your buff request. Please notify administration.');
            }
          })
          .catch(err => {
            console.error(err);
          });
      } else {
        message.reply('command not found. Valid commands are `+t`, `+b`, `+r`, `+lc`, `q` or `done`.')
      }
    }
  },
};
