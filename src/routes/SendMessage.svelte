<script lang="ts">
	import { getContext } from "svelte"
	import type { Writable } from "svelte/store"
	import { sendMessage } from "$lib/api"

	let currentChannel = getContext<Writable<string>>("currentChannel")
	let message = ""
	const submit = async () => {
		sendMessage($currentChannel, message)
		message = ""
	}
</script>

<form on:submit|preventDefault={submit}>
	<input placeholder="Send a message in #{$currentChannel}..." bind:value={message} />
	<button type="submit">Send</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1ch;
	}
	input {
		flex: 1;
	}
</style>
