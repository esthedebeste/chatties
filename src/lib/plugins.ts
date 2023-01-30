import type { Plugin } from "./plugins/plugin-api"
import type { Message } from "./types/message"
// built-in plugins
import { plugin as twitchNativePlugin } from "./plugins/twitch-native"
import { plugin as sevenTvPlugin } from "./plugins/7tv"
import { plugin as ffzPlugin } from "./plugins/ffz"
import { plugin as betterttvPlugin } from "./plugins/betterttv"

export const plugins: Plugin[] = []

export const addPlugin = async (plugin: Plugin) => {
	await plugin.init?.()
	plugins.push(plugin)
}

console.log("Loading plugins")

await addPlugin(twitchNativePlugin)
await addPlugin(ffzPlugin)
await addPlugin(betterttvPlugin)
await addPlugin(sevenTvPlugin)

console.log("Loaded twitch-native, betterttv, and 7tv")
for (const plugin of JSON.parse(localStorage.getItem("plugins") || "[]")) {
	await addPlugin(plugin)
	console.log("Loaded", plugins[plugins.length - 1].id)
}

export const removePlugin = (plugin: Plugin | string) => {
	const index =
		typeof plugin === "string" ? plugins.findIndex(x => x.id === plugin) : plugins.indexOf(plugin)
	if (index === -1) return
	plugins[index].destroy?.()
	plugins.splice(index, 1)
}

export function join(channel: string) {
	for (const plugin of plugins) plugin.join?.(channel)
}

export async function channelId(channel: string, id: string): Promise<void> {
	for (const plugin of plugins) await plugin.channelId?.(channel, id)
}

export function leave(channel: string) {
	for (const plugin of plugins) plugin.leave?.(channel)
}

export function message(message: Message): void {
	for (const plugin of plugins) plugin.message?.(message)
}
