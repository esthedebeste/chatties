export interface AutocompleteRequest {
	/** The word that is being autocompleted */
	word: string
	/** The channel that the word is being autocompleted in */
	channel: string
	channelId: string
}
