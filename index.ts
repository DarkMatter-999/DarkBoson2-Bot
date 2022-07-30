import Discord, { GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
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

    let commands = client.application?.commands

    commands?.create({
        name:'ping',
        description: 'replies with pong'
    })
})

client.on("interactionCreate",async (interaction) => {
    if(!interaction.isCommand()) {
        return
    }

    const { cmdName, options } = interaction
    
    if (cmdName === 'ping') {
        interaction.reply({
            content: 'pong',
            ephemeral: true,
        })
    }
})

client.on("messageCreate", (message) => {
    if(message.author.bot) return

    console.log(message)
    if(message.content === 'ping') {
        message.reply({
            content: 'pong'
        })
    }

    if(message.content.startsWith(PREFIX)) {
        //do stuff
    }
})

client.login(process.env.TOKEN)