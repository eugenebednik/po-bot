const fetch = require('node-fetch');

module.exports = {
  name: 'aleena',
  description: 'Setup AleenaBot PO Dashboard!',
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

      const data = {
        snowflake: message.guild.id,
        name: message.guild.name,
      };

      fetch(`${process.env.DASHBOARD_URL}/api/server`, {
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
        console.log(status);
        if (status === 201) {
          message.reply(`Thank you for inviting me into the server. Please follow the following URL to set up your Dashboard: ${process.env.DASHBOARD_URL}/?server_id=${json.snowflake}`);
        } else if (status === 409) {
          message.reply(`You've already set up your bot on this server. Use the following URL to login to your Dashboard: ${process.env.DASHBOARD_URL}/?server_id=${json.snowflake} `);
        } else {
          message.reply('Something went wrong! Please notify administration ASAP.');
        }
      });
    }
  }
}
