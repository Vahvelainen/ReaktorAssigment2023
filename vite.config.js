import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';


/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'@lib': path.resolve('./src/lib'),
			'@droneWatcher': path.resolve('./src/droneWatcher/DroneWatcher.svelte'),
		}
	},
};

export default config;
