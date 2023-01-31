import type { Message } from "../types/message"

export const buildRegex = (emotes: string[]) =>
	new RegExp(`(?<=^|\\s)(${emotes.join("|")})(?=$|\\s)`, "g")

export function regexEmotes(
	message: Message,
	regex: RegExp,
	resolveEmoteUrl: (match: string) => string,
	resolveInfo: (match: string) => string
) {
	const matches = message.message_text.matchAll(regex)
	if (!matches) return
	for (const { 0: code, index } of matches) {
		const url = resolveEmoteUrl(code)
		const info = resolveInfo(code)
		const start = index as number
		message.emotes.push({ code, char_range: { start, end: start + code.length }, info, url })
	}
}

type reType = typeof regexEmotes
declare global {
	const regexEmotes: reType
}

// read-only, useful for plugins
Object.defineProperty(window, "regexEmotes", { value: regexEmotes })
