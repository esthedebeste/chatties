<script lang="civet">
	type { JoinMessage } from $types/message
	SystemMessage from ./SystemMessage.svelte

	export let message: JoinMessage
</script>

<SystemMessage date={message.timestamp}>{message.users.join(", ")} joined</SystemMessage>
