import type { ZodSchema } from 'zod';
import { emailMessageAttachmentSchema, type TypeEmailMessageAttachment, type TransformerInterface } from '@messagehub/core';
import type { TypeNylasEmailAttachment } from '../Type/Types';

export interface TypeNylasEmailAttachmentWithMessageId extends TypeNylasEmailAttachment
{
	messageId: string;
}

export class FromNylasEmailAttachmentTransformer implements TransformerInterface<TypeNylasEmailAttachment, TypeEmailMessageAttachment>
{
	/**
	 * Constructor.
	 *
	 * @param {ZodSchema} schema - The schema for the message attachment
	 */
	public constructor(private schema: ZodSchema = emailMessageAttachmentSchema) {}

	/**
	 * Transforms a Nylas TypeNylasEmailAttachment object to a custom TypeEmailMessageAttachment object.
	 *
	 * @param {TypeNylasEmailAttachmentWithMessageId | undefined} input - The Nylas email attachment object
	 * @returns {TypeEmailMessageAttachment | undefined} - The transformed custom message attachment object
	 */
	public transform(input: TypeNylasEmailAttachmentWithMessageId | undefined): TypeEmailMessageAttachment | undefined
	{
		if (!input)
		{
			return undefined;
		}

		const attachment = {
			// attachment path template: /attachments/<ATTACHMENT_ID>/download?message_id=<MESSAGE_ID>
			path: `/attachments/${input.id}/download?message_id=${input.messageId}`,
			filename: input.filename,
			contentDisposition: input.content_disposition?.includes('inline') ? 'inline' : 'attachment'
		};

		return this.schema.safeParse(attachment).data;
	}
}
