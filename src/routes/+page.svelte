<svelte:head>
	<title>Home</title>
	<meta name="description" content="Reaktor 2023 app by Leevi Vahvelainen" />
</svelte:head>

<script>
	import DroneWatcher from "@droneWatcher";
</script>

<section>
	<h1>
		Hello world
	</h1>

	<h2>
		try editing <strong>src/routes/+page.svelte</strong>
	</h2>

	<DroneWatcher/>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

</style>
