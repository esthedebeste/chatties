import type { Plugin } from "./plugin-api"
import { fetch, ResponseType } from "@tauri-apps/api/http"
import { buildRegex, regexEmotes } from "./regex-based"

interface Emote {
	id: string
	code: string
	imageType: string
	animated: boolean
	userId: string
	type: "Global" | "Channel" | "Shared"
}

interface User {
	id: string
	avatar: string
	bots: []
	channelEmotes: Emote[]
	sharedEmotes: Emote[]
}

const globalEmotes: Record<string, Emote> = {}
const channelEmotes = new Map<string, Record<string, Emote>>()
let globalEmoteRegex: RegExp
const emoteRegexes = new Map<string, RegExp>()
export const plugin: Plugin = {
	id: "betterttv",
	async init() {
		const response = await fetch("https://api.betterttv.net/3/cached/emotes/global", {
			method: "GET",
			responseType: ResponseType.JSON,
		})
		const data = response.data as Emote[]
		const emoteNames = [] as string[]
		for (const emote of data) {
			emote.type = "Global"
			globalEmotes[emote.code] = emote
			emoteNames.push(emote.code)
		}
		globalEmoteRegex = buildRegex(emoteNames)
		console.log("Built regex", globalEmoteRegex, "for global", globalEmotes)
	},
	async channelId(channel, id) {
		if (channelEmotes.has(id)) return
		const response = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${id}`)
		if (!response.ok) return
		const data = response.data as User
		const emoteMap: Record<string, Emote> = {}
		const emoteNames = [] as string[]
		for (const emote of data.channelEmotes) {
			emote.type = "Channel"
			emoteMap[emote.code] = emote
			emoteNames.push(emote.code)
		}
		for (const emote of data.sharedEmotes) {
			emote.type = "Shared"
			emoteMap[emote.code] = emote
			emoteNames.push(emote.code)
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
			code => `https://cdn.betterttv.net/emote/${globalEmotes[code].id}/3x`,
			() => "BTTV Global Emote"
		)
		const emotes = channelEmotes.get(message.channel_id)
		const regex = emoteRegexes.get(message.channel_id)
		if (emotes && regex)
			regexEmotes(
				message,
				regex,
				code => `https://cdn.betterttv.net/emote/${emotes[code].id}/3x`,
				code => `BTTV ${emotes[code].type} Emote`
			)
	},
}
