import { describe, it, expect } from 'vitest';
import { EnumContentDisposition, type TypeEmailMessage } from '@messagehub/core';
import { ToNylasEmailTransformer } from '../../src/Transformer/ToNylasEmailTransformer';
import { type TypeNylasEmail } from '../../src/Type/Types';

describe('ToNylasEmailMessageTransformer', () =>
{
	const transformer = new ToNylasEmailTransformer();

	it('should correctly transform a valid TypeEmailMessage object to a TypeNylasEmail object', () =>
	{
		const input: TypeEmailMessage = {
			id: 'email_id',
			replyToMessageId: 'reply_id',
			scheduledAt: 1723401655,
			text: 'This is a test email body.',
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
				{ path: '/path/to/file.pdf', contentDisposition: EnumContentDisposition.ATTACHMENT, filename: 'file.pdf', content: 'SGVsbG8gd29ybGQ=' }
			],
			date: 1723401655
		};

		const expectedOutput: TypeNylasEmail = {
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
				{ content_disposition: 'attachment', content_type: 'application/pdf', filename: 'file.pdf', content: 'SGVsbG8gd29ybGQ=', size: 11 }
			],
			date: 1723401655,
			folders: [],
			// eslint-disable-next-line @typescript-eslint/naming-convention
			grant_id: ''
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
		const input: TypeEmailMessage = {
			id: 'email_id',
			text: 'This is a test email body.',
			attachments: [],
			date: 1723401655
		};

		const expectedOutput: TypeNylasEmail = {
			id: 'email_id',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			reply_to_message_id: undefined,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			send_at: undefined,
			body: 'This is a test email body.',
			subject: '',
			from: [],
			to: [],
			cc: [],
			bcc: [],
			// eslint-disable-next-line @typescript-eslint/naming-convention
			reply_to: [],
			attachments: [],
			date: Math.floor(new Date().getTime() / 1000),
			folders: [],
			// eslint-disable-next-line @typescript-eslint/naming-convention
			grant_id: ''
		};

		const result = transformer.transform(input);
		expect(result).toEqual(expectedOutput);
	});

	it('should correctly detect content type based on filename', () =>
	{
		const transformerInstance = new ToNylasEmailTransformer();
		const pdfContentType = transformerInstance['detectContentType']('file.pdf');
		const jpgContentType = transformerInstance['detectContentType']('image.jpg');
		const unknownContentType = transformerInstance['detectContentType']('file.unknown');

		expect(pdfContentType).toBe('application/pdf');
		expect(jpgContentType).toBe('image/jpeg');
		expect(unknownContentType).toBe('application/octet-stream');
	});
});
