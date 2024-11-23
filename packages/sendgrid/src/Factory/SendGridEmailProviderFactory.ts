import type { EmailProviderFactoryInterface, EmailSenderInterface } from '@messagehub/core';
import { SendGridEmailSender } from '../Provider/SendGridEmailSender';
import type { TypeSendGridConfig } from '../Type/Types';

/**
 * Factory class for creating SendGrid email sender instances.
 */
export class SendGridEmailProviderFactory implements EmailProviderFactoryInterface<TypeSendGridConfig>
{
	/**
	 * Creates an email sender based on the provided configuration.
	 *
	 * @param {TypeSendGridConfig} config - The configuration object for SendGrid.
	 * @returns {Promise<EmailSenderInterface>} - An instance of SendGridEmailSender.
	 * @throws {Error} - Throws an error if the sender cannot be created.
	 */
	public async createSender(config: TypeSendGridConfig): Promise<EmailSenderInterface>
	{
		return new SendGridEmailSender(config);
	}
}
