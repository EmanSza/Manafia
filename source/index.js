const discord = require('discord.js');
const mongoose = require('mongoose')

const { TOKEN, MONGODB } = require('../configs/config.json')
const { registerCommands, registerEvents } = require('./utils/registry');

const client = new discord.Client();

(async () => {
    console.log('Logging in')
    client.userInfoCache = new discord.Collection();
    client.userInfo = require('../schemas/user')
    await client.login(TOKEN);
    await mongoose.connect(MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
    client.commands = new discord.Collection();
    await registerEvents(client, '../eventHandlers');
    await registerCommands(client, "../commands")
    console.log('Loaded Commands, EventHandlers, Databases and Online!')
})();