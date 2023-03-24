import type { CharRange, PrivMsg as RPrivMessage } from "../api"

export interface Badge {
	name: string
	title: string
	version?: string // native info from twitch
	url: string
	/** @example "Twitch Badge\nChannel Moderator" */
	info: string
}

export interface Emote {
	/** @example "LUL" */
	code: string
	char_range: CharRange
	id?: string // native info from twitch
	/** @example "Twitch Subscriber Emote" */
	info: string
	url: string // extensions
}

export type PrivMessage = RPrivMessage & {
	type: "privmsg"
	timestamp: Date
	badges: Badge[]
	emotes: Emote[]
}

export interface JoinMessage {
	type: "join"
	channel: string
	users: string[]
	timestamp: Date
}

export interface PartMessage {
	type: "part"
	channel: string
	users: string[]
	timestamp: Date
}

export type Message = PrivMessage | JoinMessage | PartMessage
