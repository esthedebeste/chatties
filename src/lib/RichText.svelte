<script lang="civet">
	type { RichTextPart } from $types/text
	Emote from ./chat/Emote.svelte

	export let parts: RichTextPart[]
</script>

{#each parts as part (part)}{#if typeof part === "string"}{part}{:else if part.type === "emote"}<Emote
			source={part.url}
			name={part.code}
			extra={part.info}
		/>{:else if part.type === "styled-text"}<span style={part.css}>{part.text}</span>{/if}{/each}