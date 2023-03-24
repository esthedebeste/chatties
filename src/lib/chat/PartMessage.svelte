<script lang="ts">
	import type { PartMessage } from "../types/message"
	import SystemMessage from "./SystemMessage.svelte"

	export let message: PartMessage
</script>

<SystemMessage date={message.timestamp}>{message.users.join(", ")} left</SystemMessage>
