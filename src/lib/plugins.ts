import { pluginVerifier, type Plugin } from "./plugins/plugin-api"
import type { Message } from "./types/message"
// built-in plugins
import { invoke } from "@tauri-apps/api"
import { convertFileSrc } from "@tauri-apps/api/tauri"
import { plugin as sevenTvPlugin } from "./plugins/7tv"
import { plugin as betterttvPlugin } from "./plugins/betterttv"
import { plugin as ffzPlugin } from "./plugins/ffz"
import { plugin as twitchNativePlugin } from "./plugins/twitch-native"

const plugins: Plugin[] = []

function addPlugin(plugin: Plugin) {
	plugins.push(plugin)
}

console.log("Loading plugins")

addPlugin(twitchNativePlugin)
addPlugin(ffzPlugin)
addPlugin(betterttvPlugin)
addPlugin(sevenTvPlugin)
console.log("Loaded integrated twitch-native, frankerfacez, betterttv, and 7tv plugins")
{
	const plugins = await invoke<string[]>("get_plugins")
	await Promise.allSettled(
		plugins.map(async path => {
			const uri = convertFileSrc(path)
			const content = await import(/* @vite-ignore */ uri)
			if (!content.plugin) throw new Error("Plugin does not export a plugin object")
			pluginVerifier.parse(content.plugin)
			addPlugin(content.plugin)
			console.log("Loaded custom plugin", JSON.stringify(content.plugin.id))
		})
	)
	console.log("Loaded", plugins.length, "plugin(s) from disk")
}

await Promise.allSettled(
	plugins.map(async plugin => {
		console.log(`Initializing plugin ${plugin.id}...`)
		await plugin.init?.()
	})
)
console.log("Initialized all plugins")

export async function join(channel: string) {
	for (const plugin of plugins) await plugin.join?.(channel)
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
