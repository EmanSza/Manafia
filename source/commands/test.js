const PREFIX = require('../../configs/config.json').PREFIX;

module.exports = {
    name: "test",
    aliases: ["pong"],
    description: "Get the bots current ping.",
    usage: `\`${PREFIX}ping\``,
    execute: async function(client, message, args) {
        const { rect } = require('../utils/utils');
        const { createCanvas, loadImage, registerFont } = require('canvas');
        const { MessageAttachment } = require('discord.js');
        
            let channel = message.guild.channels.cache.get('782642033940496454')
            if (!channel) return; 
            let mainColour = '#000000';
            let statColour = '#ffffff';
            await registerFont('images/mukta.ttf', { family : 'welcomeFont' });
            console.log('1')
            const background = await loadImage('https://i.imgur.com/7QrotVQ.png');
            console.log('2')
            const canvas = createCanvas(850, 384);
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.fillStyle = '#303F76';
            rect(ctx, 0, 0, canvas.width, canvas.height, 45);
            ctx.fill();
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 40;
            ctx.save();
            rect(ctx, 0, 0, canvas.width, canvas.height, 45);
            ctx.clip();
            ctx.drawImage(background, 0, 0, canvas.width + 500, canvas.height + 305);
            ctx.restore();
            ctx.shadowBlur = 0;
            ctx.save();
        
            const userPicture = await loadImage(message.member.user.avatarURL(({ format: 'png' })));
            rect(ctx, 44, 55, 277, 277, 47);
                ctx.clip();
        
            var scale = Math.max(280 / userPicture.width, 280 / userPicture.height);
            var x = 170 + 14 - (userPicture.width / 2) * scale;
            var y = 170 + 25 - (userPicture.height / 2) * scale;
            ctx.drawImage(userPicture, x, y, userPicture.width * scale, userPicture.height * scale);
            ctx.restore();
        
        
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = statColour;
            rect(ctx, 345, 55, 450, 120, 51)
        
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = mainColour;
            const tag = message.member.user.tag;
            const server_name = message.member.guild.name;
            ctx.font = 'bold 40px welcomeFont';
            ctx.textAlign = 'center';
            ctx.fillText(tag, 345 + 225, 55 + 90, 425)
            ctx.textAlign = 'center';
            ctx.font = '27px welcomeFont';
            ctx.fillText(`Welcome to ${server_name}!`, 345 + 225, 55 + 35, 425);
        
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = statColour;
            rect(ctx, 345, 55 + 150, 450, 120, 51);
        
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = mainColour;
            const member_number = message.member.guild.memberCount;
            ctx.font = '35px welcomeFont';
            ctx.textAlign = 'center';
            ctx.fillText(`You are member #${member_number}!`, 345 + 225, 55 + 150 + 70);
        
            const attachment = new MessageAttachment(canvas.toBuffer(), 'member.png')
            message.channel.send(attachment);
            }



    }

