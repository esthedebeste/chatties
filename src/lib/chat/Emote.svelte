<script lang="ts">
	import { tooltip } from "$lib/EmoteTooltip.svelte";

	export let src: string;
	export let name: string;
	export let extra: string;
	export let height: string | undefined = undefined;
	export let width: string | undefined = undefined;
	export let verticalAlign: string | undefined = undefined;
	let img: HTMLImageElement;
	const hover = () => {
		if (!img) return;
		const rect = img.getBoundingClientRect();
		tooltip.set({
			text: name + "\n" + extra,
			x: rect.left + rect.width / 2,
			y: rect.bottom + rect.height / 2,
		});
	};
	const unhover = () => tooltip.set(null);
</script>

<img
	{src}
	alt={name}
	style:height
	style:width
	style:vertical-align={verticalAlign}
	bind:this={img}
	on:pointerover={hover}
	on:pointerout={unhover}
/>

<style>
	img {
		height: 2em;
		vertical-align: middle;
	}
</style>
