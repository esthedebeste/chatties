<script lang="ts">
	import { joinChannel } from "$lib/api"

	let channel = ""
	const submit = async () => {
		await joinChannel(channel)
		channel = "" // clear the input
	}
</script>

<h2>Join a channel</h2>
<form on:submit|preventDefault={submit}>
	<input required minlength="4" maxlength="25" bind:value={channel} placeholder="Channel name" />
	<button type="submit">Join</button>
</form>

<style>
	input {
		min-width: 10ch;
		max-width: 25ch;
	}
	form {
		margin-bottom: 0.7em;
	}
</style>
