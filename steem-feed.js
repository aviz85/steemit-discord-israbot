const Discord = require('discord.js');
const steem = require('steem');
const auth = require('./auth.json');
const client = new Discord.Client();
 
client.on('ready', () => {
  console.log('I am ready!');
});
 
client.on('message', m => {
  if (m.author.bot) return;
  if (m.content.slice(0,1) === '!' && m.channel.name == 'bot-channel') {
    var text = m.content.substring(1);
    switch(text.split(' ')[0]){
      case 'steem':
	steem.api.getFeedHistory(function(err, result) {
	  console.log(err, result);
	m.reply(result.current_median_history.base);
	});
        break;
     }
   }
});
 
client.login(auth.discordBotToken);
