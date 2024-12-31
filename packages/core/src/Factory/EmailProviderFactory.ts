import type { EmailProviderFactoryInterface, EmailSenderInterface } from '../Interface';
import { EmailProviderFactoryRegistry } from '../Registry';
import type { TypeBaseConfig } from '../Type';

/**
 * Interface representing an email provider factory.
 */
export class EmailProviderFactory implements EmailProviderFactoryInterface<TypeBaseConfig>
{
	/**
	 * Creates an email sender based on the provided configuration.
	 *
	 * @param {TypeBaseConfig} config - The configuration object for the email provider.
	 * @returns {EmailSenderInterface} - An email provider instance.
	 * @throws {Error} - Throws an error when requested provider sender can't be created.
	 */
	public createSender(config: TypeBaseConfig): EmailSenderInterface
	{
		const factoryConstructor = EmailProviderFactoryRegistry.getEmailProviderFactory(config.MESSAGE_PROVIDER ?? 'unknown');
		const factory = new factoryConstructor();

		return factory.createSender(config);
	}
}
