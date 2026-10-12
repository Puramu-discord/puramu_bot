import {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    MessageFlags
} from "discord.js"
import dotenv from "dotenv"
import fs from "node:fs"
import path from "node:path"
import http from "node:http"
import { pathToFileURL } from "node:url"
import type { Command } from "./types.js"

dotenv.config()

http
    .createServer((_req, res) => {
        res.writeHead(200)
        res.end("Server is Online.")
    })
    .listen(Number(process.env.PORT) || 8080)

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
})

const commands = new Collection<string, Command>()
const foldersPath = path.join(import.meta.dirname, "commands")

for (const folder of fs.readdirSync(foldersPath)) {
    const commandsPath = path.join(foldersPath, folder)
    const files = fs
        .readdirSync(commandsPath)
        .filter((f) => (f.endsWith(".js") || f.endsWith(".ts")) && !f.endsWith(".d.ts"))
    
    for (const file of files) {
        const filePath = path.join(commandsPath, file);
        const command = (await import(pathToFileURL(filePath).href)) as Command
        if ("data" in command && "execute" in command) {
            commands.set(command.data.name, command)
        } else {
            console.warn(`[WARN] ${filePath} に data または execute がありません。`)
        }
    }
}

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! ${readyClient.user.tag}`)
})

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = commands.get(interaction.commandName)
    if (!command) return

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        const reply = {
            content: "コマンドの実行中にエラーが発生しました。",
            flags: MessageFlags.Ephemeral,
        } as const;
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
        } else {
            await interaction.reply(reply);
        }
    }
})

client.once('ready', () => {
    console.log("Ready!")
    if (client.user) {
        console.log(client.user.tag)
    }
})

client.login(process.env.DISCORD_TOKEN)