const fs = require('fs');
const Discord = require('discord.js');
const { get } = require('http');


const configPath = 'config.json';
const hoferPath = 'hofer.json';
const modsPath = 'mods.json';
const devId = '175177376026722304';

const regexCommandSilenceHofer = /^\!sh\s+silence\s+\w+$/;
const regexCommandWho = /^\!sh\s+who$/;
const regexCommandRemoveHofer = /^!sh remove$/;
const regexCommandAddMod = /^!sh\s+mods\s+add\s+.+$/
const regexCommandRemoveMod = /^!sh\s+mods\s+remove\s+.+$/
const regexCommandWhoMod = /^!sh\s+mods\s+who$/


function getConfig() {
    let rawdata = fs.readFileSync(configPath);
    return JSON.parse(rawdata);
}

function replyToUser(msg, reply) {
    client.channels.cache.get(msg.channel.id).send(reply);
}

function changeHofer(msg) {
    let hofer = msg.content.replace(/^\!sh\s+silence\s+/,'');
    fs.writeFileSync(hoferPath, JSON.stringify({"hofer": hofer}));
    replyToUser(msg, `**${hofer}** is now the hofer`)
}

function getHofer() {
    let rawdata = fs.readFileSync(hoferPath);
    return (JSON.parse(rawdata)).hofer;
}

function getMods() {
    let mods = [];

    if (fs.existsSync(modsPath)) {
        let rawdata = fs.readFileSync(modsPath);
        mods = (JSON.parse(rawdata)).mods;
    }

    if(!mods.includes(devId)) {
        mods.push(devId);
    }
    return mods;
}

function getUserId(username) {
    return (client.users.cache.find(user => user.username === username)).id;
}

function addMod(msg, modUsername) {
    let mods;
    let modId = getUserId(modUsername);
    
    if (fs.existsSync(modsPath)) {
        mods = getMods();

        if(mods.includes(modId)) {
            replyToUser(msg, `**${modUsername}** is already a mod`);
            return;
        } else {
            mods.push(modId);
        }
    } else {
        mods = [modId];
    }
    
    let modsString = 
    fs.writeFileSync(modsPath, JSON.stringify({"mods": mods}));
    replyToUser(msg, `**${modUsername}** has been added to mods`);
}

function removeMod(msg, modUsername) {
    let modId = getUserId(modUsername);

    if (fs.existsSync(modsPath)) {
        let mods = getMods();

        if(mods.includes(modId)) {
            mods.splice(mods.indexOf(modId), 1);
            if(mods.length > 0) {
                fs.writeFileSync(modsPath, JSON.stringify({"mods": mods}));
            } else {
                fs.unlinkSync(modsPath);
            }

            replyToUser(msg, `**${modUsername}** has been removed from mods`);
        }
    } else {
        replyToUser(msg, `**${modUsername}** is not a mod`);
    }
}

function isMod(userId) {
    let mods = getMods();

    if(mods === null) {
        mods = [];
    }

    mods.push(devId);

    if(mods.includes(userId)) {
        return true;
    }
    return false;
}

config = getConfig();
const client = new Discord.Client();

client.once('ready', () => {
    console.log("StopHoferBot is online!")
});

client.on('message', msg => {
    if(msg.content.match(regexCommandSilenceHofer)) {
        if(isMod(msg.author.id)) {
            changeHofer(msg);
        } else {
            replyToUser(msg, "you are not a mod");
        }
    }

    if(msg.content.match(regexCommandRemoveHofer)) {
        if(isMod(msg.author.id)) {
            let hofer = getHofer();
            fs.unlinkSync(hoferPath);
            replyToUser(msg, `**${hofer}** finally stopped hofering`);
        } else {
            replyToUser(msg, "you are not a mod");
        }
    }

    if(msg.content.match(regexCommandAddMod)) {
        if(isMod(msg.author.id)) {
            let mod = msg.content.replace(/^!sh\s+mods\s+add\s+/,'');
            addMod(msg, mod);
        } else {
            replyToUser(msg, "you are not a mod");
        }
    }

    if(msg.content.match(regexCommandRemoveMod)) {
        if(isMod(msg.author.id)) {
            let mod = msg.content.replace(/^!sh\s+mods\s+remove\s+/,'');
            removeMod(msg, mod);
        } else {
            replyToUser(msg, "you are not a mod");
        }
    }

    if(msg.content.match(regexCommandWhoMod)) {
        let mods = getMods();
        modsUsernames = mods.map(modId => msg.guild.members.cache.get(modId).user.username);

        let modsUserNamesString = "";
        modsUsernames.forEach(modUsername => {
            modsUserNamesString += `**${modUsername}**, `;
        });

        modsUserNamesString = modsUserNamesString.replace(/\,\s+$/,'');

        replyToUser(msg, `**mods**: ${modsUserNamesString}`);
    }

    if(msg.content.match(regexCommandWho)) {
        if(fs.existsSync(hoferPath)) {
            let hofer = getHofer();
            replyToUser(msg, `**${hofer}** is hofering everybody`);
        } else {
            replyToUser(msg, "No one is hofering now thank god");
        }
    }
})













client.login(config.token);