<script lang="ts" context="module">
	import * as zod from "zod"
	const schema = zod.object({
		access_token: zod.string(),
		scope: zod.string(),
		token_type: zod.string(),
		client_id: zod.string(),
	})
</script>

<script lang="ts">
	import { logIn, logOut } from "$lib/api"
	import { credentials } from "$lib/api/credentials"
	import * as tauri from "@tauri-apps/api/tauri"
	const login = async () => {
		await tauri.invoke("open_login")
		const token = prompt("Enter your login token (check your browser)")
		if (!token) throw new Error("No login token provided")
		const info = schema.parse(JSON.parse(token))
		await logIn(info.client_id, info.access_token)
	}
	const logout = () => logOut()
</script>

<div>
	{#if $credentials !== undefined}
		Logged in as {$credentials.creds.credentials.login}
	{:else}
		Not logged in
	{/if}
	<div>
		<button on:click={login}>
			{#if $credentials === undefined}
				Log In
			{:else}
				Relog
			{/if}
		</button>
		{#if $credentials !== undefined}
			<button on:click={logout}>Log Out</button>
		{/if}
	</div>
</div>
