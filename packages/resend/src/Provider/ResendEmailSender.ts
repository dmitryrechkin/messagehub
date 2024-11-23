import {
	emailMessageSchema,
	EnumErrorCode,
	type TypeEmailMessage,
	type TypeEmailMessageResponse,
	type EmailSenderInterface
} from '@messagehub/core';

import type { TypeResendConfig, TypeResendErrorResponse } from '../Type/Types';
import { Resend } from 'resend';
import { ToResendEmailMessageTransformer } from '../Transformer/ToResendEmailMessageTransformer';
import type { ZodSchema } from 'zod';

/**
 * Class representing the Resend email provider.
 * This provider is responsible for sending emails using the Resend API.
 */
export class ResendEmailSender implements EmailSenderInterface
{
	/**
	 * Creates a new ResendEmailProvider instance.
	 *
	 * @param {TypeResendConfig} config - The configuration object for the Resend provider.
	 * @param {Resend} [resend] - The Resend API client to use.
	 * @param {ToResendEmailMessageTransformer} [toResendTransformer] - The transformer to use for converting email messages.
	 * @param {ZodSchema} [schema] - The schema for the email message
	 */
	public constructor(
		config: TypeResendConfig,
		private readonly resend: Resend = new Resend(config.RESEND_API_KEY),
		private readonly toResendTransformer: ToResendEmailMessageTransformer = new ToResendEmailMessageTransformer(),
		private readonly schema: ZodSchema = emailMessageSchema
	) {}

	/**
	 * Sends an email based on the provided EmailMessage.
	 *
	 * @param {TypeEmailMessage} message - The email message to be sent.
	 * @returns {Promise<TypeEmailMessageResponse>} - A promise that resolves to the response of the email sending operation.
	 */
	public async send(message: TypeEmailMessage): Promise<TypeEmailMessageResponse>
	{
		// Validate the message
		const validationResult = this.schema.safeParse(message);
		if (!validationResult.success)
		{
			return {success: false, messages: validationResult.error.errors.map((error) => ({code: EnumErrorCode.VALIDATION_ERROR, text: error.message}))};
		}

		const resendMessage = this.toResendTransformer.transform(validationResult.data);
		if (!resendMessage)
		{
			return {success: false, messages: [ { code: EnumErrorCode.VALIDATION_ERROR, text: 'The email message could not be transformed.' } ]};
		}

		const response = await this.resend.emails.send(resendMessage).catch((error: unknown) =>
		{
			if (error instanceof Error)
			{
				return Promise.reject({statusCode: 500, message: error.message, name: EnumErrorCode.REQUEST_FAILED});
			}

			return Promise.reject({statusCode: 500, message: 'An unknown error occurred while sending the email.', name: EnumErrorCode.REQUEST_FAILED});
		});

		if (response.id)
		{
			return {success: true, data: {...message, id: response.id}};
		}

		const error = response as unknown as TypeResendErrorResponse;

		return {
			success: false,
			messages: [ { code: error.name, text: error.message } ]
		};
	}
}
