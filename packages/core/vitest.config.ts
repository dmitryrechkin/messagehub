import { defineConfig } from 'vitest/config';
import path from 'path';

// Get the absolute path to the current directory
const currentDir = path.resolve(__dirname);

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// Run tests sequentially
		threads: false,
		// Increase timeout for integration tests
		testTimeout: 30000,
		hookTimeout: 30000,
		// Ensure test isolation
		isolate: true
	},
	resolve: {
		alias: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'@messagehub/core': path.resolve(currentDir, 'src'),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'@messagehub/resend': path.resolve(currentDir, '../resend/src'),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'@messagehub/nylas': path.resolve(currentDir, '../nylas/src')
		}
	}
});
