const Discord = require('discord.js');
const steem = require('steem');
const auth = require('./auth.json');
const client = new Discord.Client();
const Promise = require('promise');

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', m => {
    if (m.author.bot) return;
    if (m.content.slice(0, 1) === '!' && m.channel.name == 'bot-channel') {
        var text = m.content.substring(1);
        switch (text.split(' ')[0]) {
            case 'ping':
                m.reply('pong!');
                break;
            case 'upvote':
                console.log('upvote requested');
                var url = text.substring(7);
                console.log(url);
                var author, permlink, path;
                var urlSplitted = url.split('/');
                if (urlSplitted.length == 6) {
                    author = urlSplitted[4].substring(1);
                    permlink = urlSplitted[5];
                    path = urlSplitted.slice(3, 6).join('/');
                }
                new Promise(function(resolve, reject) {
                        steem.api.getState(path, function(err, result) {
                            if (err !== null) return reject(err);
                            resolve(result);
                        })
                    })
                    .then(function(result) {
                        if (result.content) {
                            var created = new Date(result.content[author + '/' + permlink].created);
                            var now = new Date();
                            var postAge = now - created;
                            if ((postAge > 1000 * 60 * 15) && (postAge < 1000 * 3600 * 24 * 3)) {
                                return (path);
                            } else {
                                throw 'post age is too young or too old to get an upvote';
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
                            return path;
                        } else {
                            throw 'out of voting power';
                        }
                    }).then(function(path) {
                        var voter = auth.steemBotAccount;
                        var wif = auth.postingKey;
                        var weight = 100 * 100;
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
                        console.error(err);
                        m.reply('error: '+err);
                    });
                break;
        }
    }
});

client.login(auth.discordBotToken);
