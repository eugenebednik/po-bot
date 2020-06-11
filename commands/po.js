const fetch = require('node-fetch');

module.exports = {
  name: 'po',
  description: 'Issue a Buff Request to a Protocol Officer.',
  args: true,
  execute(message, args) {
    const allowedCommands = ['+training', '+building', '+research', '+lc'];
    if (!args[0]) {
      message.reply("you must specify a command. Valid commands are `+training`, `+building`, `+research` or `+lc`.");
      return;
    }

    let argument = args[0].toLowerCase();

    if (allowedCommands.includes(argument)) {
      let id;
      switch (argument) {
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

      const data = {
        user_name: message.author.username,
        discord_snowflake: message.author.id,
        request_type_id: id,
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
      message.reply('command not found. Valid commands are `+training`, `+building`, `+research` or `+lc`.')
    }
  },
};
