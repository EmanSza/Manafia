const discord = require('discord.js');
const mongoose = require('mongoose')
const { TOKEN } = require('../configs/config.json')
const client = new discord.Client();
(async () => {
    console.log('Logging in')
    await client.login(TOKEN);
    console.log('Loaded {Empty} and Online!')
})();