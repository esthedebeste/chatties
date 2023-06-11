<script lang="civet">
	export let value: boolean

	function checkbox(event: Event): void
		value = (event.target as HTMLInputElement).checked
</script>

<input type="checkbox" checked={value === true} on:change={checkbox} />
