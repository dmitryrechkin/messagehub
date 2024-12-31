import { describe, it, expect, beforeEach } from 'vitest';
import type { TypeNylasConfig } from '../../../nylas/src';
import type { TypeResendConfig } from '../../../resend/src';
import { EmailProviderFactory, EmailSenderInterface, TypeBaseConfig } from '../../src';

// Import the providers to register them
import '@messagehub/resend';
import '@messagehub/nylas';

// Correct configurations for testing (replace with actual test environment values).
const resendConfig: TypeResendConfig = {
	MESSAGE_PROVIDER: 'resend',
	RESEND_API_KEY: 'your-resend-api-key',
};

const nylasConfig: TypeNylasConfig = {
	MESSAGE_PROVIDER: 'nylas',
	NYLAS_API_KEY: 'your-nylas-client-id',
	NYLAS_API_URL: 'https://api.nylas.com',
	NYLAS_GRANT_ID: 'your-nylas-grand-id',
};

const unsupportedProviderConfig: TypeBaseConfig = {
	MESSAGE_PROVIDER: 'unknown-provider',
};

describe('EmailProviderFactory Integration', () => {
	let factory: EmailProviderFactory;

	beforeEach(() => {
		factory = new EmailProviderFactory();
	});

	describe('createSender with real providers', () => {
		it('should create a valid Resend EmailSender', async () => {
			const sender: EmailSenderInterface = factory.createSender(resendConfig);

			expect(sender).toBeDefined();
			expect(typeof sender.send).toBe('function');
		});

		it('should create a valid Nylas EmailSender', async () => {
			const sender: EmailSenderInterface = factory.createSender(nylasConfig);

			expect(sender).toBeDefined();
			expect(typeof sender.send).toBe('function');
		});

		it('should throw an error for an unsupported provider', () => {
			expect(() => factory.createSender(unsupportedProviderConfig))
				.toThrow(`No email provider factory found for the provider "${unsupportedProviderConfig.MESSAGE_PROVIDER}".`);
		});
	});
});
