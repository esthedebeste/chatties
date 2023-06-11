import type { RichTextPart } from "./text"
import type { CharRange, Emote as REmote, PrivMsg as RPrivMessage } from "./twitch"

export interface Badge {
	name: string
	title: string
	url: string
	/** @example "Twitch Badge\nChannel Moderator" */
	info: string
	/** Native info from twitch. */
	version?: string
}

export type Replacement = RichTextPart & { char_range: CharRange }

export type PrivMessage = RPrivMessage & {
	/** native twitch emotes! Do NOT edit this to add your own emotes!! */
	readonly emotes: REmote[]
	type: "privmsg"
	timestamp: Date
	badges: Badge[]
	replacements: Replacement[]
}

export interface JoinMessage {
	type: "join"
	channel: string
	users: string[]
	timestamp: Date
	message_id: string
}
export interface PartMessage {
	type: "part"
	channel: string
	users: string[]
	timestamp: Date
	message_id: string
}
export type Message = PrivMessage | JoinMessage | PartMessage
