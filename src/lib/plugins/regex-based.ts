export const buildRegex = (emotes: string[]) =>
	new RegExp(`(?<=^|\\s)(${emotes.join("|")})(?=$|\\s)`, "g");
