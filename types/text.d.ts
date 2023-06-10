export interface Emote {
	type: "emote"
	/** @example "LUL" */
	code: string
	/** @example "Twitch Subscriber Emote" */
	info: string
	url: string
}
export interface StyledText {
	type: "styled-text"
	text: string
	css: string
}
export type RichTextPart = Emote | StyledText | string
