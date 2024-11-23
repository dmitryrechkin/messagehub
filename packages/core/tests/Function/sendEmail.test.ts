import { describe, it, expect } from 'vitest';
import { TypeResendConfig } from '../../../resend/src';
import { sendEmail, TypeEmailMessage } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('sendEmail - Integration tests', () => {
	it('should send an email successfully', async () => {
		const config: TypeResendConfig = {
			RESEND_API_KEY: process.env.RESEND_API_KEY || '',
			RESEND_API_URL: 'https://api.resend.com',
			MESSAGE_PROVIDER: 'resend'
		};

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

		const response = await sendEmail(message, config);
		expect(response).toHaveProperty('success', true);
	}, 30000);
});
