const { Client, Intents, MessageEmbed, MessageButton, MessageActionRow, MessageAttachment} = require('discord.js');

function drawHelp(prefix)
{
const helpEmbed = new MessageEmbed()
        .setTitle('Help')
        .setColor('#0099ff')
        .setDescription('This is a help message')
        .addFields(
            { name: prefix + 'help', value: 'Display this message' },
            { name: prefix + "play <ytb_url>", value: 'Play a song' },
            { name: prefix + 'search ', value: 'Search for a song ' },
            { name: prefix + 'skip', value: 'Skip a song' },
            { name: prefix + 'next', value: 'next song song' },
            { name: prefix + 'stop', value: 'Stop the music' },
            { name: prefix + 'pause', value: 'Pause the music' },
            { name: prefix + 'unpause', value: 'Resume the music' },
            { name: prefix + 'queue', value: 'Display the queue' },
            { name: prefix + 'clear', value: 'Clear the queue' })
        .setTimestamp()
        .setFooter('Made by @BastosBob');
    return helpEmbed;
}

module.exports = {
    drawHelp
}
