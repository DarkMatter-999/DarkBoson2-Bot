import Discord, { Colors, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import http from 'http'
import request from 'sync-request'
dotenv.config()

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
})

const PREFIX = '!'

client.on('ready', () => {
    console.log("Connected to Discord")

    client.user?.setActivity('basics', {type: Discord.ActivityType.Playing})

    let commands = client.application?.commands

    if(commands) {
        commands.create({
            name:'ping',
            description: 'replies with pong'
        })

        const userinfo = new Discord.SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('get information about an user')
        .addMentionableOption(option =>
            option.setName('User')
            .setDescription('get information about an user')
            .setRequired(true)
        )

        commands.create(userinfo)

    }
})

client.on("interactionCreate", async (interaction) => {
    if(!interaction.isCommand()) {
        return
    }

    const { commandName, options } = interaction
    
    if (commandName === 'ping') {
        await interaction.reply({
            content: 'pinging...',
            ephemeral: true
        })
        await interaction.editReply('Pong! '+"`"+client.ws.ping+"`") 

    } else if(commandName === 'userinfo') {
        // const user = interaction.options.get('User', true)
        // const target = await interaction.guild?.members.fetch()

        //     if(target) {
        //         console.log(target.user.username)
        //         const Response = new Discord.EmbedBuilder()
        //         .setColor("Purple")
        //         .setAuthor({name: target.user.tag, iconURL: target.user.avatarURL({size: 512}) || undefined})
        //         .setThumbnail (target.user.avatarURL({size: 512}))
        //         .addFields(
        //             {name: "ID", value: `${target.user.id}`},
        //             {name: "Roles", value: `${target.roles.cache.map(r => r).join(" ").replace("@everyone", "") || "None"}`},
        //             {name: "Member Since", value: `<t:${parseInt(((target.joinedTimestamp || 0) / 1000).toString())}:R>`},
        //             {name: "Discord User Since", value: `<t:${parseInt(((target.user.createdTimestamp || 0) / 1000).toString())}:R>`}
        //         )

        //         await interaction.reply({embeds: [Response]})
        //     } else {
        //         await interaction.reply({content: 'User not found...'})
        //     }
    }
})

client.on("messageCreate", async (message) => {
    if(message.author.bot) return

    if(message.content === 'ping') {
        message.reply({
            content: 'pong'
        })
    }

    if(message.content.startsWith(PREFIX)) {
        const [cmd, ...options] = message.content.trim().substring(PREFIX.length).split(/\s+/)

        if(cmd === 'ip') {
            var res = request('GET', 'http://ifconfig.me');
            message.reply({
                content: res.getBody().toString(),
            })
        } else if(cmd === 'ping') {
            message.reply("pinging...").then(msg => {
                const ping = client.ws.ping
                msg.edit('Pong! '+"`"+ping+"`")
            })
        } else if(cmd === "userinfo") {

            const target = await message.guild?.members.fetch(message.mentions.users.first()?.id || message.author.id)

            if(target) {
                console.log(target.user.username)
                const Response = new Discord.EmbedBuilder()
                .setColor("Purple")
                .setAuthor({name: target.user.tag, iconURL: target.user.avatarURL({size: 512}) || undefined})
                .setThumbnail (target.user.avatarURL({size: 512}))
                .addFields(
                    {name: "ID", value: `${target.user.id}`},
                    {name: "Roles", value: `${target.roles.cache.map(r => r).join(" ").replace("@everyone", "") || "None"}`},
                    {name: "Member Since", value: `<t:${parseInt(((target.joinedTimestamp || 0) / 1000).toString())}:R>`},
                    {name: "Discord User Since", value: `<t:${parseInt(((target.user.createdTimestamp || 0) / 1000).toString())}:R>`}
                )

                await message.reply({embeds: [Response]})
                return
            } else {
                await message.reply({content: 'User not found...'})
            }
        }
    }
})

client.login(process.env.TOKEN)