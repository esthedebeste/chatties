<script lang="ts">
	import { joinChannel } from "$lib/api"

	let channel = ""
	async function submit() {
		await joinChannel(channel)
		channel = "" // clear the input
	}
</script>

<form on:submit|preventDefault={submit}>
	<label>
		<span>Join a channel</span>
		<input
			required
			minlength="4"
			maxlength="25"
			bind:value={channel}
			placeholder="Channel name"
		/></label
	><button type="submit">Join</button>
</form>

<style>
	label span {
		display: inline-block;
		vertical-align: middle;
	}
	input {
		background-color: #181818;
		color: #fff;
		border: 1px solid #444;
		border-radius: 0;
		padding: 0.25em;
		height: 100%;
		min-width: 10ch;
		max-width: 25ch;
	}

	button {
		border-radius: 0;
		height: 100%;
	}

	input:focus {
		outline: none;
		background-color: #222;
	}

	form {
		padding-left: 0.5ch;
		border: 1px solid #777;
	}
</style>
