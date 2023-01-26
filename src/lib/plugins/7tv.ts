import type { Plugin } from "./plugin-api";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import { buildRegex } from "./regex-based";

// todo: badges and maybe paints?

interface Emote {
	type: "Global" | "Channel";
	id: string;
	name: string;
	flags: number;
	timestamp: number;
	actor_id: null;
	data: {
		id: string;
		name: string;
		flags: number;
		lifecycle: number;
		state: ["LISTED"];
		listed: boolean;
		animated: boolean;
		owner: {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string;
			style: {};
			roles: [string];
		};
		host: {
			url: `//cdn.7tv.app/emote/${string}`;
			files: {
				name: string;
				static_name: string;
				width: number;
				height: number;
				frame_count?: number;
				size: number;
				format: string;
			}[];
		};
	};
}

interface EmoteSet {
	id: string;
	name: string;
	flags: number;
	tags: string[];
	immutable: boolean;
	privileged: boolean;
	emotes: Emote[];
}

interface UserInfo {
	id: string;
	platform: "TWITCH";
	username: string;
	display_name: string;
	linked_at: number;
	emote_capacity: number;
	emote_set_id: null;
	emote_set: EmoteSet;
	user: {
		id: string;
		username: string;
		display_name: string;
		created_at: number;
		avatar_url: string;
		biography: string;
		style: {
			color: number;
		};
		editors: {
			id: string;
			permissions: number;
			visible: boolean;
			added_at: number;
		}[];
		roles: string[];
		connections: {
			id: string;
			platform: string;
			username: string;
			display_name: string;
			linked_at: number;
		}[];
	};
}

let globalEmotes: Record<string, Emote> = {};
const channelEmotes = new Map<string, Record<string, Emote>>();
let globalEmoteRegex: RegExp | null = null;
const emoteRegexes = new Map<string, RegExp>();
export const plugin: Plugin = {
	id: "7tv",
	async init() {
		const res = await fetch("https://7tv.io/v3/emote-sets/global", {
			method: "GET",
			responseType: ResponseType.JSON,
		});
		const data = res.data as EmoteSet;
		let emoteNames = [] as string[];
		for (const emote of data.emotes) {
			emote.type = "Global";
			globalEmotes[emote.name] = emote;
			emoteNames.push(emote.name);
		}
		globalEmoteRegex = buildRegex(emoteNames);
		console.log("Built regex", globalEmoteRegex, "for global", globalEmotes);
	},
	async channelId(channel, id) {
		if (channelEmotes.has(id)) return;
		const res = await fetch(`https://7tv.io/v3/users/twitch/${id}`, {
			method: "GET",
			responseType: ResponseType.JSON,
		});
		if (!res.ok) return;
		const data = res.data as UserInfo;
		const emoteMap: Record<string, Emote> = {};
		let emoteNames = [] as string[];
		for (const emote of data.emote_set.emotes) {
			emote.type = "Channel";
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
					info: `7tv ${emote.type} Emote`,
					url: `https://cdn.7tv.app/emote/${emote.data.id}/3x`,
				});
			}
		};
		if (globalEmoteRegex) run(globalEmoteRegex, globalEmotes);
		const emotes = channelEmotes.get(msg.channel_id);
		const regex = emoteRegexes.get(msg.channel_id);
		if (emotes && regex) run(regex, emotes);
	},
};
