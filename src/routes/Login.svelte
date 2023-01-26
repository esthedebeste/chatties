<script lang="ts" context="module">
	import * as zod from "zod";
	const schema = zod.object({
		access_token: zod.string(),
		scope: zod.string(),
		token_type: zod.string(),
		client_id: zod.string(),
	});
</script>

<script lang="ts">
	import { logIn, logOut, credentials } from "$lib/api";
	let opened = false;
	const open = () => {
		opened = true;
		window.open("http://chatties-auth.esthe.live/");
	};
	const login = async () => {
		opened = false;
		const str = prompt(
			"Enter your login token (https://chatties-auth.esthe.live/)"
		);
		if (!str) throw new Error("No login token provided");
		const info = schema.parse(JSON.parse(str));
		await logIn(info.client_id, info.access_token);
	};
	const logout = () => logOut();
</script>

<div>
	{#if credentials.client_id}
		Logged in as {credentials.creds.credentials.login}
	{:else}
		Not logged in
	{/if}
	<div>
		<button on:click={opened ? login : open}
			>{#if !credentials.client_id}
				Log In
			{:else}
				Relog
			{/if}</button
		>
		{#if credentials.client_id}
			<button on:click={logout}>Log Out</button>
		{/if}
	</div>
</div>
