<script lang="civet">
	{ lastSeenColors, decorations as decor, type HexColor } from $lib/api/index.civet
	{ onDestroy } from svelte
	{ writable, get } from svelte/store
	{ randomHex } from ../utils.civet
	RichText from ../RichText.svelte
	type { Part } from ../types/text.civet

	export let login: string
	export name .= login
	export important .= false
	export color: HexColor | null | undefined .= undefined
	decorations: Part[] .= []
	$: if !color
			if !get(lastSeenColors).has login
				lastSeenColors.update (colors) =>
					colors.set login, randomHex()
					colors

			// only live update if the username is important (channel name)
			if important
				onDestroy lastSeenColors.subscribe (colors) =>
					color = colors.get(login) as HexColor
			else
				color = get(lastSeenColors).get(login) as HexColor
	$: do
		if important and !decor.has login
			decor.set login, writable []
		store := decor.get login
		if important
			onDestroy store.subscribe (parts) =>
				decorations = parts;
		else
			if store then decorations = get store
</script>

<span style:color><slot name="prefix" />{name}{#if decorations.length > 0}{" "}<RichText parts={decorations}/>{/if}<slot name="postfix" /></span>

<style>
	span {
		font-weight: 400;
	}
</style>
