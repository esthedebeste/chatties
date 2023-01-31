<script lang="ts">
	import EmoteTooltip from "$lib/EmoteTooltip.svelte"
	import Channels from "./Channels.svelte"
	import JoinChannel from "./JoinChannel.svelte"
	import Messages from "./Messages.svelte"
	import SendMessage from "./SendMessage.svelte"
</script>

<main>
	<Channels />
	<JoinChannel />
	<Messages />
	<SendMessage />

	<EmoteTooltip />
</main>

<style>
	main {
		height: 100%;
		display: flex;
		flex: 1;
		flex-direction: column;
		overflow-y: auto;
	}
</style>
