import { describe, it, expect } from 'vitest';
import type { TypeEmailMessage } from '@messagehub/core';
import { Base64 } from '@dmitryrechkin/base64';
import { ToMailgunEmailMessageTransformer } from '../../src';

// Helper function to convert FormData to a plain object
async function formDataToObject(formData: FormData): Promise<Record<string, any>> {
	const obj: Record<string, any> = {};
	for (const [key, value] of formData.entries()) {
		if (value instanceof Blob) {
			// For Blob, we'll convert it to a base64 string for comparison
			obj[key] = await blobToBase64(value);
		} else {
			obj[key] = value;
		}
	}
	return obj;
}

// Helper function to convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
	const arrayBuffer = await blob.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);
	return Base64.encode(bytes);
}

describe('ToMailgunEmailMessageTransformer', () => {
	const transformer = new ToMailgunEmailMessageTransformer();

	it('should correctly transform a complete TypeEmailMessage object to FormData', async () => {
		const input: TypeEmailMessage = {
			from: [{ email: 'sender@example.com', name: 'Sender Name' }],
			to: [
				{ email: 'recipient1@example.com', name: 'Recipient One' },
				{ email: 'recipient2@example.com', name: 'Recipient Two' },
			],
			subject: 'Test Subject',
			text: 'This is a test email body.',
			html: '<p>This is a <strong>test</strong> email body.</p>',
			cc: [{ email: 'cc@example.com', name: 'CC Name' }],
			bcc: [{ email: 'bcc@example.com', name: 'BCC Name' }],
			replyTo: [{ email: 'replyto@example.com', name: 'ReplyTo Name' }],
			headers: {
				'X-Custom-Header': 'CustomValue',
			},
			tags: [{ name: 'test-tag', value: 'test-tag' }, { name: 'urgent', value: 'urgent' }],
			attachments: [
				{
					filename: 'test.txt',
					content: 'VGhpcyBpcyBhIHRlc3QgYXR0YWNobWVudC4=', // Base64 encoded content
				},
				{
					filename: 'image.png',
					content: 'iVBORw0KGgo=' // Base64 encoded PNG file
				},
			],
		};

		const formData = transformer.transform(input);
		expect(formData).toBeInstanceOf(FormData);

		const formDataObj = await formDataToObject(formData!);

		expect(formDataObj['from']).toBe('sender@example.com');
		expect(formDataObj['to']).toBe('recipient1@example.com,recipient2@example.com');
		expect(formDataObj['subject']).toBe('Test Subject');
		expect(formDataObj['text']).toBe('This is a test email body.');
		expect(formDataObj['html']).toBe('<p>This is a <strong>test</strong> email body.</p>');
		expect(formDataObj['cc']).toBe('cc@example.com');
		expect(formDataObj['bcc']).toBe('bcc@example.com');
		expect(formDataObj['h:Reply-To']).toBe('replyto@example.com');
		expect(formDataObj['h:X-Custom-Header']).toBe('CustomValue');
		expect(formDataObj['o:tag']).toBe('test-tag,urgent');

		// Check attachments
		expect(formDataObj['attachment']).toBeDefined();
	});

	it('should return undefined when input is undefined', () => {
		const result = transformer.transform(undefined);
		expect(result).toBeUndefined();
	});

	it('should correctly handle TypeEmailMessage with missing optional fields', async () => {
		const input: TypeEmailMessage = {
			from: [{ email: 'sender@example.com' }],
			to: [{ email: 'recipient@example.com' }],
			subject: 'Test Subject',
			text: 'This is a test email body.',
		};

		const formData = transformer.transform(input);
		expect(formData).toBeInstanceOf(FormData);

		const formDataObj = await formDataToObject(formData!);

		expect(formDataObj['from']).toBe('sender@example.com');
		expect(formDataObj['to']).toBe('recipient@example.com');
		expect(formDataObj['subject']).toBe('Test Subject');
		expect(formDataObj['text']).toBe('This is a test email body.');

		expect(formDataObj['html']).toBeUndefined();
		expect(formDataObj['cc']).toBeUndefined();
		expect(formDataObj['bcc']).toBeUndefined();
		expect(formDataObj['h:Reply-To']).toBeUndefined();
		expect(formDataObj['h:X-Custom-Header']).toBeUndefined();
		expect(formDataObj['o:tag']).toBeUndefined();
		expect(formDataObj['attachment']).toBeUndefined();
	});

	it('should correctly append attachments to FormData', async () => {
		const input: TypeEmailMessage = {
			from: [{ email: 'sender@example.com' }],
			to: [{ email: 'recipient@example.com' }],
			subject: 'Test Subject',
			text: 'This is a test email body.',
			attachments: [
				{
					filename: 'document.pdf',
					content: Base64.encode(new TextEncoder().encode('Test content')), // Base64 encoded PDF content
				},
				{
					filename: 'image.jpg',
					content: Base64.encode(new TextEncoder().encode('image data')), // Base64 encoded JPEG file signature bytes
				},
			],
		};

		const formData = transformer.transform(input);
		expect(formData).toBeInstanceOf(FormData);

		// decode attachments back to the original format
		const attachments: Record<string, any>[] = [];
		for (const [key, value] of formData!.entries()) {
			if (key === 'attachment') {
				if (value instanceof Blob) {
					const arrayBuffer = await value.arrayBuffer();
					const bytes = new Uint8Array(arrayBuffer);
					attachments.push({
						filename: (value as any).name,
						content: Base64.encode(bytes),
					});
				}
			}
		}

		expect(input.attachments?.[0].filename).toBe('document.pdf');
		expect(input.attachments?.[0].content).toEqual(attachments[0].content);
		expect(input.attachments?.[1].filename).toBe('image.jpg');
		expect(input.attachments?.[1].content).toEqual(attachments[1].content);
	});

	it('should skip unsupported attachment content types', () => {
		const input: TypeEmailMessage = {
			from: [{ email: 'sender@example.com' }],
			to: [{ email: 'recipient@example.com' }],
			subject: 'Test Subject',
			text: 'This is a test email body.',
			attachments: [
				{
					filename: 'script.sh',
					content: { some: 'object' } as any, // Unsupported type
				},
			],
		};

		const result = transformer.transform(input);
		expect(result).toBeInstanceOf(FormData);
		const formDataObj = formDataToObject(result!);
		expect(formDataObj['attachment']).toBeUndefined(); // Ensure unsupported attachment is skipped
	});

	it('should handle multiple attachments with the same key correctly', async () => {
		const input: TypeEmailMessage = {
			from: [{ email: 'sender@example.com' }],
			to: [{ email: 'recipient@example.com' }],
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
		};

		const formData = transformer.transform(input);
		expect(formData).toBeInstanceOf(FormData);

		// decode attachments back to the original format
		const attachments: Record<string, any>[] = [];
		for (const [key, value] of formData!.entries()) {
			if (key === 'attachment') {
				if (value instanceof Blob) {
					const arrayBuffer = await value.arrayBuffer();
					const bytes = new Uint8Array(arrayBuffer);
					attachments.push({
						filename: (value as any).name,
						content: Base64.encode(bytes),
					});
				}
			}
		}

		expect(attachments.length).toBe(2);
		expect(attachments[0].filename).toBe('file1.txt');
		expect(attachments[0].content).toBe(attachments[0].content);
		expect(attachments[1].filename).toBe('file2.txt');
		expect(attachments[1].content).toBe(attachments[1].content);
	});
});
