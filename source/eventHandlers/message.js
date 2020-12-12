const { processArguments, msToTime, missingPermissions } = require("../utils/utils")
const { Collection } = require("discord.js")
const cooldowns = new Collection();
const { developer, PREFIX } = require('../../configs/config.json')
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = async (client, message) => {
    if (message.author.bot || message.channel.type === 'dm') return;

    let userInfo = client.userInfoCache.get(message.author.id)
    if (!userInfo) {
        const fetch = await client.userInfo.findByIdAndUpdate(message.author.id, {}, {new: true, upsert: true, setDefaultsOnInsert: true});
        userInfo = {};
        userInfo['_id'] = fetch._id;
        client.userInfoCache.set(message.author.id)
    }
    
    
    let msgargs = message.content.slice(PREFIX.length).trim().split(/ +/);
    let cmdName = msgargs.shift().toLowerCase();
    if (!message.content.startsWith(PREFIX)) return
    
    if (message.mentions.has(client.user) && !cmdName) return message.channel.send(`My prefix is \`${PREFIX}\`\nTo view a list of my commands, type \`${PREFIX}help\``)
    
    
    const command = await client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

    if (!command) return;

    if (command.devOnly && !developer.includes(message.author.id)) return;

    const cd = command.cooldown;
    if (cd) {
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = cd * 1000;
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) return await message.channel.send(`${message.author.username}, please wait \`${msToTime(expirationTime - now)}\` before using this command again.`)
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    if (command.arguments && command.arguments.length !== 0) msgargs = processArguments(message, command.arguments, msgargs)
    if (!msgargs) return;
    try {
        command.execute(client, message, msgargs);
    } catch (error) {
        message.channel.send(`Oops, something went wrong!`)
        console.log(`Error occured!\nAt command: ${command.name}\nError message: ${error.message}\nError trace: ${error.trace}`)
    }
};