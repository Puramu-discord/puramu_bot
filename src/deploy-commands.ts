import { REST, Routes } from "discord.js"
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord.js"
import dotenv from "dotenv"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
dotenv.config()

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
const foldersPath = path.join(import.meta.dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = await import(pathToFileURL(filePath).href)
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON())
        } else {
            console.warn(`[WARN] The command at ${filePath} is missing a required "data or "execute" property.`)
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN || "");

(async () => {
    try {
        console.log(`${commands.length}件のコマンドを登録します`)
        
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID || "", process.env.SERVER_ID || ""),
            { body: commands },
        ) as unknown[]
        console.log(`${data.length}件のコマンドを登録しました`)
    } catch (error) {
        console.error(error)
    }
})()