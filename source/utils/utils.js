const { Message, User, MessageEmbed, Client, GuildMember } = require("discord.js");
const reactions = ['◀️', '⏸️', '▶️']

/**
 * Function to check if the user has passed in the proper arguments when using a command
 * @param {Message} message - The message to check the arguments for
 * @param {object[]} expectedArgs - The expected arguments for the command
 * @param {array} msgArgs - The arguments given by the user
 * @return {array} Returns the arguments array if all the arguments were as expected, else, returns `undefined/false`
 */
function processArguments(message, expectedArgs, msgArgs) {
    let counter = 0;
    let num, role, member, channel;
    for (const argument of expectedArgs) {
        if (!argument.type) return console.log("You didn't provide an argument type.");
        switch (argument.type) {
            case "NUMBER":
                num = Number(msgArgs[counter]);
                if (!msgArgs[counter] || isNaN(num)) {
                    if (argument.prompt) message.channel.send(argument.prompt);
                    return
                }
                else msgArgs[counter] = num;
                break;
            case "CHANNEL":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                if (msgArgs[counter].startsWith("<#") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(2, -1)
                channel = message.guild.channels.cache.get(msgArgs[counter]);
                if (!channel) {
                    if (argument.prompt) message.channel.send(argument.prompt);
                    return
                };
                msgArgs[counter] = channel;
                break;
            case "ROLE":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                if (msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(3, -1)
                role = message.guild.roles.cache.get(msgArgs[counter])
                if (!role) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                msgArgs[counter] = role;
                break;
            case "AUTHOR_OR_MEMBER":
                if (msgArgs[counter] && (msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[coutner].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                member = message.guild.members.cache.get(msgArgs[counter])
                if (!member) msgArgs[counter] = message.member
                else msgArgs[counter] = member
                break;
            case "ROLE_OR_MEMBER":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                if (msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(3, -1)
                role = message.guild.roles.cache.get(msgArgs[counter])
                if (!role) {
                    if ((msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[coutner].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                    member = message.guild.members.cache.get(msgArgs[counter])
                    if (!member) return
                    else msgArgs[counter] = member
                } else msgArgs[counter] = role
                break;
            case "STRING":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                break;
            case "MEMBER":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                if ((msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[coutner].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                member = message.guild.members.cache.get(msgArgs[counter])
                if (!member) return
                else msgArgs[counter] = member
                break;
            default:
                return console.log(`The argument type ${argument.type} doesn't exist.`);
        }
        counter++
    }
    return msgArgs;
}

/**
 * Function to glocally blacklist a user
 * @param {Client} client - The client object (because the schemas are stored to it)
 * @param {string} userID - The ID of the user to whitelist 
 */
async function blacklist(client, userID) {
    if (client.blacklistCache.has(userID)) return
    await client.DBConfig.findByIdAndUpdate('blacklist', {$push: {'blacklisted': userID}}, { new: true, upsert: true, setDefaultsOnInsert: true })
    client.blacklistCache.add(userID)
}

/**
 * Function to globally whitelist a previously blacklisted user
 * @param {Client} client - The client object (because the schemas are stored to it)
 * @param {string} userID - The ID of the user to whitelist 
 */
async function whitelist(client, userID) {
    if (!client.blacklistCache.has(userID)) return
    await client.DBConfig.findByIdAndUpdate('blacklist', {$pull: {'blacklisted': userID}}, { new: true, upsert: true, setDefaultsOnInsert: true })
    client.blacklistCache.delete(userID)
}

/**
 * Function to automatically send paginated embeds and switch between the pages by listening to the user reactions
 * @param {Message} message - Used to send the paginated message to the channel, get the user, etc.
 * @param {MessageEmbed[]} embeds - The array of embeds to switch between
 * @param {*} [options] - Optional parameters
 * @param {number} [options.time] - The max time for createReactionCollector after which all of the reactions disappear
 * @example Examples can be seen in `src/utils/utils.md`
 */
async function paginate(message, embeds, options) {
    const pageMsg = await message.channel.send({ embed: embeds[0] })
    await pageMsg.react(reactions[0])
    await pageMsg.react(reactions[1])
    await pageMsg.react(reactions[2])

    let pageIndex = 0;
    let time = 30000;
    const filter = (reaction, user) => {
        return reactions.includes(reaction.emoji.name) && user.id === message.author.id;
    };
    if (options) {
        if (options.time) time = options.time
    }
    const collector = pageMsg.createReactionCollector(filter, { time: time });
    collector.on('collect', (reaction, user) => {
        reaction.users.remove(user)
        if (reaction.emoji.name === '▶️') {
            if (pageIndex < embeds.length-1) {
                pageIndex++
                pageMsg.edit({ embed: embeds[pageIndex] })
            } else {
                pageIndex = 0
                pageMsg.edit({ embed: embeds[pageIndex] })
            }
        } else if (reaction.emoji.name === '⏸️') {
            collector.stop()
        } else if (reaction.emoji.name === '◀️') {
            if (pageIndex > 0) {
                pageIndex--
                pageMsg.edit({ embed: embeds[pageIndex] })
            } else {
                pageIndex = embeds.length-1
                pageMsg.edit({ embed: embeds[pageIndex]})
            }
        }
    });

    collector.on('end', () => pageMsg.reactions.removeAll().catch(err => console.log(err)));
}

/**
 * Function to await a reply from a specific user.
 * @param {Message} message - The message to listen to
 * @param {object} [options] - Optional parameters
 * @param {number} [options.time] - The max time for awaitMessages 
 * @param {User} [options.user] - The user to listen to messages to
 * @param {String[]} [options.words] - Optional accepted words, will aceept any word if not provided
 * @param {RegExp} [options.regexp] - Optional RegExp to accept user input that matches the RegExp
 * @return {(Message|Boolean)} Returns the `message` sent by the user if there was one, returns `false` otherwise.
 * @example const reply = await getReply(message, { time: 10000, words: ['yes', 'y', 'n', 'no'] })
 */
async function getReply(message, options) {
    let time = 30000
    let user = message.author
    let words = []
    if (options) {
        if (options.time) time = options.time
        if (options.user) user = options.user
        if (options.words) words = options.words
    }
    const filter = msg => {
        return msg.author.id === user.id
               && (words.length === 0 || words.includes(msg.content.toLowerCase()))
               && (!options.regexp || options.regexp.test(msg.content))
    }
    const msgs = await message.channel.awaitMessages(filter, { max: 1, time: time })
    if (msgs.size > 0) return msgs.first()
    return false
}

/**
 * Return an random integer between `min` and `max` (both inclusive)
 * @param {number} min - The lower bound
 * @param {number} max - The upper bound
 * @return {number}
 * @example const rand = randomRange(0, 10)
 */
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Function to set a timeout
 * @param {number} ms - Time to wait in milliseconds
 * @return {Promise}
 * @example await delay(5000)
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Function to convert milliseconds into readable time
 * @param {Number} ms - The time in 
 * @return {String} Readable time as a string
 */
function msToTime(ms) {
    let day, hour, minute, seconds;
    seconds = Math.floor(ms / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return hour ? (`${hour}h ${minute}m ${seconds}s`) : (minute ? (`${minute}m ${seconds}s`) : (`${seconds}s`))
}

/**
 * Function to get all missing permissions of a GuildMember
 * @param {GuildMember} member - The guild member whose missing permissions you want to get
 * @param {String[]} perms - The permissions you want to check for
 * @return {String} Readable string containing all missing permissions
 */
function missingPermissions(member, perms){
    const missingPerms = member.permissions.missing(perms)
    .map(str=> `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``)

    return missingPerms.length > 1 ?
    `${missingPerms.slice(0, -1).join(", ")} and ${missingPerms.slice(-1)[0]}` :
    missingPerms[0]
}
function rect(ctx, x, y, width, height, radius= 5) {

    if (typeof radius === 'number') {
        radius = {
            tl: radius,
            tr: radius,
            br: radius,
            bl: radius
        };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    ctx.fill();
}

function shortenText(ctx, text, maxWidth) {
    let shorten = false;
    while (ctx.measureText(`${text}...`).width > maxWidth) {
        if (!shorten) shorten = true;
        text = text.substr(0, text.length - 1);
    }
    return shorten ? `${text}...` : text;
}

function firstUpperCase(text, split = ' ') {
    return text.split(split).map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
}

function trimArray(arr, maxLen = 12) {
    if (arr.length > maxLen) {
        const len = arr.length - maxLen;
        arr = arr.slice(0, maxLen);
        arr.push(`${len} more...`);
    }
    return arr;
}
module.exports = {
    processArguments, blacklist, whitelist, paginate,
    getReply, randomRange, delay, msToTime, missingPermissions, rect
}