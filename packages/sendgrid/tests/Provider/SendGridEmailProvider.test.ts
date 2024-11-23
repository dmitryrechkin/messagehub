// tests/Provider/SendGridEmailSender.integration.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { EnumErrorCode, TypeEmailMessage } from '@messagehub/core';
import { SendGridEmailSender } from '../../src/Provider/SendGridEmailSender';
import { TypeSendGridConfig } from '../../src/Type/Types';
import dotenv from 'dotenv';

/**
 * @fileoverview
 * Integration tests for the SendGridEmailSender.
 *
 * @setup
 * 1. **Create a SendGrid Account:**
 *    - Sign up for a SendGrid account at [SendGrid Signup](https://signup.sendgrid.com/).
 *
 * 2. **Generate a SendGrid API Key:**
 *    - Navigate to **Settings** > **API Keys** in the SendGrid dashboard.
 *    - Click **"Create API Key"**.
 *    - Assign a name (e.g., `SendGridIntegrationTestKey`) and grant **Full Access**.
 *    - Save the API key securely; you'll need it for the `.env` file.
 *
 * 3. **Verify Sender Identity:**
 *    - Go to **Settings** > **Sender Authentication**.
 *    - Verify your sender email address (`SENDGRID_TEST_FROM_EMAIL`) by following SendGrid's verification process.
 *
 * 4. **Set Up Environment Variables:**
 *    - Create a `.env` file in the root directory of your project.
 *    - Add the following variables:
 *
 *      ```env
 *      SENDGRID_API_KEY=your_sendgrid_api_key
 *      SENDGRID_TEST_TO_EMAIL=recipient@example.com
 *      SENDGRID_TEST_FROM_EMAIL=verified_sender@example.com
 *      ```
 *
 *    - Replace `your_sendgrid_api_key` with the API key you generated.
 *    - Replace `recipient@example.com` with the email address you want to send test emails to.
 *    - Replace `verified_sender@example.com` with your verified sender email.
 *    - Optionally, set `SENDGRID_SENDER_NAME` to the desired sender name.
 *
 * 5. **Install Dependencies:**
 *    - Ensure you have the necessary dependencies installed:
 *
 *      ```bash
 *      npm install vitest @messagehub/core @dmitryrechkin/base64 dotenv
 *      ```
 *
 * 6. **Run the Tests:**
 *    - Execute the integration tests using Vitest:
 *
 *      ```bash
 *      npx vitest run tests/Provider/SendGridEmailSender.integration.test.ts
 *      ```
 *
 *    - Ensure that your environment variables are correctly loaded and that the sender email is verified.
 */

 // Load environment variables from .env file
dotenv.config();

describe('SendGridEmailProvider - Integration Tests', () => {
	let provider: SendGridEmailSender;

	beforeEach(() => {
		const config: TypeSendGridConfig = {
			MESSAGE_PROVIDER: 'sendgrid',
			SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
			SENDGRID_API_URL: process.env.SENDGRID_API_URL || 'https://api.sendgrid.com',
		};
		provider = new SendGridEmailSender(config);
	});

	it('should send an email successfully', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: process.env.SENDGRID_TEST_FROM_EMAIL || '', name: 'Sender Name' }],
			to: [{ email: process.env.SENDGRID_TEST_TO_EMAIL || '', name: 'Recipient Name' }],
			subject: 'Integration Test Email',
			text: 'This is a test email sent via SendGrid integration test.',
			html: '<p>This is a test email sent via <strong>SendGrid</strong> integration test.</p>',
			attachments: [
				{
					filename: 'test.txt',
					content: 'VGhpcyBpcyBhIHRlc3QgYXR0YWNobWVudC4=' // Base64 for 'This is a test attachment.'
				}
			],
			headers: {
				'X-Custom-Header': 'CustomValue'
			},
		};

		const response = await provider.send(message);

		expect(response).toHaveProperty('success', true);
		expect(response).toHaveProperty('data');
		expect(response.data).toHaveProperty('id'); // SendGrid may not return an ID, adjust as necessary
	}, 30000); // Timeout set to 30 seconds to account for network delays

	it('should fail to send an email due to invalid recipient email', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: process.env.SENDGRID_SENDER_EMAIL || '', name: process.env.SENDGRID_SENDER_NAME || 'Sender Name' }],
			to: [{ email: 'invalid-email-address', name: 'Recipient Name' }],
			subject: 'Integration Test Email Failure',
			text: 'This email should fail due to an invalid recipient email address.',
			html: '<p>This email should fail due to an invalid recipient email address.</p>',
			attachments: [],
			headers: {},
			tags: []
		};

		const response = await provider.send(message);

		expect(response).toHaveProperty('success', false);
		expect(response).toHaveProperty('messages');
		expect(response.messages).toEqual([
			{
				code: EnumErrorCode.VALIDATION_ERROR,
				text: expect.stringContaining('from,0,email - Invalid email')
			},
			{
				code: EnumErrorCode.VALIDATION_ERROR,
				text: expect.stringContaining('to,0,email - Invalid email')
			}
		]);
	}, 30000);
});
