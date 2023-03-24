import type { Emote, PrivMessage } from "../types/message"

export function buildRegex(emotes: string[]) {
	return new RegExp(`(?<=^|\\s)(${emotes.join("|")})(?=$|\\s)`, "g")
}

type FunctionOrValue<T> = T | ((match: string) => T)

type CertainRequired<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>

export function regexEmotes(
	message: PrivMessage,
	regex: RegExp,
	emote_: FunctionOrValue<CertainRequired<Emote, "info" | "url">>
) {
	const emote = typeof emote_ === "function" ? emote_ : () => emote_
	const matches = message.message_text.matchAll(regex)
	if (!matches) return
	for (const { 0: code, index } of matches) {
		const start = index as number
		message.emotes.push(
			Object.assign({ code, char_range: { start, end: start + code.length } }, emote(code))
		)
	}
}

export function wordAutocomplete(word: string, words: string[]) {
	return words.filter(w => w.toLowerCase().startsWith(word.toLowerCase()))
}

type brType = typeof buildRegex
type reType = typeof regexEmotes
type waType = typeof wordAutocomplete
declare global {
	const buildRegex: brType
	const regexEmotes: reType
	const wordAutocomplete: waType
}

// read-only, useful for plugins
Object.defineProperty(window, "buildRegex", { value: buildRegex })
Object.defineProperty(window, "regexEmotes", { value: regexEmotes })
Object.defineProperty(window, "wordAutocomplete", { value: wordAutocomplete })
