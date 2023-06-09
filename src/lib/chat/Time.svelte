<script lang="civet">
	export let date: Date
</script>

<time datetime={date.toISOString()}>
	{date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	})}
</time>

<style>
	time {
		color: #777;
	}
</style>
