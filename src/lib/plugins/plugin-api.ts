import * as zod from "zod"
import type { AutocompleteRequest } from "../autocomplete"
import type { Message } from "../types/message"

export type Nodes = ChildNode[]
export type Badges = {
	pre: ChildNode[]
	post: ChildNode[]
}

export interface Plugin {
	id: string
	// Called when the plugin is loaded
	init?: () => void | Promise<void>
	// Called when the plugin is unloaded
	destroy?: () => void | Promise<void>
	// Called when a channel is joined
	join?: (channel: string) => void | Promise<void>
	// Called when we find out the id of a channel (after joining, first message)
	channelId?: (channel: string, id: string) => void | Promise<void>
	// Called when a channel is left
	leave?: (channel: string) => void
	// Add info to a message (badges, emotes). The `message` parameter is mutable.
	message?: (message: Message) => void
	// Autocomplete provider. Returns a list of suggestions for the given word.
	autocomplete?: (input: AutocompleteRequest) => string[]
	// !Don't forget to add new hooks to the pluginVerifier!
}

export const pluginVerifier = zod
	.object({
		id: zod.string(),
		init: zod.function().optional(),
		destroy: zod.function().optional(),
		join: zod.function().optional(),
		channelId: zod.function().optional(),
		leave: zod.function().optional(),
		message: zod.function().args().optional(),
		autocomplete: zod.function().args().optional(),
	})
	.strict()
