import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TypeEmailMessage, EnumErrorCode } from '@messagehub/core';
import { MailgunEmailSender } from '../../src/Provider/MailgunEmailSender';
import type { TypeMailgunConfig } from '../../src/Type/Types';
import { Base64 } from '@dmitryrechkin/base64';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


// Create mock classes
class MockMailgunRequestSender {
	send = vi.fn();
}

class MockToMailgunEmailMessageTransformer {
	transform = vi.fn();
}

describe('MailgunEmailSender - Integration Tests', () => {
	let config: TypeMailgunConfig;
	let provider: MailgunEmailSender;

	beforeEach(() => {
		// Reset all mocks before each test
		vi.resetAllMocks();

		// Define Mailgun configuration
		config = {
			MESSAGE_PROVIDER: 'mailgun',
			MAILGUN_API_KEY: process.env.MAILGUN_API_KEY ?? 'test-mailgun-api-key',
			MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN ?? 'mg.example.com',
			MAILGUN_API_URL: process.env.MAILGUN_API_URL ?? 'https://api.mailgun.net',
		};

		provider = new MailgunEmailSender(config);
	});

	it('should send an email successfully', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: process.env.MAILGUN_TEST_FROM_EMAIL ?? 'test@example.com', name: 'Sender Name' }],
			to: [{ email: process.env.MAILGUN_TEST_TO_EMAIL ?? 'test@example.com', name: 'Recipient Name' }],
			subject: 'Test Email',
			text: 'This is a test email.',
			html: '<p>This is a test email.</p>',
			attachments: [],
			headers: {},
			tags: []
		};

		// integration test
		const provider = new MailgunEmailSender(config);
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

