import { flatRoutes } from 'remix-flat-routes';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { unstable_vitePlugin as remix } from '@remix-run/dev';

// import { installGlobals } from '@remix-run/node';

// installGlobals();

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		remix({
			ignoredRouteFiles: ['**/.*', '**/*.test.{ts,tsx}'],
			routes: async defineRoutes => {
				return flatRoutes('routes', defineRoutes);
			},
			serverModuleFormat: 'esm',
		}),
		tsconfigPaths(),
		visualizer({ emitFile: true }),
	],
});
