// generated source file! please do not manually edit.
export declare interface Credentials {
	login: string
	token: string | null
	client_id: string | null
}
export declare interface Join {
	channel: string
	user: string
}
export declare interface Part {
	channel: string
	user: string
}
export declare interface Names {
	channel: string
	names: (string)[]
}
export declare interface TwitchUserBasics {
	id: string
	login: string
	name: string
}
export declare interface TwitchChannelBasics {
	login: string
	id: string
}
export declare interface Badge {
	name: string
	version: string
}
export declare interface CharRange {
	start: number
	end: number
}
export declare interface Emote {
	id: string
	char_range: CharRange
	code: string
}
export type HexColor = `#${string}`
export declare interface PrivMsg {
	channel: TwitchChannelBasics
	message_text: string
	sender: TwitchUserBasics
	badges: (Badge)[]
	bits: u64 | null
	name_hex: HexColor | null
	emotes: (Emote)[]
	message_id: string
	server_timestamp_str: string
}
export declare function invoke(id: 'get_credentials'): Promise<Credentials>
export declare function invoke(id: 'join_channel', arguments: {channel: string}): Promise<void>
export declare function invoke(id: 'leave_channel', arguments: {channel: string}): Promise<void>
export declare function invoke(id: 'log_in', arguments: {login: string, token: string, clientId: string}): Promise<void>
export declare function invoke(id: 'log_out'): Promise<void>
export declare function invoke(id: 'send_message', arguments: {message: string, channel: string}): Promise<void>
export declare function invoke(id: 'open_login'): Promise<void>
export declare function invoke(id: 'open_plugin_dir'): Promise<void>
export declare function invoke(id: 'get_plugins'): Promise<(string)[]>
