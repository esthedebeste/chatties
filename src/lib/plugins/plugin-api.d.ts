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
	destroy?: () => void
	// Called when a channel is joined
	join?: (channel: string) => void
	// Called when we find out the id of a channel (after joining, first message)
	channelId?: (channel: string, id: string) => void | Promise<void>
	// Called when a channel is left
	leave?: (channel: string) => void
	// Add info to a message (badges, emotes). The `msg` object is mutable.
	message?: (message: Message) => void
}
