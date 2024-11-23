import type { EmailProviderFactoryInterface, EmailSenderInterface } from '@messagehub/core';
import { MailgunEmailSender } from '../Provider/MailgunEmailSender';
import type { TypeMailgunConfig } from '../Type/Types';

/**
 * Interface representing an email provider factory.
 */
export class MailgunEmailProviderFactory implements EmailProviderFactoryInterface<TypeMailgunConfig>
{
	/**
	 * Creates an email sender based on the provided configuration.
	 *
	 * @param {TypeMailgunConfig} config - The configuration object for the email provider.
	 * @returns {Promise<EmailSenderInterface>} - An email provider instance.
	 * @throws {Error} - Throws an error when requested provider sender can't be created.
	 */
	public async createSender(config: TypeMailgunConfig): Promise<EmailSenderInterface>
	{
		return new MailgunEmailSender(config);
	}
}
