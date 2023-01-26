<script lang="ts">
	import Time from "./Time.svelte";
	import Badge from "./Badge.svelte";
	import Emote from "./Emote.svelte";
	import Username from "./Username.svelte";
	import { privMsg } from "$lib/plugins";
	import type { PrivMsg } from "$lib/types/priv-msg";
	import { extendMessage } from "$lib/utils";

	export let msg: PrivMsg;
	$: privMsg(msg);
	$: date = new Date(msg.server_timestamp);
	$: parts = extendMessage(msg.message_text, msg.emotes);
</script>

<Time {date} />
<Username login={msg.sender.login} name={msg.sender.name}>
	<svelte:fragment slot="prefix">
		<span>
			{#each msg.badges as badge}
				<Badge src={badge.url} name={badge.title} extra={badge.info} />
				{" "}
			{/each}
		</span>
	</svelte:fragment>
	<svelte:fragment slot="postfix">:</svelte:fragment>
</Username>

{#each parts as part}{#if typeof part === "string"}{part}{:else}<Emote
			src={part.url}
			name={part.code}
			extra={part.info}
		/>{/if}{/each}

<style>
</style>
