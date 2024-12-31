import type { TypeBaseConfig } from '../Type/Types';
import type { EmailSenderInterface } from './EmailSenderInterface';

/**
 * Interface representing an email provider factory.
 */
export interface EmailProviderFactoryInterface<TypeConfig extends TypeBaseConfig = TypeBaseConfig>
{
	/**
	 * Creates an email sender based on the provided configuration.
	 *
	 * @param {TypeConfig} config - The configuration object for the email provider.
	 * @returns {EmailSenderInterface} - An email provider instance.
	 * @throws {Error} - Throws an error when requested provider sender can't be created.
	 */
	createSender(config: TypeConfig): EmailSenderInterface;
}
