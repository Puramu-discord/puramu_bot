import { Client, GatewayIntentBits, Message, Partials } from "discord.js";
import dotenv from "dotenv";

dotenv.config();
console.log(Object.keys(process.env).filter((k) => k.includes("DISCORD")));

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel],
})

client.once('ready', () => {
    console.log("Ready!")
    if (client.user) {
        console.log(client.user.tag)
    }
})

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return
    if (message.content === '!time') {
        const date1 = new Date();
        if (!message.channel.isSendable()) return;
        await message.channel.send(date1.toLocaleString());
    }
})

client.login(process.env.DISCORD_TOKEN)