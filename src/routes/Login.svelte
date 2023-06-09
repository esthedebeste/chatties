<script lang="civet" context="module">
	import * as zod from "zod"
	schema := zod.object
		access_token: zod.string(),
		scope: zod.string(),
		token_type: zod.string(),
		client_id: zod.string()
</script>

<script lang="civet">
	{ invoke, logIn, logOut } from $lib/api/index.civet
	{ credentials } from $lib/api/credentials.civet
	async function login()
		await invoke "open_login"
		token := prompt "Enter your login token (check your browser)"
		if !token then throw new Error "No login token provided"
		info := schema.parse JSON.parse token
		await logIn info.client_id, info.access_token

</script>

<div class="root">
	<div class="logged-in-as">
		{#if $credentials !== undefined}
			<span class="light">Logged in as </span>
			<div>{$credentials.login}</div>
		{:else}
			Not logged in
		{/if}
	</div>
	<button on:click={login}>
		{#if $credentials === undefined}
			Log In
		{:else}
			Relog
		{/if}
	</button>
	{#if $credentials !== undefined}
		<button on:click={logOut}>Log Out</button>
	{/if}
</div>

<style>
	.light {
		color: #aaa;
	}

	.logged-in-as {
		grid-area: logged-in-as;
	}

	.root {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-template: "logged-in-as logged-in-as" "login relog";
	}
</style>
