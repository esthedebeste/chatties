<script lang="ts">
	import { joinChannel, joinedChannels } from "$lib/api"

	let channel = ""
	async function submit() {
		await joinChannel(channel)
		channel = "" // clear the input
	}
</script>

<form on:submit|preventDefault={submit}>
	<input
		required
		minlength="3"
		maxlength="25"
		bind:value={channel}
		placeholder="Add a{$joinedChannels.length > 0 ? 'nother' : ''} channel..."
	/><button type="submit">Join</button>
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
