import { beforeEach, describe, it, expect } from 'vitest';
import { ToSendGridEmailMessageTransformer } from '../../src';
import { EnumContentDisposition, type TypeEmailMessage } from '@messagehub/core';

describe('ToSendGridEmailMessageTransformer', () => {
	let transformer: ToSendGridEmailMessageTransformer;

	beforeEach(() =>
	{
		transformer = new ToSendGridEmailMessageTransformer();
	});

	it('should transform a valid email message correctly without decoding attachments', () =>
	{
		const message: TypeEmailMessage = {
			from: [{ email: 'sender@example.com', name: 'Sender Name' }],
			to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
			subject: 'Test Email',
			text: 'This is a test email.',
			html: '<p>This is a test email.</p>',
			attachments: [
				{
					filename: 'test.txt',
					content: 'VGhpcyBpcyBhIHRlc3QgYXR0YWNobWVudC4=', // Base64 for 'This is a test attachment.'
					contentDisposition: EnumContentDisposition.ATTACHMENT
				}
			],
			headers: {
				'X-Custom-Header': 'CustomValue'
			},
		};

		const transformed = transformer.transform(message);

		expect(transformed).toEqual({
			personalizations: [
				{
					to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
					subject: 'Test Email',
					dynamic_template_data: undefined // Adjust based on your message structure
				}
			],
			from: { email: 'sender@example.com', name: 'Sender Name' },
			content: [
				{ type: 'text/plain', value: 'This is a test email.' },
				{ type: 'text/html', value: '<p>This is a test email.</p>' }
			],
			headers: { 'X-Custom-Header': 'CustomValue' },
			asm: undefined,
			attachments: [
				{
					content: 'VGhpcyBpcyBhIHRlc3QgYXR0YWNobWVudC4=',
					filename: 'test.txt',
					type: 'application/octet-stream',
					disposition: 'attachment'
				}
			]
		});
	});

	it('should skip attachments without content or filename', () =>
	{
		const message: TypeEmailMessage = {
			from: [{ email: 'sender@example.com', name: 'Sender Name' }],
			to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
			subject: 'Test Email with Invalid Attachments',
			text: 'This email contains attachments with missing fields.',
			attachments: [
				{
					filename: 'valid.txt',
					content: 'VGhpcyBpcyBhIHZhbGlkIGF0dGFjaG1lbnQu', // Base64 for 'This is a valid attachment.'
					contentDisposition: EnumContentDisposition.ATTACHMENT
				},
				{
					filename: '', // Missing filename
					content: 'VGhpcyBpcyBhIG51bWJlciBhdHRhY2htZW50Lg==', // Base64 for 'This is a number attachment.'
					contentDisposition: EnumContentDisposition.ATTACHMENT
				},
				{
					filename: 'noContent.txt',
					content: '', // Missing content
					contentDisposition: EnumContentDisposition.ATTACHMENT
				}
			],
			headers: {},
			tags: []
		};

		const transformed = transformer.transform(message);

		expect(transformed?.attachments).toHaveLength(1);
		expect(transformed?.attachments?.[0]).toEqual({
			content: 'VGhpcyBpcyBhIHZhbGlkIGF0dGFjaG1lbnQu',
			filename: 'valid.txt',
			type: 'application/octet-stream',
			disposition: 'attachment'
		});
	});
});
