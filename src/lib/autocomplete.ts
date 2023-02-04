import { get } from "svelte/store"
import { channelIds, currentChannel } from "./api"
import * as plugins from "./plugins"

export interface AutocompleteRequest {
	// The word that is being autocompleted
	word: string
	// The channel that the word is being autocompleted in
	channel: string
	channelId: string
}

export function autocomplete(word: string): string[] {
	const channel = get(currentChannel)
	const channelId = channelIds.get(channel)
	if (!channelId) return []
	return plugins.autocomplete({ word, channel, channelId })
}
