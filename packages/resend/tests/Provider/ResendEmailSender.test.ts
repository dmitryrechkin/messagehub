import { describe, it, expect, beforeEach } from 'vitest';
import { TypeEmailMessage } from '@messagehub/core';
import { ResendEmailSender } from '../../src/Provider/ResendEmailSender';
import { TypeResendConfig } from '../../src/Type/Types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('ResendEmailProvider', () => {
	let provider: ResendEmailSender;

	beforeEach(() => {
		const config: TypeResendConfig = {
			RESEND_API_KEY: process.env.RESEND_API_KEY || '',
			RESEND_API_URL: 'https://api.resend.com',
			MESSAGE_PROVIDER: 'resend'
		};
		provider = new ResendEmailSender(config);
	});

	it('should send an email successfully', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: 'onboarding@resend.dev', name: 'Sender Name' }],
			to: [{ email: process.env.RESEND_TEST_TO_EMAIL, name: 'Recipient Name' }],
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
			from: [{ email: 'onboarding@resend.dev', name: 'Sender Name' }],
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
