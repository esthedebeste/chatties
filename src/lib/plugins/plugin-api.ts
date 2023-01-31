import * as zod from "zod"
import type { Message } from "../types/message"
import "./regex-based" // Get the regexEmotes function into the global scope

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
	})
	.strict()
