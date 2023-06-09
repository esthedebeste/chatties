<script lang="civet">
	{ currentChannel, sendMessage } from $lib/api/index.civet
	* as auto from $lib/autocomplete.civet

	message .= ""
	async function submit()
		sendMessage $currentChannel, message
		message = ""

	previousAutos: string[] .= []
	previousAutoIndex .= 0
	function autocomplete(event: KeyboardEvent)
		if event.ctrlKey && event.code.startsWith "Arrow"
			event.stopPropagation() // don't move channels around, assume intention is to move cursor
			return
		return unless event.key === "Tab"
		event.preventDefault()
		split := message.trimEnd().split " "
		lastWord := split.at -1
		return unless lastWord
		if lastWord === previousAutos[previousAutoIndex]
			console.log "Continuing autocomplete"
			previousAutoIndex = (previousAutoIndex + 1) % previousAutos.length
			split[split.length - 1] = previousAutos[previousAutoIndex]
		else
			autos := auto.autocomplete lastWord
			return if autos.length === 0
			autos.sort()
			console.log "Autocomplete results:", autos
			split[split.length - 1] = autos[0]
			previousAutos = autos
			previousAutoIndex = 0

		message = split.join(" ") + " "
</script>

<form on:submit|preventDefault={submit}>
	<input
		placeholder="Send a message in #{$currentChannel}..."
		bind:value={message}
		on:keydown={autocomplete}
	/>
	<button type="submit">Send</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	input {
		flex: 1;
		background-color: #181818;
		color: #fff;
	}
	input:hover {
		background-color: #1c1c1c;
	}
	input:focus {
		outline: none;
		background-color: #222;
	}
	button {
		border-radius: 0;
	}
	form:has(input:hover) button {
		background-color: #1c1c1c;
	}
	form:has(input:focus) button {
		background-color: #222;
	}
</style>
