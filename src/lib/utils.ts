import type { CharRange, HexColor } from "./api"

export function extendMessage<T extends { char_range: CharRange }>(
	text: string,
	replacements: T[]
): (T | string)[] {
	replacements.sort((a, b) => a.char_range.start - b.char_range.start)
	// remove overlapping replacements
	for (let index = replacements.length - 1; index > 0; index--)
		if (replacements[index].char_range.start < replacements[index - 1].char_range.end)
			replacements.splice(index, 1)

	const parts = [] as (T | string)[]
	let lastEnd = 0
	for (const replacement of replacements) {
		const { start, end } = replacement.char_range
		if (start > lastEnd) parts.push(text.slice(lastEnd, start))
		parts.push(replacement)
		lastEnd = end
	}
	if (lastEnd < text.length) parts.push(text.slice(lastEnd))
	return parts.filter(x => x !== "" && x !== " ")
}

export function randomHex(): HexColor {
	const rgb = [Math.random(), Math.random(), Math.random()]
	const max = Math.max(...rgb)
	return `#${rgb
		.map(x =>
			Math.round((x / max) * 255)
				.toString(16)
				.padStart(2, "0")
		)
		.join("")}`
}
