<script lang="ts">
	import { page } from "$app/stores"

	$: currentPath = $page.url.pathname
</script>

<main>
	<nav>
		{#each [["/settings/plugins", "Plugins"]] as [path, name]}
			<a href={path} aria-current={path === currentPath && "page"}>{name}</a>
		{/each}
		<div>nothing else yet :3</div>
	</nav>
	<slot />
</main>

<style>
	main {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		height: 100%;
	}
	nav {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		height: 100%;
		width: 20ch;
		border-right: 1px solid #333;
	}
	a {
		display: block;
		color: #fff;
		padding: 2ch;
		background-color: #181818;
		text-align: center;
		width: 100%;
	}
	a:visited {
		color: inherit;
	}
	a:hover {
		background-color: #282828;
		text-decoration: none;
	}
	a[aria-current="page"] {
		background-color: #333;
	}
	nav > div {
		color: gray;
		padding: 1ch;
		text-align: center;
		width: 100%;
	}
</style>
