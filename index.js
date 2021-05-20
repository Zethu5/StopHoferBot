const fs = require('fs');
const Discord = require('discord.js');
const { get } = require('http');


const configPath = 'config.json';
const hoferPath = 'hofer.json';
const modsPath = 'mods.json';
const hoferChannelPath = 'hoferChannel.json'
const devId = '175177376026722304';
const guildId = '231113242750091265';

const regexCommandSilenceHofer = /^\!sh\s+silence\s+.+$/;
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

function setHofer(msg) {
    let hoferUsername = msg.content.replace(/^\!sh\s+silence\s+/,'');
    let hoferId = getUserId(hoferUsername);
    fs.writeFileSync(hoferPath, JSON.stringify({"hofer": hoferId}));
    replyToUser(msg, `**${hoferUsername}** is now the hofer`)
}

function setHoferChannel(channelId) {
    fs.writeFileSync(hoferChannelPath, JSON.stringify({"hoferChannel": channelId}));
}

function getHoferChannel() {
    let rawdata = fs.readFileSync(hoferChannelPath);
    return (JSON.parse(rawdata)).hoferChannel;
}

function getHofer() {
    if(fs.existsSync(hoferPath)) {
        let rawdata = fs.readFileSync(hoferPath);
        return (JSON.parse(rawdata)).hofer;
    }
    return null;
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

function getUserId(nickname) {
    let guild = client.guilds.cache.get(guildId); // Getting the guild.
    let member = guild.members.cache.find(user => user.nickname === nickname); // Getting the member.

    if(typeof member !== 'undefined') {
        return member.user.id;
    }
    return null;
}

function addMod(msg, modUsername) {
    let mods;
    let modId = getUserId(modUsername);

    if(modId === null) {
        replyToUser(msg, `No such user **${modUsername}**`)
        return;
    }
    
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
    
    fs.writeFileSync(modsPath, JSON.stringify({"Mods": mods}));
    replyToUser(msg, `**${modUsername}** has been added to mods`);
}

function removeMod(msg, modUsername) {
    let modId = getUserId(modUsername);

    if(modId === null) {
        replyToUser(msg, `No such user **${modUsername}**`)
        return;
    }

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

function talk(voiceChannel) {
    voiceChannel.join().then(connection =>{
        connection.play('donnie_thornberry.mp3');
    }).catch(err => console.log(err));
}


config = getConfig();
const client = new Discord.Client();

client.once('ready', () => {
    console.log("StopHoferBot is online!")
});

client.on('message', msg => {
    if(msg.content.match(regexCommandSilenceHofer)) {
        if(isMod(msg.author.id)) {
            setHofer(msg);
        } else {
            replyToUser(msg, "you are not a mod");
        }
    }

    if(msg.content.match(regexCommandRemoveHofer)) {
        if(isMod(msg.author.id)) {
            if(fs.existsSync(hoferPath)) {
                let hoferId = getHofer();
                let hoferUsername = msg.guild.members.cache.get(hoferId).user.username;
                fs.unlinkSync(hoferPath);
                replyToUser(msg, `**${hoferUsername}** finally stopped hofering`);
            } else {
                replyToUser(msg, "No one is hofering now thank god");
            }
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
            let hoferId = getHofer();
            let hoferUsername = msg.guild.members.cache.get(hoferId).user.username;
            replyToUser(msg, `**${hoferUsername}** is hofering everybody`);
        } else {
            replyToUser(msg, "No one is hofering now thank god");
        }
    }
})

client.on("voiceStateUpdate", (oldState, newState) => {
    const hoferId = getHofer();

    if(newState.id === hoferId) {
        const channel = client.channels.cache.get(newState.channelID);

        if(channel !== 'undefined') {
            channel.join();
            setHoferChannel(newState.channelID);
        }
    }
});

client.on('guildMemberSpeaking', (member, speaking) => {
    const hoferId = getHofer();

    if (member.id === hoferId && speaking) {
        const Guild = client.guilds.cache.get(guildId); // Getting the guild.
        const Member = Guild.members.cache.get(hoferId); // Getting the member.
        talk(Member.voice.channel);
    }
});

client.login(config.token);