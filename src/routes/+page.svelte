<script lang="ts">
	import { setContext } from "svelte"
	import Channels from "./Channels.svelte"
	import EmoteTooltip from "$lib/EmoteTooltip.svelte"
	import JoinChannel from "./JoinChannel.svelte"
	import SendMessage from "./SendMessage.svelte"
	import { writable } from "svelte/store"
	import Login from "./Login.svelte"
	import Messages from "./Messages.svelte"

	let currentChannel = writable<string>(localStorage.getItem("currentChannel") || "")
	$: localStorage.setItem("currentChannel", $currentChannel)
	setContext("currentChannel", currentChannel)
</script>

<main>
	<nav>
		<div>
			<h1>Chatties :3</h1>
			<i>
				#1 goat-only twitch chat client, experts say <small>
					({import.meta.env.VITE_APP_VERSION})
				</small>
			</i>
		</div>
		<Login />
	</nav>
	<JoinChannel />

	<Channels />
	<Messages />
	<SendMessage />

	<EmoteTooltip />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	nav {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 0.5ch;
		border-bottom: 1px solid #777;
	}
	h1 {
		display: inline;
	}
	i {
		display: block;
	}
</style>
