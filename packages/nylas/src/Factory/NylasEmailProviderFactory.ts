import { NylasEmailSender } from '../Provider/NylasEmailSender';
import type { TypeNylasConfig } from '../Type/Types';
import type { EmailProviderFactoryInterface, EmailSenderInterface } from '@messagehub/core';

/**
 * Interface representing an email provider factory.
 */
export class NylasEmailProviderFactory implements EmailProviderFactoryInterface<TypeNylasConfig>
{
	/**
	 * Creates an email sender based on the provided configuration.
	 *
	 * @param {TypeNylasConfig} config - The configuration object for the email provider.
	 * @returns {EmailSenderInterface} - An email provider instance.
	 * @throws {Error} - Throws an error when requested provider sender can't be created.
	 */
	public createSender(config: TypeNylasConfig): EmailSenderInterface
	{
		return new NylasEmailSender(config);
	}
}
