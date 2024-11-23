import { convert } from 'html-to-text';
import { TextEmailBodyParser } from '@dmitryrechkin/text-email-body-parser';

import {
	type TypeNylasMessageWebhookPayload,
	type TypeNylasEmail,
	type TypeNylasEmailAttachment
} from '../Type/Types';

import {
	type TypeEmailMessageThread,
	type TypeEmailMessage,
	type TypeEmailMessageAttachment,
	type TransformerInterface,
	emailMessageThreadSchema
} from '@messagehub/core';

import { FromNylasEmailAttachmentTransformer } from './FromNylasEmailAttachmentTransformer';
import type { ZodSchema } from 'zod';

export class FromNylasWebhookPayloadTransformer implements TransformerInterface<TypeNylasMessageWebhookPayload, TypeEmailMessageThread>
{
	/**
	 * Constructor.
	 *
	 * @param {TextEmailBodyParser} textEmailBodyParser - The parser to use for parsing the email body.
	 * @param {FromNylasEmailAttachmentTransformer} fromNylasEmailAttachmentTransformer - The transformer to use for transforming the email attachments.
	 * @param {ZodSchema} schema - The schema for the message thread
	 */
	public constructor(
		private textEmailBodyParser: TextEmailBodyParser = new TextEmailBodyParser(),
		private fromNylasEmailAttachmentTransformer: FromNylasEmailAttachmentTransformer = new FromNylasEmailAttachmentTransformer(),
		private schema: ZodSchema = emailMessageThreadSchema
	) {}

	/**
	 * Transforms the Nylas webhook payload into a custom TypeChat format.
	 *
	 * @param {TypeNylasMessageWebhookPayload} webhookPayload - The payload from the Nylas webhook.
	 * @returns {TypeEmailMessageThread} - The transformed chat object.
	 */
	public transform(webhookPayload: TypeNylasMessageWebhookPayload): TypeEmailMessageThread
	{
		const email = webhookPayload.data.object;

		const messages: TypeEmailMessage[] = this.transformToMessages(email);

		// Create the chat object
		const messageThread = {
			id: email.thread_id, // Use thread_id from Nylas email as the reference ID for the chat
			grantId: email.grant_id,
			to: email.to,
			cc: email.cc,
			bcc: email.bcc,
			replyTo: email.reply_to,
			subject: email.subject,
			messages,
			from: email.from,
			receivedAt: email.date
		};

		return this.schema.safeParse(messageThread).data;
	}

	/**
	 * Transforms the Nylas email into a list of TypeEmailMessage objects.
	 *
	 * @param {TypeNylasEmail} email - The Nylas email object.
	 * @returns {TypeEmailMessage[]} - THe list of messages.
	 */
	private transformToMessages(email: TypeNylasEmail): TypeEmailMessage[]
	{
		// Convert HTML body to plain text
		const rawText = convert(email.body, {
			wordwrap: 130,
			preserveNewlines: true
		});

		const fragments = this.textEmailBodyParser.parse(rawText);

		// Map the attachments
		const attachments: TypeEmailMessageAttachment[] = this.transformAttachments(email.attachments, email.id ?? '');

		// Create the message object
		const topMessage: TypeEmailMessage = {
			id: email.id, // Use id from Nylas email as the reference ID for the message
			grantId: email.grant_id,
			text: fragments.length > 0 ? fragments[0].text.trim() : '', // First fragment will be the top most message
			attachments: attachments,
			date: email.date,
			from: email.from
		};

		const messages: TypeEmailMessage[] = [topMessage];

		// add the rest of the fragments as separate messages
		for (let fragmentIdx = 1; fragmentIdx < fragments.length; fragmentIdx++)
		{
			const fragment = fragments[fragmentIdx];

			const message: TypeEmailMessage = {
				id: topMessage.id,
				text: fragment.text.trim(),
				attachments: [],
				date: topMessage.date,
				from: fragment.senderEmail ? [ { email: fragment.senderEmail } ] : topMessage.from
			};

			messages.push(message);
		}

		return messages;
	}

	/**
	 * Transforms the Nylas attachments into TypeAttachment objects.
	 *
	 * @param {TypeNylasEmailAttachment[]} attachments - The attachments from the Nylas email.
	 * @param {string} messageId - The ID of the message the attachments belong to.
	 * @returns {TypeEmailMessageAttachment[]} - The transformed attachment objects.
	 */
	private transformAttachments(attachments: TypeNylasEmailAttachment[], messageId: string): TypeEmailMessageAttachment[]
	{
		return attachments
			.map(attachment => this.fromNylasEmailAttachmentTransformer.transform({ ...attachment, messageId}))
			.filter((attachment): attachment is TypeEmailMessageAttachment => attachment !== undefined);
	}
}
