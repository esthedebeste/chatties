export type HexColor = `#${string}`
export interface TwitchUserBasics {
	id: string
	login: string
	name: string
}

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
	char_range: {
		start: number
		end: number
	}
	id?: string // native info from twitch
	/** @example "Twitch Subscriber Emote" */
	info: string
	url: string // extensions
}

export interface Message {
	channel_login: string
	channel_id: string
	message_text: string
	is_action: boolean
	sender: TwitchUserBasics
	badge_info: Badge[]
	badges: Badge[]
	bits: number | null
	name_color: {
		r: number
		g: number
		b: number
	}
	emotes: Emote[]
	message_id: string
	server_timestamp: string
	source: {
		tags: {
			color: HexColor
		}
	}
}
