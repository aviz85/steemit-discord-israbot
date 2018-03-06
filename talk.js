const Discord = require('discord.js');
const steem = require('steem');
const auth = require('./auth.json');
const client = new Discord.Client();

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
 
var start = new Date();
ai = {

	'kiss' : {'response': ':kiss:'},
	'hi' : {'response' :'hello', 'bye' : {'response':'bye'}, 'how are you?':{'response':'fine, and you?','fine':{'response':'nice...'},'bad':{'response':'sorry to hear that'}}},
	'what is your name?' : {'response':'Chan'}
};

var ai2 = Object.assign({}, ai);
var learning = 0;
var learningPhrase = '';

client.on('ready', () => {
  console.log('I am ready!');
});
 
client.on('message', m => {
  if (m.author.bot) return;
  if (m.content.slice(0,1) === '!' && m.channel.name == 'bot-channel') {
    var text = m.content.substring(1);
	if (learning === 2){
		ai[learningPhrase] = (IsJsonString(text))? JSON.parse(text) : {response: text};
//		ai[learningPhrase] = text;
		m.reply('Gotcha! I\'ll remember that for the next 3 hours');
		console.log('learned!',learningPhrase,text);
		console.log(ai);
		setTimeout(function(){ delete ai[learningPharse] },1000*3600*3);
		learning = 0;
		ai2=ai;
	}
	if (learning === 1){
		if(ai2[text]){ m.reply('I\'ve already know that...'); learning = 0; }
		else {
			m.reply('So what should I say after that?');
			learningPhrase = text;
			learning = 2;
		}
	}	
	if (text === 'learn' && learning == 0){
		m.reply('OK. I\'m ready to learn. Tell me something new.');
		learning = 1;
	}
	if(ai2[text]) {
		m.reply(ai2[text].response); ai2 = ai2[text];
		if(Object.keys(ai2).length == 1) ai2 = ai;	
	} 	
	else ai2=ai;
if(text == 'how old are you?') m.reply((new Date()-start).toString() + ' miliseconds');
   }
});
 
client.login(auth.discordBotToken);
