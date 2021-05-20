const fs = require('fs');
const Discord = require('discord.js');
const { get } = require('http');


function getConfig(configPath) {
    let rawdata = fs.readFileSync(configPath);
    return JSON.parse(rawdata);
}

function replyToUser(msg, reply) {
    client.channels.cache.get(msg.channel.id).send(reply);
}

function changeHofer(msg, hoferPath) {
    let hofer = msg.content.replace(/^\!sh\s+silence\s+/,'');
    fs.writeFileSync(hoferPath, JSON.stringify({"hofer": hofer}));
    replyToUser(msg, `**${hofer}** is now the hofer`)
}

function getHofer(hoferPath) {
    let rawdata = fs.readFileSync(hoferPath);
    return (JSON.parse(rawdata)).hofer;
}

const configPath = 'config.json';
const hoferPath = 'hofer.json';

const regexCommandSilenceHofer = /^\!sh\s+silence\s+\w+$/;
const regexCommandWho = /^\!sh\s+who$/;
const regexCommandRemoveHofer = /^!sh remove$/;

config = getConfig(configPath);
const client = new Discord.Client();

client.once('ready', () => {
    console.log("StopHoferBot is online!")
});

client.on('message', msg => {
    if(msg.content.match(regexCommandSilenceHofer)) {
        changeHofer(msg, hoferPath);
    }

    if(msg.content.match(regexCommandWho)) {
        if(fs.existsSync(hoferPath)) {
            let hofer = getHofer(hoferPath);
            replyToUser(msg, `**${hofer}** is hofering everybody`);
        } else {
            replyToUser(msg, "No one is hofering now thank god");
        }
    }

    if(msg.content.match(regexCommandRemoveHofer)) {
        let hofer = getHofer(hoferPath);
        fs.unlinkSync(hoferPath);
        replyToUser(msg, `**${hofer}** finally stopped hofering`)
    }
})













client.login(config.token);