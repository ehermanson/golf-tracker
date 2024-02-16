import { flatRoutes } from 'remix-flat-routes';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { cjsInterop } from 'vite-plugin-cjs-interop';
import tsconfigPaths from 'vite-tsconfig-paths';

import { unstable_vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';

installGlobals();

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
		cjsInterop({
			// List of CJS dependencies that require interop
			dependencies: ['@nivo/core', '@nivo/pie'],
		}),
		visualizer({ emitFile: true }),
	],
});
