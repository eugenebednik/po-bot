const fetch = require('node-fetch');

module.exports = {
  name: 'pobot',
  description: 'Setup POBot PO Dashboard!',
  args: true,
  execute(message, args) {
    if (!args[0]) {
      message.reply("you must specify a command. Valid commands are: `setup`");
      return;
    }

    let command = args.shift().toLowerCase();

    if (command === 'setup') {
      if (!message.member.hasPermission('ADMINISTRATOR')) {
        message.reply("you must have a Server Administrator role to execute this command.");
        return;
      }

      const webhookName = process.env.WEBHOOK_BOT_NAME;

      message.channel.createWebhook(webhookName).then(webhook => {
        const data = {
          snowflake: message.guild.id,
          name: message.guild.name,
          webhook_id: webhook.id,
          webhook_token: webhook.token,
        };

        fetch(`${process.env.USE_HTTPS === true ? 'https://' : 'http://'}${process.env.DASHBOARD_DOMAIN}/api/server`, {
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
            message.reply(`Thank you for inviting me into the server. Please follow the following URL to set up your Dashboard: ${process.env.USE_HTTPS === true ? 'https://' : 'http://'}${json.name}.${process.env.DASHBOARD_DOMAIN}`);
          } else if (code === 409) {
            message.reply(`You've already set up your bot on this server. Use the following URL to login to your Dashboard: ${process.env.USE_HTTPS === true ? 'https://' : 'http://'}${json.name}.${process.env.DASHBOARD_DOMAIN}`);
          } else {
            message.reply('Something went wrong! Please notify administration ASAP.');
            console.log(json);
          }
        });
      }).catch(err => {
        message.reply(`Uh oh! There was an error. ${err.name}: ${err.message} (code ${err.code})`)
      })
    }
  }
}