describe('MailgunEmailSender - Unit Tests', () => {
	let provider: MailgunEmailSender;
	let mockRequestSender: MockMailgunRequestSender;
	let mockTransformer: MockToMailgunEmailMessageTransformer;
	let config: TypeMailgunConfig;

	beforeEach(() => {
		// Reset all mocks before each test
		vi.resetAllMocks();

		// Define Mailgun configuration
		config = {
			MESSAGE_PROVIDER: 'mailgun',
			MAILGUN_API_KEY: 'test-mailgun-api-key',
			MAILGUN_DOMAIN: 'mg.example.com',
			MAILGUN_API_URL: 'https://api.mailgun.net/v3',
		};

		// Instantiate mocks
		mockRequestSender = new MockMailgunRequestSender();
		mockTransformer = new MockToMailgunEmailMessageTransformer();

		// Instantiate the provider with mocked dependencies
		provider = new MailgunEmailSender(config, mockRequestSender as any, mockTransformer as any);
	});

	it('should send an email successfully', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: 'sender@example.com', name: 'Sender Name' }],
			to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
			subject: 'Test Email',
			text: 'This is a test email.',
			html: '<p>This is a test email.</p>',
			attachments: [],
			headers: {},
			tags: [],
		};

		// Mock the transformer to return a valid FormData
		const mockFormData = new FormData();
		mockFormData.append('from', 'sender@example.com');
		mockFormData.append('to', 'recipient@example.com');
		mockFormData.append('subject', 'Test Email');
		mockFormData.append('text', 'This is a test email.');
		mockFormData.append('html', '<p>This is a test email.</p>');
		// Add other necessary fields as per transformer logic

		mockTransformer.transform.mockReturnValue(mockFormData);

		// Mock the requestSender to return a successful response
		mockRequestSender.send.mockResolvedValue({
			ok: true,
			json: async () => ({ id: 'mailgun-message-id' }),
		} as Response);

		const response = await provider.send(message);

		// Assertions
		expect(mockTransformer.transform).toHaveBeenCalledWith(message);
		expect(mockRequestSender.send).toHaveBeenCalledWith('/messages', {
			method: 'POST',
			body: mockFormData,
		});

		expect(response).toEqual({
			success: true,
			data: {
				...message,
				id: 'mailgun-message-id',
			},
		});
	}, 10000); // Timeout set to 10 seconds

	it('should fail to send an email due to validation error', async () => {
		const invalidMessage: any = {
			from: [], // Invalid: at least one 'from' address is required
			to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
			subject: 'Test Email',
			text: 'This is a test email.',
			html: '<p>This is a test email.</p>',
			attachments: [],
			headers: {},
			tags: [],
		};

		const response = await provider.send(invalidMessage);

		expect(response).toEqual({
			success: false,
			messages: [
				{
					code: EnumErrorCode.VALIDATION_ERROR,
					text: 'The email message could not be transformed.', // The actual message depends on the Zod schema
				},
			],
		});
	}, 10000);

	it('should fail to send an email due to transformation failure', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: 'sender@example.com', name: 'Sender Name' }],
			to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
			subject: 'Test Email',
			text: 'This is a test email.',
			html: '<p>This is a test email.</p>',
			attachments: [],
			headers: {},
			tags: [],
		};

		// Mock the transformer to return undefined, simulating a transformation failure
		mockTransformer.transform.mockReturnValue(undefined);

		const response = await provider.send(message);

		expect(mockTransformer.transform).toHaveBeenCalledWith(message);
		expect(response).toEqual({
			success: false,
			messages: [
				{
					code: EnumErrorCode.VALIDATION_ERROR,
					text: 'The email message could not be transformed.',
				},
			],
		});
	}, 10000);

	it('should handle API failure gracefully', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: 'sender@example.com', name: 'Sender Name' }],
			to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
			subject: 'Test Email',
			text: 'This is a test email.',
			html: '<p>This is a test email.</p>',
			attachments: [],
			headers: {},
			tags: [],
		};

		// Mock the transformer to return a valid FormData
		const mockFormData = new FormData();
		mockFormData.append('from', 'sender@example.com');
		mockFormData.append('to', 'recipient@example.com');
		mockFormData.append('subject', 'Test Email');
		mockFormData.append('text', 'This is a test email.');
		mockFormData.append('html', '<p>This is a test email.</p>');
		// Add other necessary fields as per transformer logic

		mockTransformer.transform.mockReturnValue(mockFormData);

		// Mock the requestSender to return a failed response
		mockRequestSender.send.mockResolvedValue({
			ok: false,
			statusText: 'Bad Request',
			json: async () => ({ message: 'Invalid domain' }),
		} as Response);

		const response = await provider.send(message);

		expect(mockTransformer.transform).toHaveBeenCalledWith(message);
		expect(mockRequestSender.send).toHaveBeenCalledWith('/messages', {
			method: 'POST',
			body: mockFormData,
		});

		expect(response).toEqual({
			success: false,
			messages: [
				{
					code: EnumErrorCode.REQUEST_FAILED,
					text: 'Invalid domain',
				},
			],
		});
	}, 10000);

	it('should correctly handle attachments', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: 'sender@example.com', name: 'Sender Name' }],
			to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
			subject: 'Test Email with Attachments',
			text: 'This email contains attachments.',
			html: '<p>This email contains attachments.</p>',
			attachments: [
				{
					filename: 'test.txt',
					content: 'VGhpcyBpcyBhIHRlc3QgYXR0YWNobWVudC4=', // Base64 for 'This is a test attachment.'
				},
				{
					filename: 'image.png',
					content: 'iVBORw0KGgo=', // Base64 for '�PNG' (truncated)
				},
			],
			headers: {},
			tags: [],
		};

		// Mock the transformer to return a valid FormData with attachments
		const mockFormData = new FormData();
		mockFormData.append('from', 'sender@example.com');
		mockFormData.append('to', 'recipient@example.com');
		mockFormData.append('subject', 'Test Email with Attachments');
		mockFormData.append('text', 'This email contains attachments.');
		mockFormData.append('html', '<p>This email contains attachments.</p>');

		// Append attachments as Blob objects
		const decodedTestTxt = Base64.decode('VGhpcyBpcyBhIHRlc3QgYXR0YWNobWVudC4=');
		const blobTestTxt = new Blob([decodedTestTxt], { type: 'application/octet-stream' });
		mockFormData.append('attachment', blobTestTxt, 'test.txt');

		const decodedImagePng = Base64.decode('iVBORw0KGgo=');
		const blobImagePng = new Blob([decodedImagePng], { type: 'application/octet-stream' });
		mockFormData.append('attachment', blobImagePng, 'image.png');

		mockTransformer.transform.mockReturnValue(mockFormData);

		// Mock the requestSender to return a successful response
		mockRequestSender.send.mockResolvedValue({
			ok: true,
			json: async () => ({ id: 'mailgun-message-id-with-attachments' }),
		} as Response);

		const response = await provider.send(message);

		// Assertions
		expect(mockTransformer.transform).toHaveBeenCalledWith(message);
		expect(mockRequestSender.send).toHaveBeenCalledWith('/messages', {
			method: 'POST',
			body: mockFormData,
		});

		expect(response).toEqual({
			success: true,
			data: {
				...message,
				id: 'mailgun-message-id-with-attachments',
			},
		});
	}, 10000);

	it('should handle multiple attachments with the same key correctly', async () => {
		const message: TypeEmailMessage = {
			from: [{ email: 'sender@example.com', name: 'Sender Name' }],
			to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
			subject: 'Test Subject',
			text: 'This is a test email body.',
			attachments: [
				{
					filename: 'file1.txt',
					content: Base64.encode(new TextEncoder().encode('First file content')),
				},
				{
					filename: 'file2.txt',
					content: Base64.encode(new TextEncoder().encode('Second file content')),
				},
			],
			headers: {},
			tags: [],
		};

		const mockFormData = new FormData();
		mockFormData.append('from', 'sender@example.com');
		mockFormData.append('to', 'recipient@example.com');
		mockFormData.append('subject', 'Test Subject');
		mockFormData.append('text', 'This is a test email body.');

		// Append attachments as Blob objects
		const decodedFile1 = Base64.decode(message.attachments?.[0].content ?? '');
		const blobFile1 = new Blob([decodedFile1], { type: 'application/octet-stream' });
		mockFormData.append('attachment', blobFile1, 'file1.txt');

		const decodedFile2 = Base64.decode(message.attachments?.[1].content ?? '');
		const blobFile2 = new Blob([decodedFile2], { type: 'application/octet-stream' });
		mockFormData.append('attachment', blobFile2, 'file2.txt');

		mockTransformer.transform.mockReturnValue(mockFormData);

		// Mock the requestSender to return a successful response
		mockRequestSender.send.mockResolvedValue({
			ok: true,
			json: async () => ({ id: 'mailgun-message-id-multiple-attachments' }),
		} as Response);

		const response = await provider.send(message);

		// Assertions
		expect(mockTransformer.transform).toHaveBeenCalledWith(message);
		expect(mockRequestSender.send).toHaveBeenCalledWith('/messages', {
			method: 'POST',
			body: mockFormData,
		});

		expect(response).toEqual({
			success: true,
			data: {
				...message,
				id: 'mailgun-message-id-multiple-attachments',
			},
		});
	}, 10000);
});