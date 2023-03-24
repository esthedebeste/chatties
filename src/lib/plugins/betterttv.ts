import { fetch, ResponseType } from "@tauri-apps/api/http"
import type { Plugin } from "./plugin-api"
import { buildRegex, regexEmotes, wordAutocomplete } from "./shared"

interface Emote {
	id: string
	code: string
	imageType: string
	animated: boolean
	userId: string
	type?: "Channel" | "Shared"
}

interface User {
	id: string
	avatar: string
	bots: []
	channelEmotes: Emote[]
	sharedEmotes: Emote[]
}

const globalEmotes = new Map<string, Emote>()
const channelEmotes = new Map<string, Map<string, Emote>>()
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
		for (const emote of data) {
			globalEmotes.set(emote.code, emote)
		}
		globalEmoteRegex = buildRegex([...globalEmotes.keys()])
		console.debug("Built regex", globalEmoteRegex, "for global", globalEmotes)
	},
	async channelId(channel, id) {
		const response = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${id}`)
		if (!response.ok) return
		const data = response.data as User
		const emotes = new Map<string, Emote>()
		for (const emote of data.channelEmotes) {
			emote.type = "Channel"
			emotes.set(emote.code, emote)
		}
		for (const emote of data.sharedEmotes) {
			emote.type = "Shared"
			emotes.set(emote.code, emote)
		}
		const regex = buildRegex([...emotes.keys()])
		console.debug("Built regex", regex, "for", emotes)
		emoteRegexes.set(id, regex)
		channelEmotes.set(id, emotes)
	},
	message(message) {
		regexEmotes(message, globalEmoteRegex, code => ({
			url: `https://cdn.betterttv.net/emote/${globalEmotes.get(code)?.id}/3x`,
			info: `BTTV Global Emote`,
		}))
		const emotes = channelEmotes.get(message.channel.id)
		const regex = emoteRegexes.get(message.channel.id)
		if (emotes && regex)
			regexEmotes(message, regex, code => ({
				url: `https://cdn.betterttv.net/emote/${emotes.get(code)?.id}/3x`,
				info: `BTTV ${emotes.get(code)?.type} Emote`,
			}))
	},
	autocomplete({ word, channelId }) {
		return wordAutocomplete(word, [
			...Object.keys(globalEmotes),
			...(channelEmotes.get(channelId)?.keys() ?? []),
		])
	},
}
