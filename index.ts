import Discord, { Colors, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'
import request from 'sync-request'
dotenv.config()

var timetable: JSON;
fs.readFile('timetable.json', 'utf8', function (err, data) {
  if (err) throw err;
  timetable = JSON.parse(data);
});
var daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

    client.user?.setActivity('this Server', {type: Discord.ActivityType.Watching})

    let commands = client.application?.commands

    if(commands) {
        commands.create({
            name:'ping',
            description: 'replies with pong'
        })
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
        let [cmd, ...options] = message.content.trim().substring(PREFIX.length).split(/\s+/)

        cmd = cmd.toLowerCase()

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
        } else if(cmd === "kal") {
            
            var batch = options[0]

            if (!batch) {
                await message.reply("Usage: !kal <Batch>")
                return
            }
    
            const batches = Object.getOwnPropertyNames(timetable)
            if(!batches.includes(batch)) {
                await message.reply("Please choose from: **" + batches.toString() + "**")
                return
            }

            const date = new Date()
            var day = date.getDay() + 1

            var periods = Object.getOwnPropertyNames(timetable[batch][day.toString()])

            const Response = new Discord.EmbedBuilder()
                .setColor("Random")
                .setTitle("Tomorrow - " + daysArray[(day%7)])
                
            for (const p of periods) {
                Response.addFields(
                    { name: timetable[batch][day.toString()][p]["Subj"], value: (timetable[batch][day.toString()][p]["Location"] + "\n" + timetable[batch][day.toString()][p]["StartTime"] + "-" + timetable[batch][day.toString()][p]["EndTime"])}
                )
            }

            await message.reply({embeds: [Response]})

        } else if(cmd === "aaj") {
            
            var batch = options[0]

            if (!batch) {
                await message.reply("Usage: !aaj <Batch>")
                return
            }
            
            const batches = Object.getOwnPropertyNames(timetable)
            if(!batches.includes(batch)) {
                await message.reply("Please choose from: **" + batches.toString() + "**")
                return
            }

            const date = new Date()
            var day = date.getDay()
            var periods = Object.getOwnPropertyNames(timetable[batch][day.toString()])

            const Response = new Discord.EmbedBuilder()
                .setColor("Random")
                .setTitle("Today - " + daysArray[(day%7)])
                
            for (const p of periods) {
                Response.addFields(
                    { name: timetable[batch][day.toString()][p]["Subj"], value: (timetable[batch][day.toString()][p]["Location"] + "\n" + timetable[batch][day.toString()][p]["StartTime"] + "-" + timetable[batch][day.toString()][p]["EndTime"]) + "\n"}
                )
            }

            await message.reply({embeds: [Response]})
        
        } else if(cmd === "abhi") {
            
            var batch = options[0]

            if (!batch) {
                await message.reply("Usage: !abhi <Batch>")
                return
            }
            
            const batches = Object.getOwnPropertyNames(timetable)
            if(!batches.includes(batch)) {
                await message.reply("Please choose from: **" + batches.toString() + "**")
                return
            }
            const date = new Date()
            var day = date.getDay()

            const periods = Object.getOwnPropertyNames(timetable[batch][day.toString()])

            var time = (date.getHours()).toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") 

            const Response = new Discord.EmbedBuilder()
                .setColor("Random")
                
            for (const p of periods) {
                if ( timetable[batch][day.toString()][p]["StartTime"] < time && time < timetable[batch][day.toString()][p]["EndTime"] ) {
                    Response.setTitle(timetable[batch][day.toString()][p]["Subj"])
                    Response.addFields(
                        { name: timetable[batch][day.toString()][p]["Location"], value: (timetable[batch][day.toString()][p]["StartTime"] + "-" + timetable[batch][day.toString()][p]["EndTime"]) + "\n"},
                        { name: "Time", value: time.toString()}
                    )
                    await message.reply({embeds: [Response]})
                    return 
                    }
            }

            Response.setTitle("Kuch nahi")

            await message.reply({embeds: [Response]})
        
        } else if(cmd === "agla") {
            
            var batch = options[0]

            if (!batch) {
                await message.reply("Usage: !agla <Batch>")
                return
            }
            
            const batches = Object.getOwnPropertyNames(timetable)
            if(!batches.includes(batch)) {
                await message.reply("Please choose from: **" + batches.toString() + "**")
                return
            }
            const date = new Date()
            var day = date.getDay()

            const periods = Object.getOwnPropertyNames(timetable[batch][day.toString()])

            var time = (date.getHours()).toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") 

            const Response = new Discord.EmbedBuilder()
                .setColor("Random")
                
            var next = false
            for (const p of periods) {
                if(next) {
                    Response.setTitle(timetable[batch][day.toString()][p]["Subj"])
                    Response.addFields(
                        { name: timetable[batch][day.toString()][p]["Location"], value: (timetable[batch][day.toString()][p]["StartTime"] + "-" + timetable[batch][day.toString()][p]["EndTime"]) + "\n"}
                    )
                    await message.reply({embeds: [Response]})
                    return 
                }

                if ( timetable[batch][day.toString()][p]["StartTime"] < time && time < timetable[batch][day.toString()][p]["EndTime"] ) {
                    next = true
                }
            }

            Response.setTitle("Kuch nahi")

            await message.reply({embeds: [Response]})
        }
    }
})

client.login(process.env.TOKEN)