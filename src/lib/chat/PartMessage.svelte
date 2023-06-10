<script lang="civet">
	type { PartMessage } from $types/message
	SystemMessage from ./SystemMessage.svelte

	export let message: PartMessage
</script>

<SystemMessage date={message.timestamp}>{message.users.join(", ")} left</SystemMessage>
