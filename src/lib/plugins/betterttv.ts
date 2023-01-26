import type { Plugin } from "./plugin-api";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import { buildRegex } from "./regex-based";

interface Emote {
	id: string;
	code: string;
	imageType: string;
	animated: boolean;
	userId: string;
	type: "Global" | "Channel" | "Shared";
}

interface User {
	id: string;
	avatar: string;
	bots: [];
	channelEmotes: Emote[];
	sharedEmotes: Emote[];
}

let globalEmotes: Record<string, Emote> = {};
const channelEmotes = new Map<string, Record<string, Emote>>();
let globalEmoteRegex: RegExp | null = null;
const emoteRegexes = new Map<string, RegExp>();
export const plugin: Plugin = {
	id: "betterttv",
	async init() {
		const res = await fetch(
			"https://api.betterttv.net/3/cached/emotes/global",
			{ method: "GET", responseType: ResponseType.JSON }
		);
		const data = res.data as Emote[];
		let emoteNames = [] as string[];
		for (const emote of data) {
			emote.type = "Global";
			globalEmotes[emote.code] = emote;
			emoteNames.push(emote.code);
		}
		globalEmoteRegex = buildRegex(emoteNames);
		console.log("Built regex", globalEmoteRegex, "for global", globalEmotes);
	},
	async channelId(channel, id) {
		if (channelEmotes.has(id)) return;
		const res = await fetch(
			`https://api.betterttv.net/3/cached/users/twitch/${id}`
		);
		if (!res.ok) return;
		const data = res.data as User;
		const emoteMap: Record<string, Emote> = {};
		let emoteNames = [] as string[];
		for (const emote of data.channelEmotes) {
			emote.type = "Channel";
			emoteMap[emote.code] = emote;
			emoteNames.push(emote.code);
		}
		for (const emote of data.sharedEmotes) {
			emote.type = "Shared";
			emoteMap[emote.code] = emote;
			emoteNames.push(emote.code);
		}
		const regex = buildRegex(emoteNames);
		console.log("Built regex", regex, "for", emoteMap);
		emoteRegexes.set(id, regex);
		channelEmotes.set(id, emoteMap);
	},
	privMsg(msg) {
		const run = (regex: RegExp, emotes: Record<string, Emote>) => {
			const matches = msg.message_text.matchAll(regex);
			if (!matches) return;
			for (const match of matches) {
				const emote = emotes[match[0]];
				msg.emotes.push({
					code: emote.code,
					char_range: {
						start: match.index!,
						end: match.index! + emote.code.length,
					},
					info: `BTTV ${emote.type} Emote`,
					url: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
				});
			}
		};
		if (globalEmoteRegex) run(globalEmoteRegex, globalEmotes);
		const emotes = channelEmotes.get(msg.channel_id);
		const regex = emoteRegexes.get(msg.channel_id);
		if (emotes && regex) run(regex, emotes);
	},
};
