const Discord = require('discord.js');
const steem = require('steem');
const auth = require('./auth.json');
const config = require('./config.json');
const client = new Discord.Client();
const Promise = require('promise');

var voteWeight = config.defaultVoteWeight;

var admins = config.admins;
client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', m => {
    if (m.author.bot) return;
    if (m.content.slice(0, 1) === '!' && m.channel.name == 'bot-channel') {
        var text = m.content.substring(1);
	var words = text.split(' ');
        switch (words[0]) {
            case 'ping':
                m.reply('pong!');
                break;
	    case 'sababa':
		if (Math.floor(Math.random()*4) === 3){ 
                  m.reply('Ein beaya ach/achot sheli!');
		}
		else {
		  m.reply('No problem, mate!');
		}
		break;
            case 'set':
	        if(admins.indexOf(m.author.username)> -1){
		  var command = text.substring(4);
		  if (words[1] == 'weight'){
		    if (parseInt(words[2])){
		      voteWeight = parseInt(words[2]);
			var reply ;
		      if(voteWeight == 100) {
			reply = 'Did you just call me fat??';
			}
			else {
			reply = 'vote weight: '+voteWeight+'%';
			}
		      m.reply (reply);
		   }
		  else m.reply('error: not numeric value')
		}
		}
		else {
		  m.reply('I\'m not accepting such orders from you!');
		}
		break;
            case 'upvote':
                console.log('upvote requested');
                var url = text.substring(7);
                console.log(url);
                var author, permlink, path;
                var urlSplitted = url.split('/');
                if (urlSplitted.length >= 4) {
                    author = urlSplitted[urlSplitted.length-2].substring(1);
                    permlink = urlSplitted[urlSplitted.length-1];
                }
                new Promise(function(resolve, reject) {
                        steem.api.getContent(author, permlink, function(err, result) {
                            if (err !== null) return reject(err);
                            resolve(result);
                        })
                    })
                    .then(function(result) {
                        if (result.created) {
                            var created = new Date(result.created);
                            var now = new Date();
                            var postAge = now - created;
			    if (postAge < 1000 * 60 * 30 ) { 
				throw 'your post is '+(Math.floor(postAge / 1000 / 60))+' minutes old. It\'s too young for me... Wait till it\'s 30 minutes old.'; 
			    }
			    else if (postAge > 1000 * 3600 * 24 * 3){ 
				throw 'your post is '+(Math.floor(postAge / 1000 / 3600 / 24))+' days old. It\'s too old for me...';
			    } 
                            else {
                                return path;
			    }
                        } else {
                            throw 'post path not valid';
                        }
                    })
                    .then(function(path) {
                        //check bot vote power
                        return new Promise(function(resolve, reject) {
                            steem.api.getState('@' + auth.steemBotAccount, function(err, result) {
                                if (err !== null) return reject(err);
                                resolve(result);
                            })
                        });
                    }).then(function(result) {
                        var vp = result.accounts[auth.steemBotAccount].voting_power;
                        console.log('vote power: ' + vp);
                        if (vp >= 2000) {
                            return;
                        } else {
                            throw 'out of voting power';
                        }
                    }).then(function() {
                        var voter = auth.steemBotAccount;
                        var wif = auth.postingKey;
                        var weight = config.defaultVoteWeight * 100;
                        console.log('upvoting: ' + url);
                        if (author && permlink && voter && wif && weight) {
                            return new Promise(function(resolve, reject) {
                                steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
                                    if (err) {
                                        reject(err);
                                    } else if (result) {
                                        resolve(result);
                                    }
                                })
                            });
                        }
                    })
                    .then(function(result) {
                        m.reply('upvoted! ' + url);
                    })
                    .catch(function(err) {
			console.log(err);
			if(typeof err === 'string'){
				console.error(err);
				m.reply('error: '+err);
			}
			else if(err.data.code==10){
				console.error('error: voted already');
				m.reply('error: I already voted on that!');
			}
                    });
                break;
        }
    }
});

client.login(auth.discordBotToken);
