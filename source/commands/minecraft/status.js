const PREFIX = require('../../../configs/config.json').PREFIX;

module.exports = {
    name: "status",
    aliases: ["sat"],
    description: "Get the servers status",
    usage: `\`${PREFIX}status\``,
    
    execute: async function(client, message, args) {
        //Code
        const util = require('minecraft-server-util');

        util.status('manafia.com') // port is default 25565
            .then((host) => {
                console.log(host);
            })
            .catch((error) => {
                throw error;
            });
    }
}
