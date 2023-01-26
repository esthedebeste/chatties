import type { HexColor } from "./types/priv-msg";
import rfdc from "rfdc";

interface CharRange {
	start: number;
	end: number;
}
export function extendMessage<T extends { char_range: CharRange }>(
	text: string,
	replacements: T[]
): (T | string)[] {
	replacements.sort((a, b) => a.char_range.start - b.char_range.start);
	// remove overlapping replacements
	for (let i = replacements.length - 1; i > 0; i--)
		if (replacements[i].char_range.start < replacements[i - 1].char_range.end)
			replacements.splice(i, 1);

	const parts = [] as (T | string)[];
	let lastEnd = 0;
	for (const replacement of replacements) {
		const { start, end } = replacement.char_range;
		if (start > lastEnd) parts.push(text.slice(lastEnd, start));
		parts.push(replacement);
		lastEnd = end;
	}
	if (lastEnd < text.length) parts.push(text.slice(lastEnd));
	return parts.filter(x => x !== "" && x !== " ");
}

export const clone = rfdc();

export const randomHex = (): HexColor => {
	const rgb = [Math.random(), Math.random(), Math.random()];
	const max = Math.max(...rgb);
	return `#${rgb
		.map(x =>
			Math.round((x / max) * 255)
				.toString(16)
				.padStart(2, "0")
		)
		.join("")}`;
};
