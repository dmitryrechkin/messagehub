import type { ZodSchema } from 'zod';
import { convert } from 'html-to-text';

import {
	emailMessageSchema,
	type TypeEmailMessage,
	type TypeEmailAddress,
	type TypeEmailMessageAttachment,
	type TransformerInterface
} from '@messagehub/core';

import type { TypeNylasEmail, TypeNylasEmailAddress, TypeNylasEmailAttachment } from '../Type/Types';
import { FromNylasEmailAttachmentTransformer } from './FromNylasEmailAttachmentTransformer';

export class FromNylasEmailTransformer implements TransformerInterface<TypeNylasEmail, TypeEmailMessage>
{
	/**
	 * Constructor.
	 *
	 * @param {FromNylasEmailAttachmentTransformer} fromNylasEmailAttachmentTransformer - The transformer to use for transforming the email attachments.
	 * @param {ZodSchema} schema - The schema for the email message
	 */
	public constructor(
		private fromNylasEmailAttachmentTransformer: FromNylasEmailAttachmentTransformer = new FromNylasEmailAttachmentTransformer(),
		private schema: ZodSchema = emailMessageSchema
	) {}

	/**
	 * Transforms a Nylas TypeNylasEmail object to a custom TypeEmailMessage object.
	 *
	 * @param {TypeNylasEmail | undefined} input - The Nylas email object
	 * @returns {TypeEmailMessage | undefined} - The transformed custom email message object
	 */
	public transform(input: TypeNylasEmail | undefined): TypeEmailMessage | undefined
	{
		if (!input)
		{
			return undefined;
		}

		// Convert HTML body to plain text
		const text = convert(input.body, {
			wordwrap: 130,
			preserveNewlines: true
		});

		const emailMessage = {
			id: input.id,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			replyToMessageId: input.reply_to_message_id,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			scheduledAt: input.send_at,
			text,
			html: input.body,
			subject: input.subject || '',
			from: this.transformAddresses(input.from) ?? [],
			to: this.transformAddresses(input.to) ?? [],
			cc: this.transformAddresses(input.cc),
			bcc: this.transformAddresses(input.bcc),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			replyTo: this.transformAddresses(input.reply_to),
			attachments: input.attachments ? this.transformAttachments(input.attachments, input.id ?? '') : undefined,
			date: input.date
		};

		return this.schema.safeParse(emailMessage).data;
	}

	/**
	 * Transforms an array of TypeNylasEmailAddress objects to an array of TypeEmailAddress objects.
	 *
	 * @param {TypeNylasEmailAddress[] | undefined} addresses - The Nylas email addresses
	 * @returns {TypeEmailAddress[]} - The transformed custom message addresses
	 */
	private transformAddresses(addresses?: TypeNylasEmailAddress[] | undefined): TypeEmailAddress[] | undefined
	{
		if (!addresses)
		{
			return undefined;
		}

		return addresses.map(address => ({
			email: address.email,
			name: address.name
		}));
	}

	/**
	 * Transforms an array of TypeNylasEmailAttachment objects to an array of TypeEmailMessageAttachment objects.
	 *
	 * @param {TypeNylasEmailAttachment[] | undefined} attachments - The Nylas attachments
	 * @param {string} messageId - The ID of the message the attachments belong to
	 * @returns {TypeEmailMessageAttachment[]} - The transformed custom message attachments
	 */
	private transformAttachments(attachments: TypeNylasEmailAttachment[], messageId: string): TypeEmailMessageAttachment[]
	{
		return attachments
			.map(attachment => this.fromNylasEmailAttachmentTransformer.transform({ ...attachment, messageId}))
			.filter((attachment): attachment is TypeEmailMessageAttachment => attachment !== undefined);
	}
}
