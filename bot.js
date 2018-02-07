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
      case 'ping':
        m.reply('pong!');
        break;

      case 'upvote':
	console.log('upvote requested');
        var url = text.substring(7);
	console.log(url);
        if (url.length < 5) break;
        var authorMatch = url.match(/@[\w-]*/);
	if (authorMatch) var author = authorMatch[0].substring(1);
        var permlinkMatch = url.match(/\/[\w-]*$/);
	if (permlinkMatch) var permlink = permlinkMatch[0].substring(1);
	var voter = auth.steemBotAccount;
        var wif = auth.postingKey;
        var weight = 100 * 100;
        console.log('upvoting: '+url);
        if(author && permlink && voter && wif && weight){
          steem.broadcast.vote(wif, voter, author, permlink, weight, function(bot, uri){ 
             return function(err,result){   
               if(err){
                 bot.reply('error upvoting to: '+uri);
               }
               else if(result){
                 bot.reply('upvoted! ' + uri);
               }
            }
          }(m,url));
  	}
        break;
     }
   }
});
 
client.login(auth.discordBotToken);
