<script lang="ts">
	import { currentChannel, sendMessage } from "$lib/api"

	let message = ""
	async function submit() {
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
