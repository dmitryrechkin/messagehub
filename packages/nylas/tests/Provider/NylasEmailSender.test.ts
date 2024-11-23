import { describe, it, expect, beforeEach } from 'vitest';
import type { TypeEmailMessage } from '@messagehub/core';
import { NylasEmailSender } from '../../src/Provider/NylasEmailSender';
import type { TypeNylasConfig } from '../../src/Type/Types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('NylasEmailSender', () => {
	let provider: NylasEmailSender;

	beforeEach(() => {
		const config: TypeNylasConfig = {
			NYLAS_API_KEY: process.env.NYLAS_API_KEY!,
			NYLAS_GRANT_ID: process.env.NYLAS_GRANT_ID!,
			NYLAS_API_URL: 'https://api.us.nylas.com',
		};
		provider = new NylasEmailSender(config);
	});

	it('should send an email successfully', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: process.env.NYLAS_TEST_FROM_EMAIL ?? 'test@example.com', name: 'Sender Name' }],
			to: [{ email: process.env.NYLAS_TEST_TO_EMAIL ?? 'test@example.com', name: 'Recipient Name' }],
			subject: 'Test Email',
			text: 'This is a test email.',
			html: '<p>This is a test email.</p>',
			attachments: [],
			headers: {},
			tags: []
		};

		const response = await provider.send(message);

		expect(response).toHaveProperty('success', true);
	}, 30000);

	it('should fail to send an email', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: 'onboarding@nylas.com', name: 'Sender Name' }],
			to: [{ email: 'invalid-email-address', name: 'Recipient Name' }],
			subject: 'Test Email',
			text: 'This is a test email.',
			html: '<p>This is a test email.</p>',
			attachments: [],
			headers: {},
			tags: []
		};

		const response = await provider.send(message);

		expect(response).toHaveProperty('success', false);
		expect(response).toHaveProperty('messages', [{ code: 'VALIDATION_ERROR', text: 'Invalid email' }]);
	}, 30000);
});
