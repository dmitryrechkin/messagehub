import {
	emailMessageSchema,
	EnumErrorCode,
	type TypeEmailMessage,
	type TypeEmailMessageResponse,
	type EmailSenderInterface
} from '@messagehub/core';
import type { TypeSendGridConfig } from '../Type/Types';
import { ToSendGridEmailMessageTransformer } from '../Transformer/ToSendGridEmailMessageTransformer';
import { SendGridRequestSender } from '../RequestSender/SendGridRequestSender';
import type { ZodSchema } from 'zod';

/**
 * Email sender implementation for SendGrid.
 */
export class SendGridEmailSender implements EmailSenderInterface
{
	/**
	 * Constructor.
	 *
	 * @param {TypeSendGridConfig} config - The configuration object for SendGrid.
	 * @param {SendGridRequestSender} [requestSender] - The SendGrid API client to use.
	 * @param {ToSendGridEmailMessageTransformer} [transformer] - The transformer to use for converting email messages.
	 * @param {ZodSchema} [schema] - The schema for the email message.
	 */
	public constructor(
		config: TypeSendGridConfig,
		private readonly requestSender: SendGridRequestSender = new SendGridRequestSender(config),
		private readonly transformer: ToSendGridEmailMessageTransformer = new ToSendGridEmailMessageTransformer(),
		private readonly schema: ZodSchema<TypeEmailMessage> = emailMessageSchema
	) {}

	/**
	 * Sends an email based on the provided EmailMessage.
	 *
	 * @param {TypeEmailMessage} message - The email message to be sent.
	 * @returns {Promise<TypeEmailMessageResponse>} - The response of the email sending operation.
	 */
	public async send(message: TypeEmailMessage): Promise<TypeEmailMessageResponse>
	{
		const validationResult = this.schema.safeParse(message);
		if (!validationResult.success)
		{
			return {
				success: false,
				messages: validationResult.error.errors.map(error => ({
					code: EnumErrorCode.VALIDATION_ERROR,
					text: error.path + ' - ' + error.message
				}))
			};
		}

		const originalMessage = validationResult.data;
		const transformedMessage = this.transformer.transform(originalMessage);
		if (!transformedMessage)
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

		const response = await this.requestSender.send('/mail/send', {
			method: 'POST',
			body: JSON.stringify(transformedMessage)
		});

		if (response.status === 202)
		{
			// SendGrid returns 202 for accepted emails
			return {
				success: true,
				data: {
					...originalMessage,
					id: this.extractMessageId(response)
				}
			};
		}

		const responseData = await response.json().catch(() => null);
		const errorMessage = responseData?.errors?.map((err: any) => err.message).join(', ') || response.statusText || 'Failed to send email via SendGrid.';

		return {
			success: false,
			messages: [
				{
					code: EnumErrorCode.REQUEST_FAILED,
					text: errorMessage
				}
			]
		};
	}

	/**
	 * Extracts the message ID from SendGrid's response headers.
	 *
	 * @param {Response} response - The response object from SendGrid.
	 * @returns {string} - The extracted message ID.
	 */
	private extractMessageId(response: Response): string
	{
		const messageId = response.headers.get('X-Message-Id');
		return messageId || 'sendgrid-message-id';
	}
}
