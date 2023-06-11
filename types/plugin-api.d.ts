import { AutocompleteRequest } from "./autocomplete"
import { RichTextPart } from "./text"

export interface Plugin {
	id: string
	// Called when the plugin is loaded
	init?: (context: PluginContext) => void | Promise<void>
	// Called when the plugin is unloaded
	destroy?: () => void | Promise<void>
	/**
	 * Called when a channel is joined
	 *
	 * NOTE: does not mean we are connected to it yet, just means that the user has added it to their channels list.
	 * Use `channelId(channel, id) {}` for a "connected" event.
	 */
	join?: (channel: string) => void | Promise<void>
	// Called when we find out the id of a channel (right after connecting)
	channelId?: (channel: string, id: string) => void | Promise<void>
	// Called when a channel is left
	leave?: (channel: string) => void
	// Add info to a message (badges, emotes). The `message` parameter is mutable.
	message?: (message: PrivMessage) => void
	// Autocomplete provider. Returns a list of suggestions for the given word.
	autocomplete?: (input: AutocompleteRequest) => string[]
	/// INTERNAL DEV NOTE: Don't forget to add new hooks to the pluginVerifier!

	// Settings for this plugin
	settings?: Settings
}

export interface PluginContext {
	setting<T>(name: string): T
	user: {
		/**
		 * @returns The username of the currently logged in user, or `undefined` if not logged in
		 */
		login(): string | undefined
	}
	visual: {
		/**
		 * @returns The channel that the user is currently looking at, or `undefined` if not looking at any channels.
		 */
		currentChannel(): string | undefined
		user: {
			addDecoration(username: string, ...part: RichTextPart[]): void
		}
	}
	utils: ChattiesPluginUtils
}

export type ChattiesPluginUtils = Readonly<{
	/**
	 * A regex that matches a list of words. Useful for matching a list of emotes, to then use in `regexEmotes`
	 * @param emotes The list of emotes to match
	 */
	buildRegex(emotes: string[]): RegExp
	/**
	 * Adds emotes to a message based on a regex
	 * @param message The message to add emotes to
	 * @param regex The regex to use to detect emotes
	 * @param emote The emote to add to the message, either an object with `info` and `url` properties, or a function that takes the emote code and returns an object with `info` and `url` properties
	 */
	regexEmotes(
		message: PrivMessage,
		regex: RegExp,
		emote:
			| {
					info: string
					url: string
			  }
			| ((code: string) => {
					info: string
					url: string
			  })
	): void
	/**
	 * @param word The word to autocomplete
	 * @param allOptions All possible options
	 * @returns A list of suggestions for the given word
	 */
	wordAutocomplete(word: string, allOptions: string[]): string[]
}>

export type Setting = {
	name: string
} & (
	| {
			type: "string"
			/** Automatic setting storage, `context.setting("do-things")` to get the current value */
			default: string
			/** Called when the setting is changed. */
			changed?: (value: string) => void
	  }
	| {
			type: "number"
			/** Automatic setting storage, `context.setting("do-things")` to get the current value */
			default: number
			/** Called when the setting is changed. */
			changed?: (value: number) => void
	  }
	| {
			type: "boolean"
			/** Automatic setting storage, `context.setting("do-things")` to get the current value */
			default: boolean
			/** Called when the setting is changed. */
			changed?: (value: boolean) => void
	  }
)

export type Settings = Record<string, Setting>
