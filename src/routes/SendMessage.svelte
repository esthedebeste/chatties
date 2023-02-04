<script lang="ts">
	import { currentChannel, sendMessage } from "$lib/api"
	import * as auto from "$lib/autocomplete"

	let message = ""
	async function submit() {
		sendMessage($currentChannel, message)
		message = ""
	}

	let previousAutos: string[] = []
	let previousAutoIndex = 0
	async function autocomplete(event: KeyboardEvent) {
		if (event.key !== "Tab") return
		event.preventDefault()
		const split = message.trimEnd().split(" ")
		const lastWord = split[split.length - 1]
		if (!lastWord) return
		if (lastWord === previousAutos[previousAutoIndex]) {
			console.log("Continuing autocomplete")
			previousAutoIndex = (previousAutoIndex + 1) % previousAutos.length
			split[split.length - 1] = previousAutos[previousAutoIndex]
		} else {
			const autos = auto.autocomplete(lastWord)
			if (autos.length === 0) return
			autos.sort()
			console.log("Autocomplete results:", autos)
			split[split.length - 1] = autos[0]
			previousAutos = autos
			previousAutoIndex = 0
		}
		message = split.join(" ") + " "
	}
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
