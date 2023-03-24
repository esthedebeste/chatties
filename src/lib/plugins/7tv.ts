import { fetch, ResponseType } from "@tauri-apps/api/http"
import type { Plugin } from "./plugin-api"
import { buildRegex, regexEmotes, wordAutocomplete } from "./shared"

// todo: badges and maybe paints?

interface Emote {
	id: string
	/** Added by chatties based on .data.host.files */
	chattiesUrl: string
	name: string
	flags: number
	timestamp: number
	actor_id: null
	data: {
		id: string
		name: string
		flags: number
		lifecycle: number
		state: ["LISTED"]
		listed: boolean
		animated: boolean
		owner: {
			id: string
			username: string
			display_name: string
			avatar_url: string
			style: unknown // todo
			roles: [string]
		}
		host: {
			url: `//cdn.7tv.app/emote/${string}`
			files: {
				name: string
				static_name: string
				width: number
				height: number
				frame_count?: number
				size: number
				format: string
			}[]
		}
	}
}

interface EmoteSet {
	id: string
	name: string
	flags: number
	tags: string[]
	immutable: boolean
	privileged: boolean
	emotes: Emote[]
}

interface UserInfo {
	id: string
	platform: "TWITCH"
	username: string
	display_name: string
	linked_at: number
	emote_capacity: number
	emote_set_id: null
	emote_set: EmoteSet
	user: {
		id: string
		username: string
		display_name: string
		created_at: number
		avatar_url: string
		biography: string
		style: {
			color: number
		}
		editors: {
			id: string
			permissions: number
			visible: boolean
			added_at: number
		}[]
		roles: string[]
		connections: {
			id: string
			platform: string
			username: string
			display_name: string
			linked_at: number
		}[]
	}
}

const globalEmotes = new Map<string, Emote>()
const channelEmotes = new Map<string, Map<string, Emote>>()
let globalEmoteRegex: RegExp
const emoteRegexes = new Map<string, RegExp>()
export const plugin: Plugin = {
	id: "7tv",
	async init() {
		const response = await fetch("https://7tv.io/v3/emote-sets/global", {
			method: "GET",
			responseType: ResponseType.JSON,
		})
		if (!response.ok) {
			console.error("Failed to get 7tv global emotes", response.data)
			return
		}
		const data = response.data as EmoteSet
		for (const emote of data.emotes) {
			globalEmotes.set(emote.name, emote)
		}
		globalEmoteRegex = buildRegex([...globalEmotes.keys()])
		console.debug("Built regex", globalEmoteRegex, "for global", globalEmotes)
	},
	async channelId(channel, id) {
		const response = await fetch(`https://7tv.io/v3/users/twitch/${id}`, {
			method: "GET",
			responseType: ResponseType.JSON,
		})
		if (!response.ok) {
			console.error("Failed to get 7tv emotes for channel", channel, id, "data:", response.data)
			return
		}
		const data = response.data as UserInfo
		const emotes = new Map<string, Emote>()
		for (const emote of data.emote_set.emotes) {
			emote.data.host.files.sort((a, b) => b.size - a.size) // sort by size, descending
			const webp = emote.data.host.files.find(f => f.format.toUpperCase() === "WEBP")
			if (!webp) {
				console.error("No webp found for emote", emote, "in channel", channel, id)
				continue
			}
			emote.chattiesUrl = `https:${emote.data.host.url}/${webp.name}`
			emotes.set(emote.name, emote)
		}
		const regex = buildRegex([...emotes.keys()])
		console.debug("Built regex", regex, "for", emotes)
		emoteRegexes.set(id, regex)
		channelEmotes.set(id, emotes)
	},
	message(message) {
		regexEmotes(message, globalEmoteRegex, code => ({
			url: globalEmotes.get(code)?.chattiesUrl ?? "",
			info: "7tv Global Emote",
		}))
		const emotes = channelEmotes.get(message.channel.id)
		const regex = emoteRegexes.get(message.channel.id)
		if (emotes && regex)
			regexEmotes(message, regex, code => ({
				url: emotes.get(code)?.chattiesUrl ?? "",
				info: "7tv Channel Emote",
			}))
	},
	autocomplete({ word, channelId }) {
		return wordAutocomplete(word, [
			...Object.keys(globalEmotes),
			...(channelEmotes.get(channelId)?.keys() ?? []),
		])
	},
}
