import type { Plugin } from "./plugin-api";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import { buildRegex } from "./regex-based";

// todo: badges (https://api.frankerfacez.com/v1/badges/ids)
// would require a slight change to the Badge type (background color)

interface User {
	_id: number;
	name: string;
	display_name: string;
}

interface Emote {
	type: "Global" | "Channel";
	id: number;
	name: string;
	height: number;
	width: number;
	public: boolean;
	hidden: boolean;
	modifier: boolean;
	offset: null;
	margins: null;
	css: null;
	owner: User;
	urls: Record<number, string>;
	highestRes: number; // added by me
	status: number;
	usage_count: number;
	created_at: string;
	last_updated: string;
}

interface Room {
	_id: number;
	set: number;
	twitch_id: number;
	youtube_id: null;
	id: string;
	is_group: boolean;
	display_name: string;
	moderator_badge: null;
	vip_badge: null;
	mod_urls: null;
	user_badges: {};
	user_badge_ids: {};
	css: null;
}

interface EmoteSet {
	id: number;
	title: string;
	emoticons: Emote[];
}

let globalEmotes: Record<string, Emote> = {};
const channelEmotes = new Map<string, Record<string, Emote>>();
let globalEmoteRegex: RegExp | null = null;
const emoteRegexes = new Map<string, RegExp>();

export const plugin: Plugin = {
	id: "frankerfacez",
	async init() {
		const res = await fetch("https://api.frankerfacez.com/v1/set/global", {
			method: "GET",
			responseType: ResponseType.JSON,
		});
		const data = res.data as {
			default_sets: number[];
			sets: Record<number, EmoteSet>;
		};
		let emoteNames = [] as string[];
		for (const emote of data.default_sets.flatMap(
			set => data.sets[set].emoticons
		)) {
			emote.type = "Global";
			emote.highestRes = Math.max(...Object.keys(emote.urls).map(Number));
			globalEmotes[emote.name] = emote;
			emoteNames.push(emote.name);
		}
		globalEmoteRegex = buildRegex(emoteNames);
		console.log("Built regex", globalEmoteRegex, "for global", globalEmotes);
	},
	async channelId(channel, id) {
		if (channelEmotes.has(id)) return;
		const res = await fetch(`https://api.frankerfacez.com/v1/room/id/${id}`, {
			method: "GET",
			responseType: ResponseType.JSON,
		});
		if (!res.ok) return;
		const data = res.data as { room: Room; sets: Record<number, EmoteSet> };
		const emoteMap: Record<string, Emote> = {};
		let emoteNames = [] as string[];
		for (const emote of data.sets[data.room.set].emoticons) {
			emote.type = "Channel";
			emote.highestRes = Math.max(...Object.keys(emote.urls).map(Number));
			emoteMap[emote.name] = emote;
			emoteNames.push(emote.name);
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
					code: emote.name,
					char_range: {
						start: match.index!,
						end: match.index! + emote.name.length,
					},
					info: `FFZ ${emote.type} Emote`,
					url: `https://cdn.frankerfacez.com/emote/${emote.id}/${emote.highestRes}`,
				});
			}
		};
		if (globalEmoteRegex) run(globalEmoteRegex, globalEmotes);
		const emotes = channelEmotes.get(msg.channel_id);
		const regex = emoteRegexes.get(msg.channel_id);
		if (emotes && regex) run(regex, emotes);
	},
};
