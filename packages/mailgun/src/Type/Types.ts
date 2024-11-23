import type { TypeBaseConfig } from '@messagehub/core';

/**
 * Interface representing the configuration for the Mailgun email provider.
 * This extends the base configuration type from the core package.
 */
export interface TypeMailgunConfig extends TypeBaseConfig {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	MAILGUN_API_KEY: string; // API key for authenticating with the Mailgun API
	// eslint-disable-next-line @typescript-eslint/naming-convention
	MAILGUN_API_URL?: string; // Optional custom API URL, defaults to Mailgun's API endpoint
	// eslint-disable-next-line @typescript-eslint/naming-convention
	MAILGUN_DOMAIN: string; // Your Mailgun domain (e.g., 'mg.yourdomain.com')
}
