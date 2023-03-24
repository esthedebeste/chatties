<script lang="ts">
	import { lastSeenColors, type HexColor } from "$lib/api"
	import { onDestroy } from "svelte"
	import { get } from "svelte/store"
	import { randomHex } from "../utils"

	export let login: string
	export let name = login
	export let important = false
	export let color: HexColor | null | undefined = undefined
	$: {
		if (!color) {
			if (!get(lastSeenColors).has(login))
				lastSeenColors.update(colors => {
					colors.set(login, randomHex())
					return colors
				})
			// only live update if the username is important (channel name)
			if (important)
				onDestroy(lastSeenColors.subscribe(colors => (color = colors.get(login) as HexColor)))
			else color = get(lastSeenColors).get(login) as HexColor
		}
	}
</script>

<span style:color><slot name="prefix" />{name}<slot name="postfix" /></span>

<style>
	span {
		font-weight: 400;
	}
</style>
