<script lang="ts">
	import { extendMessage } from "$lib/utils"
	import type { PrivMessage } from "../types/message"
	import Badge from "./Badge.svelte"
	import Emote from "./Emote.svelte"
	import Time from "./Time.svelte"
	import Username from "./Username.svelte"

	export let message: PrivMessage
	$: parts = extendMessage(message.message_text, message.emotes)
</script>

<Time date={message.timestamp} />
<Username color={message.name_hex} login={message.sender.login} name={message.sender.name}>
	<svelte:fragment slot="prefix">
		<span>
			{#each message.badges as badge}
				<Badge source={badge.url} name={badge.title} extra={badge.info} />
				{" "}
			{/each}
		</span>
	</svelte:fragment>
	<svelte:fragment slot="postfix">:</svelte:fragment>
</Username>

{#each parts as part}{#if typeof part === "string"}{part}{:else}<Emote
			source={part.url}
			name={part.code}
			extra={part.info}
		/>{/if}{/each}
