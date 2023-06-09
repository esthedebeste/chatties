<script lang="civet">
	type { Part } from ../types/text.civet
	Emote from ./chat/Emote.svelte

	export let parts: Part[]
</script>

{#each parts as part}{#if typeof part === "string"}{part}{:else if part.type === "emote"}<Emote
			source={part.url}
			name={part.code}
			extra={part.info}
		/>{:else if part.type === "styled-text"}<span style={part.css}>{part.text}</span>{/if}{/each}