import { z } from 'zod';
import { EnumContentDisposition } from './Enums';

// Represents an email address
export const emailAddressSchema = z.object({
	email: z.string().email().describe('The email address of the sender or recipient.'),
	name: z.string().optional().describe('The name associated with the email address, if available.')
});

// Represents an email message attachment
export const emailMessageAttachmentSchema = z.object({
	path: z.string().optional().describe('The file path of the attachment, if available.'),
	filename: z.string().describe('The name of the attached file.'),
	content: z.string().optional().describe('The base64 encoded content of the attachment, if available.'),
	contentDisposition: z.enum([EnumContentDisposition.INLINE, EnumContentDisposition.ATTACHMENT]).optional().describe('Specifies the disposition of the content, typically "inline" or "attachment".')
});

// Represents an email message
export const emailMessageSchema = z.object({
	id: z.string().optional().describe('This property value is returned by the API and should only be set when deleting or reading a message.'),
	grantId: z.string().optional().describe('The grant ID that allows to send messages on behalf of a given email, associated with the message.'),
	replyToMessageId: z.string().optional().describe('This property should be set to the ID of the message it is replying to.'),
	from: z.array(emailAddressSchema).optional().describe('This property should be set to the list of sender email addresses for the message.'),
	to: z.array(emailAddressSchema).optional().describe('An array of email addresses representing the primary recipient(s) of the email.'),
	cc: z.array(emailAddressSchema).optional().describe('An array of email addresses representing the recipients who will receive a carbon copy of the email.'),
	bcc: z.array(emailAddressSchema).optional().describe('An array of email addresses representing the recipients who will receive a blind carbon copy of the email.'),
	replyTo: z.array(emailAddressSchema).optional().describe('An array of email addresses that will be used when the recipient replies to the email.'),
	subject: z.string().optional().describe('The subject line of the email.'),
	text: z.string().describe('The main text content of the message.'),
	html: z.string().optional().describe('The HTML content of the email.'),
	attachments: z.array(emailMessageAttachmentSchema).optional().describe('A list of attachments included with the message.'),
	date: z.number().optional().describe('The timestamp when the message was created, typically in milliseconds since the Unix epoch.'),
	scheduledAt: z.number().optional().describe('The scheduled time to send the email, in timestamp in milliseconds since the Unix epoch.'),
	headers: z.record(z.string()).optional().describe('Custom headers to add to the email.'),
	tags: z.array(z.object({
		name: z.string().describe('The name of the email tag.'),
		value: z.string().describe('The value of the email tag.')
	})).optional().describe('Custom data passed in key/value pairs for the email.')
});

// Represents a thread of email messages supported by some APIs
export const emailMessageThreadSchema = z.object({
	id: z.string().optional().describe('A unique identifier for the message thread.'),
	grantId: z.string().optional().describe('A unique identifier for the grant that allows sending messages on behalf of a given email, associated with the message thread.'),
	from: z.array(emailAddressSchema).describe('An array of email addresses representing the sender(s) of the messages in the thread.'),
	to: z.array(emailAddressSchema).optional().describe('An array of email addresses representing the primary recipient(s) in the thread.'),
	cc: z.array(emailAddressSchema).optional().describe('An array of email addresses representing the recipients who will receive a carbon copy in the thread.'),
	bcc: z.array(emailAddressSchema).optional().describe('An array of email addresses representing the recipients who will receive a blind carbon copy in the thread.'),
	replyTo: z.array(emailAddressSchema).optional().describe('An array of email addresses that will be used when the recipient replies to any message in the thread.'),
	subject: z.string().optional().describe('The subject line for the entire thread, if applicable.'),
	messages: z.array(emailMessageSchema).describe('An array of email messages that make up the thread.'),
	receivedAt: z.number().optional().describe('The timestamp when the thread was received, typically in milliseconds since the Unix epoch.')
});

// Typically error messages returned by the API
export const responseMessageSchema = z.object({
	code: z.string(),
	text: z.string()
});

// Response from email sending operations
export const emailMessageResponseSchema = z.object({
	success: z.boolean().describe('Indicates whether the operation was successful.'),
	messages: z.array(responseMessageSchema).optional(),
	data: emailMessageSchema.optional()
});

// Response from email attachment operations
export const emailAttachmentResponseSchema = z.object({
	success: z.boolean().describe('Indicates whether the operation was successful.'),
	messages: z.array(responseMessageSchema).optional(),
	data: emailMessageAttachmentSchema.optional()
});
