import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("time")
    .setDescription("時間を表示するよ")

export async function execute(interaction: ChatInputCommandInteraction) {
    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
    await interaction.reply(now);
}