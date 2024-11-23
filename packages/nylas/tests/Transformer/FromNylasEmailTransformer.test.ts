import { describe, it, expect } from 'vitest';
import { FromNylasEmailTransformer } from '../../src/Transformer/FromNylasEmailTransformer';
import { EnumContentDisposition, type TypeEmailMessage } from '@messagehub/core';
import { type TypeNylasEmail } from '../../src/Type/Types';

describe('FromNylasEmailTransformer', () =>
{
	const transformer = new FromNylasEmailTransformer();

	it('should correctly transform a valid TypeNylasEmail object to a TypeEmailMessage object', () =>
	{
		const input: TypeNylasEmail = {
			id: 'email_id',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			reply_to_message_id: 'reply_id',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			send_at: 1723401655,
			body: 'This is a test email body.',
			subject: 'Test Subject',
			from: [
				{ email: 'sender@example.com', name: 'Sender Name' }
			],
			to: [
				{ email: 'recipient@example.com', name: 'Recipient Name' }
			],
			cc: [
				{ email: 'cc@example.com', name: 'CC Name' }
			],
			bcc: [
				{ email: 'bcc@example.com', name: 'BCC Name' }
			],
			// eslint-disable-next-line @typescript-eslint/naming-convention
			reply_to: [
				{ email: 'replyto@example.com', name: 'ReplyTo Name' }
			],
			attachments: [
				// eslint-disable-next-line @typescript-eslint/naming-convention
				{ id: 'attachment_id', content_disposition: 'attachment', content_type: 'application/pdf', filename: 'file.pdf', size: 11 }
			],
			date: 1723401655,
			folders: [],
			// eslint-disable-next-line @typescript-eslint/naming-convention
			grant_id: 'grant_id',
			object: 'message',
			snippet: '',
			starred: false,
			unread: false,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			thread_id: 'thread_id'
		};

		const expectedOutput: TypeEmailMessage = {
			id: 'email_id',
			replyToMessageId: 'reply_id',
			scheduledAt: 1723401655,
			text: 'This is a test email body.',
			html: 'This is a test email body.',
			subject: 'Test Subject',
			from: [
				{ email: 'sender@example.com', name: 'Sender Name' }
			],
			to: [
				{ email: 'recipient@example.com', name: 'Recipient Name' }
			],
			cc: [
				{ email: 'cc@example.com', name: 'CC Name' }
			],
			bcc: [
				{ email: 'bcc@example.com', name: 'BCC Name' }
			],
			replyTo: [
				{ email: 'replyto@example.com', name: 'ReplyTo Name' }
			],
			attachments: [
				{ path: '/attachments/attachment_id/download?message_id=email_id', filename: 'file.pdf', contentDisposition: EnumContentDisposition.ATTACHMENT }
			],
			date: 1723401655
		};

		const result = transformer.transform(input);
		expect(result).toEqual(expectedOutput);
	});

	it('should return undefined if input is undefined', () =>
	{
		const result = transformer.transform(undefined);
		expect(result).toBeUndefined();
	});

	it('should handle missing optional fields and return default values', () =>
	{
		const input: TypeNylasEmail = {
			id: 'email_id',
			subject: 'Test Subject',
			body: 'This is a test email body.',
			from: [],
			to: [],
			cc: [],
			bcc: [],
			attachments: [],
			date: 1723401655,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			grant_id: 'grant_id',
			object: 'message',
			snippet: '',
			starred: false,
			unread: false,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			thread_id: 'thread_id'
		};

		const expectedOutput: TypeEmailMessage = {
			id: 'email_id',
			subject: 'Test Subject',
			text: 'This is a test email body.',
			html: 'This is a test email body.',
			from: [],
			to: [],
			cc: [],
			bcc: [],
			attachments: [],
			date: 1723401655
		};

		const result = transformer.transform(input);
		expect(result).toEqual(expectedOutput);
	});
});
