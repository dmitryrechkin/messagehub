import {
	emailMessageSchema,
	EnumErrorCode,
	type TypeEmailMessage,
	type TypeEmailMessageResponse,
	type EmailSenderInterface
} from '@messagehub/core';
import type { TypeMailgunConfig } from '../Type/Types';
import { ToMailgunEmailMessageTransformer } from '../Transformer/ToMailgunEmailMessageTransformer';
import { MailgunRequestSender } from '../RequestSender/MailgunRequestSender';
import type { ZodSchema } from 'zod';


export class MailgunEmailSender implements EmailSenderInterface
{
	/**
	 * Constructor.
	 *
	 * @param {TypeMailgunConfig} config - The configuration object for the Mailgun provider.
	 * @param {MailgunRequestSender} [requestSender] - The Mailgun API client to use.
	 * @param {ToMailgunEmailMessageTransformer} [transformer] - The transformer to use for converting email messages.
	 * @param {ZodSchema} [schema] - The schema for the email message
	 */
	public constructor(
		config: TypeMailgunConfig,
		private readonly requestSender: MailgunRequestSender = new MailgunRequestSender(config),
		private readonly transformer: ToMailgunEmailMessageTransformer = new ToMailgunEmailMessageTransformer(),
		private readonly schema: ZodSchema<TypeEmailMessage> = emailMessageSchema
	) {}

	/**
	 * Sends an email based on the provided EmailMessage.
	 *
	 * @param {TypeEmailMessage} message - The email message to be sent.
	 * @returns {Promise<TypeEmailMessageResponse>} - A promise that resolves to the response of the email sending operation.
	 */
	public async send(message: TypeEmailMessage): Promise<TypeEmailMessageResponse>
	{
		const validationResult = this.schema.safeParse(message);
		if (!validationResult.success)
		{
			return {
				success: false,
				messages: validationResult.error.errors.map((error) => ({
					code: EnumErrorCode.VALIDATION_ERROR,
					text: error.message
				}))
			};
		}

		// Transform the message to FormData (including attachments)
		const originalMessage = validationResult.data;
		const formData = this.transformer.transform(originalMessage);
		if (!formData)
		{
			return {
				success: false,
				messages: [
					{
						code: EnumErrorCode.VALIDATION_ERROR,
						text: 'The email message could not be transformed.'
					}
				]
			};
		}

		// Send the email via Mailgun API
		const response = await this.requestSender.send('/messages', {
			method: 'POST',
			body: formData
		});

		const responseData = await response.json().catch(() => null);

		if (!response.ok || !responseData || !responseData.id)
		{
			const errorMessage = responseData && responseData.message ? responseData.message : response.statusText || 'Failed to send email via Mailgun.';
			return {
				success: false,
				messages: [{ code: EnumErrorCode.REQUEST_FAILED, text: errorMessage }]
			};
		}

		return { success: true, data: { ...originalMessage, id: responseData.id } };
	}
}
