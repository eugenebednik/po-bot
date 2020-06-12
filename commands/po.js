const fetch = require('node-fetch');

module.exports = {
  name: 'po',
  description: 'Issue a Buff Request to a Protocol Officer.',
  args: true,
  execute(message, args) {
    const allowedCommands = ['+training', '+building', '+research', '+lc'];
    if (!args[0]) {
      message.reply("you must specify a command. Valid commands are `+training`, `+building`, `+research`, `+lc` or `done`.");
      return;
    }

    let command = args.shift().toLowerCase();

    if (command === 'done') {
      const data = {
        discord_snowflake: message.author.id,
      };

      fetch(`${process.env.DASHBOARD_API_URL}/buff-requests/done`, {
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
          if (status === 201) {
            message.reply('thanks for confirming that you are done!');
          } else if (status === 404) {
            message.reply('you have no buff requests in progress.')
          } else {
            message.reply('uh-oh! Something went wrong. I was unable to mark your buff request as completed. Please notify administration!');
          }
        });
    } else {
      if (allowedCommands.includes(command)) {
        let id;
        switch (command) {
          case '+research':
            id = 1;
            break;
          case '+building':
            id = 2;
            break;
          case '+training':
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
          user_name: message.author.username,
          discord_snowflake: message.author.id,
          request_type_id: id,
          is_alt_request: !!altName,
          alt_name: altName,
        };

        fetch(`${process.env.DASHBOARD_API_URL}/buff-requests`, {
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
            if (status === 201) {
              message.reply('your request for buff has been successfully added to the queue.');
            } else if (status === 400) {
              message.reply('unable to create request: you already have a pending request in the queue. Please wait.');
            } else {
              message.reply('uh-oh! Something went wrong. I was unable to create your buff request. Please notify administration.');
            }
          })
          .catch(err => {
            console.error(err);
          });
      } else {
        message.reply('command not found. Valid commands are `+training`, `+building`, `+research`, `+lc` or `done`.')
      }
    }
  },
};
