import type { Plugin } from "./plugins/plugin-api";
import type { PrivMsg } from "./types/priv-msg";
import { messageStore } from "./api";
// built-in plugins
import { plugin as twitchNativePlugin } from "./plugins/twitch-native";
import { plugin as sevenTvPlugin } from "./plugins/7tv";
import { plugin as ffzPlugin } from "./plugins/ffz";
import { plugin as betterttvPlugin } from "./plugins/betterttv";

export const plugins: Plugin[] = [];

export const addPlugin = async (plugin: Plugin) => {
	await plugin.init?.();
	plugins.push(plugin);
};

console.log("Loading plugins");

await addPlugin(twitchNativePlugin);
await addPlugin(ffzPlugin);
await addPlugin(betterttvPlugin);
await addPlugin(sevenTvPlugin);

console.log("Loaded twitch-native, betterttv, and 7tv");
for (const plugin of JSON.parse(localStorage.getItem("plugins") || "[]")) {
	await addPlugin(plugin);
	console.log("Loaded", plugins[plugins.length - 1].id);
}

export const removePlugin = (plugin: Plugin | string) => {
	const index =
		typeof plugin === "string"
			? plugins.findIndex(x => x.id === plugin)
			: plugins.indexOf(plugin);
	if (index === -1) return;
	plugins[index].destroy?.();
	plugins.splice(index, 1);
};

export function join(channel: string) {
	for (const plugin of plugins) plugin.join?.(channel);
}

export function channelId(channel: string, id: string) {
	for (const plugin of plugins)
		plugin
			.channelId?.(channel, id)
			?.then(() => messageStore(channel.toLowerCase()).update(x => x)); // update messages
}

export function leave(channel: string) {
	for (const plugin of plugins) plugin.leave?.(channel);
}

export function privMsg(msg: PrivMsg): void {
	for (const plugin of plugins) plugin.privMsg?.(msg);
}
