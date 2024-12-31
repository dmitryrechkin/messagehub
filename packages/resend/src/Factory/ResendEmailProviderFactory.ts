import { ResendEmailSender } from '../Provider/ResendEmailSender';
import type { TypeResendConfig } from '../Type/Types';
import type { EmailProviderFactoryInterface, EmailSenderInterface } from '@messagehub/core';

/**
 * Interface representing an email provider factory.
 */
export class ResendEmailProviderFactory implements EmailProviderFactoryInterface<TypeResendConfig>
{
	/**
	 * Creates an email provider based on the provided configuration.
	 *
	 * @param {TypeResendConfig} config - The configuration object for the email provider.
	 * @returns {EmailSenderInterface} - An email provider instance.
	 * @throws {Error} - Throws an error when requested provider sender can't be created.
	 */
	public createSender(config: TypeResendConfig): EmailSenderInterface
	{
		return new ResendEmailSender(config);
	}
}
