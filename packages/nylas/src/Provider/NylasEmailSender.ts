import { emailMessageSchema, EnumErrorCode, type TypeEmailMessage, type TypeEmailMessageResponse } from '@messagehub/core';
import type { EmailSenderInterface } from '@messagehub/core';
import type { TypeNylasConfig, TypeNylasEmail, TypeNylasResponse } from '../Type/Types';
import { ToNylasEmailTransformer } from '../Transformer/ToNylasEmailTransformer';
import { NylasRequestSender } from '../RequestSender/NylasRequestSender';
import { FromNylasEmailTransformer } from '../Transformer/FromNylasEmailTransformer';
import type { ZodSchema } from 'zod';

/**
 * Class representing the Resend email provider.
 * This provider is responsible for sending emails using the Resend API.
 */
export class NylasEmailSender implements EmailSenderInterface
{
	/**
	 * Creates a new ResendEmailProvider instance.
	 *
	 * @param {TypeNylasConfig} config - The configuration object for the Resend provider.
	 * @param {NylasRequestSender} [requestSender] - The Resend API client to use.
	 * @param {ToNylasEmailTransformer} [toNylasTransformer] - The transformer to use for converting email messages.
	 * @param {FromNylasEmailTransformer} [fromNylasTransformer] - The transformer to use for converting email messages.
	 * @param {ZodSchema} [schema] - The schema for the email message
	 */
	public constructor(
		config: TypeNylasConfig,
		private readonly requestSender: NylasRequestSender = new NylasRequestSender(config),
		private readonly toNylasTransformer: ToNylasEmailTransformer = new ToNylasEmailTransformer(),
		private readonly fromNylasTransformer: FromNylasEmailTransformer = new FromNylasEmailTransformer(),
		private readonly schema: ZodSchema = emailMessageSchema
	) {}

	/**
	 * Sends an email based on the provided EmailMessage.
	 *
	 * @param {TypeEmailMessage} message - The email message to be sent.
	 * @returns {Promise<TypeEmailMessageResponse>} - A promise that resolves to the response of the email sending operation.
	 */
	async send(message: TypeEmailMessage): Promise<TypeEmailMessageResponse>
	{
		// Validate the message
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

		const nylasMessage = this.toNylasTransformer.transform(validationResult.data);
		if (!nylasMessage)
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

		const response = await this.requestSender.send('/messages/send', {
			method: 'POST',
			body: JSON.stringify(nylasMessage)
		});
		if (!response.ok)
		{
			return {success: false, messages: [{code: EnumErrorCode.REQUEST_FAILED, text: response.statusText}]};
		}

		const responseJson = await response.json().catch(() => undefined);
		if (!responseJson)
		{
			return {success: false, messages: [{code: EnumErrorCode.PARSE_ERROR, text: 'Failed to parse response'}]};
		}

		const result = responseJson as TypeNylasResponse<TypeNylasEmail>;

		// Transform the response back to TypeEmailMessage
		const newMessage = this.fromNylasTransformer.transform(result.data);

		if (!newMessage)
		{
			return {success: false, messages: [{code: EnumErrorCode.TRANSFORMATION_ERROR, text: 'Failed to transform data'}]};
		}

		// Reassign original attachment content
		message.attachments?.forEach((originalAttachment) =>
		{
			newMessage.attachments?.forEach((attachment) =>
			{
				if (originalAttachment.filename === attachment.filename)
				{
					attachment.content = originalAttachment.content;
				}
			});
		});

		return {success: true, data: newMessage};
	}
}
