<script lang="ts">
	import type { JoinMessage } from "../types/message"
	import SystemMessage from "./SystemMessage.svelte"

	export let message: JoinMessage
</script>

<SystemMessage date={message.timestamp}>{message.users.join(", ")} joined</SystemMessage>
