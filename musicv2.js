const { Client, Intents, EmbedBuilder, ButtonBuilder, MessageActionRow, MessageAttachment, GatewayIntentBits} = require('discord.js');
require('dotenv').config();
var search = require('youtube-search');
const { drawHelp } = require('./help/help.js')
const ytdl = require('ytdl-core-discord');
const { Youtube, Spotify } = require('you-lister')
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus} = require('@discordjs/voice');
const {thumbnail} = require("ytdl-core-discord");
const Canvas = require('canvas');
const {get_playlist_urls, get_playlist_count} = require("./playlist");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const prefix = '|'
let voice_status
const player = createAudioPlayer();
let queue = []
let messId
let music_paused = false



//SET BASTIBOT ACTIVITY


var opts = {
    maxResults: 10,
    key: 'AIzaSyA6sMPfDmXIRx_mwaJ8wwQXzFUot0Ru6aA'
};



const NextButton = new ButtonBuilder()
    .setCustomId('next')
    .setLabel('')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('⏭️');

const PauseButton = new ButtonBuilder()
    .setCustomId('pause')
    .setLabel('')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('⏯');


const UnpauseButton = new ButtonBuilder()
    .setCustomId('primary')
    .setLabel('Primary')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('123456789012345678');

const StopButton = new ButtonBuilder()
    .setCustomId('stop')
    .setLabel('')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🟥');


const playBar = new MessageActionRow()
    .addComponents(
        StopButton,
        PauseButton,
        NextButton
    );



const pauseEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Music is pause')

const playEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Now playing')

const nextEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Skip music')

const queuEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Music in queue')



player.on('error', error => {
    console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
});

client.on('ready', () => {
    client.user.setActivity('|help', {type: "WATCHING"});
    console.log(`Logged in as ${client.user.tag}!`);
});

player.on(AudioPlayerStatus.Idle, () => {
    if (queue.length > 1) {
        queue.shift()
        console.log(queue)
        messId.channel.send("Next Music")
        play_music(queue[0], voice_status)
    } else {
        stop_music(voice_status)
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'stop') {
        await interaction.reply('Music Stopped')
        stop_music(voice_status)
    }
    if (interaction.customId === 'pause') {
        if (music_paused === false) {
            await interaction.reply('Music paused')
            pause_music(voice_status)
            music_paused = true
        } else {
            await interaction.reply('Music unpaused')
            unpause_music(voice_status)
            music_paused = false
        }
    }
    if (interaction.customId === 'next') {
        await interaction.reply('Skipped')
        next_music()
    }
});


client.on("messageCreate", message => {
    if (message.author.bot) return;
    let request = message.content.split(" ");

    if (request[0] === prefix + "search") {
        for (let i = 2;request[i];i++){
            request[1] += ' ' + request[i]
        }
        search(request[1], opts, async function (err, results) {
            if (err) return console.log(err);
            id = results[0].id
            url = results[0].link
            thumb = results[0].thumbnails
            title = results[0].title
            if (results[0].kind === 'youtube#playlist') {
                let urls = await get_playlist_urls(id)
                for (let i = 0;urls[i];i++) {
                    queue[queue.length] = urls[i]
                }
            console.log("playlist");
            console.log(queue[queue.length - 1])
            console.log(await get_playlist_count(id))
            } else  {
                queue[queue.length] = url
            }
            if (queue.length === 1 || await get_playlist_count(id) === queue.length) {
                if (!message.member.voice.channel) return message.channel.send("Please connect to a voice channel");
                voice_status = joinVoiceChannel({
                    channelId: message.member.voice.channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator
                })
                messId = message
                let attach = await drawArtistInfo(thumb, title, message)
                play_music(queue[0], voice_status, message, attach)
            }
        });
    }
    if  (request[0] === prefix + "play") {
        if (request.length !== 2) return message.channel.send("Please enter a link");
        queue[queue.length] = request[1]
        console.log(queue)
        console.log(queue.length)
        if (queue.length === 1) {
            if (!message.member.voice.channel) return message.channel.send("Please connect to a voice channel");
            voice_status = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            })
            messId = message
            play_music(request[1], voice_status, message)
        }

    }
    if  (request[0] === prefix + "pause") {
        music_paused = true
        pause_music(voice_status, message)
    }
    if (request[0] === prefix + "help") {
        message.channel.send({embeds: [drawHelp(prefix)]})
    }
    if  (request[0] === prefix + "unpause") {
        music_paused = false
        unpause_music(message,voice_status)
    }
    if  (request[0] === prefix + "stop") {
        stop_music(voice_status)
    }
    if  (request[0] === prefix + "queue") {
        message.channel.send({ embeds: [queuEmbed]})
    }
    if  (request[0] === prefix + "clear") {
        queue = []
    }
    if  (request[0] === prefix + "next" || request[0] === prefix + "skip") {
        next_music(message)
    }

})

async function play_music(request, status, message, attach) {

     if (message) {
         if (attach) {
             message.channel.send({files: [attach], components: [playBar]})
         } else {
             message.channel.send({embeds: [playEmbed], components: [playBar]})
         }
     }
     const resource = createAudioResource(await ytdl(request), {
         metadata: {
             title: "ytb"
         },
     });
    player.play(resource);
    status.subscribe(player);



    return status
}

function pause_music(status, message) {
    if (message) {
        message.channel.send({embeds: [pauseEmbed]})
    }
    player.pause()
}

function unpause_music(message, status) {
    player.unpause()
}


function stop_music(status) {
    queue = []
    status.destroy()
}

function next_music(message) {
    if (message) {
        message.channel.send({embeds: [nextEmbed]})
    }
    player.stop()
}






const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 70;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        context.font = `${fontSize -= 10}px sans-serif`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (context.measureText(text).width > canvas.width - 100);

    // Return the result to use in the actual canvas
    return context.font;
};


async function drawArtistInfo(thumb, title ,message) {
    const canvas = Canvas.createCanvas(thumb.high.width, thumb.high.height);
    const context = canvas.getContext('2d');
    const background = await Canvas.loadImage(thumb.high.url);

    context.drawImage(background, 0, 0, canvas.width, canvas.height)

    context.font = applyText(canvas, title)
    context.fillStyle = '#ffffff';
    context.fillText(title,  10, 30);

    const attachment = new MessageAttachment(canvas.toBuffer(), 'ArtistInfo.jpg');

    return attachment
}









client.login(process.env.token);
