<script lang="ts">
	import Emote from "./Emote.svelte";

	export let src: string;
	export let name: string;
	export let extra: string;
</script>

<Emote {src} {name} {extra} height="1em" width="1em" verticalAlign="baseline" />
