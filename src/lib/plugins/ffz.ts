import type { Plugin } from "./plugin-api"
import { fetch, ResponseType } from "@tauri-apps/api/http"
import { buildRegex, regexEmotes } from "./regex-based"

// todo: badges (https://api.frankerfacez.com/v1/badges/ids)
// would require a slight change to the Badge type (background color)

interface User {
	_id: number
	name: string
	display_name: string
}

interface Emote {
	highestRes: number // added by me
	id: number
	name: string
	height: number
	width: number
	public: boolean
	hidden: boolean
	modifier: boolean
	offset: null
	margins: null
	css: null
	owner: User
	urls: Record<number, string>
	status: number
	usage_count: number
	created_at: string
	last_updated: string
}

interface Room {
	_id: number
	set: number
	twitch_id: number
	youtube_id: null
	id: string
	is_group: boolean
	display_name: string
	moderator_badge: null
	vip_badge: null
	mod_urls: null
	user_badges: unknown
	user_badge_ids: unknown
	css: null
}

interface EmoteSet {
	id: number
	title: string
	emoticons: Emote[]
}

const globalEmotes: Record<string, Emote> = {}
const channelEmotes = new Map<string, Record<string, Emote>>()
let globalEmoteRegex: RegExp
const emoteRegexes = new Map<string, RegExp>()

export const plugin: Plugin = {
	id: "frankerfacez",
	async init() {
		const response = await fetch("https://api.frankerfacez.com/v1/set/global", {
			method: "GET",
			responseType: ResponseType.JSON,
		})
		const data = response.data as {
			default_sets: number[]
			sets: Record<number, EmoteSet>
		}
		const emoteNames = [] as string[]
		for (const emote of data.default_sets.flatMap(set => data.sets[set].emoticons)) {
			emote.highestRes = Math.max(...Object.keys(emote.urls).map(Number))
			globalEmotes[emote.name] = emote
			emoteNames.push(emote.name)
		}
		globalEmoteRegex = buildRegex(emoteNames)
		console.log("Built regex", globalEmoteRegex, "for global", globalEmotes)
	},
	async channelId(channel, id) {
		if (channelEmotes.has(id)) return
		const response = await fetch(`https://api.frankerfacez.com/v1/room/id/${id}`, {
			method: "GET",
			responseType: ResponseType.JSON,
		})
		if (!response.ok) return
		const data = response.data as {
			room: Room
			sets: Record<number, EmoteSet>
		}
		const emoteMap: Record<string, Emote> = {}
		const emoteNames = [] as string[]
		for (const emote of data.sets[data.room.set].emoticons) {
			emote.highestRes = Math.max(...Object.keys(emote.urls).map(Number))
			emoteMap[emote.name] = emote
			emoteNames.push(emote.name)
		}
		const regex = buildRegex(emoteNames)
		console.log("Built regex", regex, "for", emoteMap)
		emoteRegexes.set(id, regex)
		channelEmotes.set(id, emoteMap)
	},
	message(message) {
		regexEmotes(
			message,
			globalEmoteRegex,
			code =>
				`https://cdn.frankerfacez.com/emote/${globalEmotes[code].id}/${globalEmotes[code].highestRes}`,
			() => "FFZ Global Emote"
		)
		const emotes = channelEmotes.get(message.channel_id)
		const regex = emoteRegexes.get(message.channel_id)
		if (emotes && regex)
			regexEmotes(
				message,
				regex,
				code => `https://cdn.frankerfacez.com/emote/${emotes[code].id}/${emotes[code].highestRes}`,
				() => "FFZ Channel Emote"
			)
	},
}