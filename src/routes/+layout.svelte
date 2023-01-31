<script lang="ts">
	import "../global.css"
	import Login from "./Login.svelte"
</script>

<nav>
	<div>
		<h1>Chatties :3</h1>
		<i>
			#1 goat-only twitch chat client, experts say <small>
				({import.meta.env.VITE_APP_VERSION})
			</small>
		</i>
	</div>
	<Login />
	<div class="links">
		<a href="/">Chat</a>
		<a href="/settings/plugins">Settings</a>
	</div>
</nav>

<slot />

<style>
	nav {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: space-between;
		padding: 0.5ch;
		border-bottom: 1px solid #777;
	}
	h1 {
		display: inline;
	}
	i {
		display: block;
	}
	div.links {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.1em;
		padding: 0.3em;
		height: 100%;
		/* one at the end, one at the start */
		justify-content: space-between;
	}
	a {
		display: block;
		padding: 0.5ch;
		color: #fff;
		background-color: #222;
		border-radius: 0.5ch;
		text-align: center;
		width: 100%;
	}
	a:hover {
		background-color: #333;
		text-decoration: none;
	}
</style>
