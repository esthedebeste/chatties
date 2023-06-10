<script lang="civet">
	{ extendMessage } from $lib/utils.civet
	type { PrivMessage } from $types/message
	Badge from ./Badge.svelte
	Time from ./Time.svelte
	Username from ./Username.svelte
	RichText from ../RichText.svelte
	export let message: PrivMessage
	$: parts = extendMessage message.message_text, message.replacements
</script>

<Time date={message.timestamp} />
<Username color={message.name_hex} login={message.sender.login} name={message.sender.name}>
	<svelte:fragment slot="prefix">
		<span>
			{#each message.badges as badge (badge)}
				<Badge source={badge.url} name={badge.title} extra={badge.info} />
				{" "}
			{/each}
		</span>
	</svelte:fragment>
	<svelte:fragment slot="postfix">:</svelte:fragment>
</Username>

<RichText {parts} />