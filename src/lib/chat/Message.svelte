<script lang="ts">
	import Time from "./Time.svelte"
	import Badge from "./Badge.svelte"
	import Emote from "./Emote.svelte"
	import Username from "./Username.svelte"
	import type { Message } from "$lib/types/message"
	import { extendMessage } from "$lib/utils"

	export let message: Message
	$: date = new Date(message.server_timestamp)
	$: parts = extendMessage(message.message_text, message.emotes)
</script>

<Time {date} />
<Username login={message.sender.login} name={message.sender.name}>
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
