<script lang="ts">
	import Time from "./Time.svelte"

	export let date: Date
</script>

<Time {date} />
<span><slot /></span>

<style>
	span {
		color: #777;
	}
</style>
