import type { EmailProviderFactoryInterface, EmailSenderInterface } from '../Interface';
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
	 * @returns {Promise<EmailSenderInterface>} - An email provider instance.
	 * @throws {Error} - Throws an error when requested provider sender can't be created.
	 */
	public async createSender(config: TypeBaseConfig): Promise<EmailSenderInterface>
	{
		try
		{
			const providerName = config.MESSAGE_PROVIDER ?? 'core';
			const packageName = '@messagehub/' + providerName;

			// Dynamically import the package and access the default export
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const ProviderModule = await import(packageName);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const Factory = ProviderModule.default;

			// we need to check if Factory has the createSender method, required by the EmailProviderFactoryInterface
			if (typeof Factory !== 'function' || !('createSender' in Factory.prototype))
			{
				throw new Error('The provider module does not implement the required interface.');
			}

			// Instantiate the factory and create the sender
			return new Factory().createSender(config as any);
		}
		catch (error)
		{
			throw new Error(`Failed to create a sender for the provider "${config.MESSAGE_PROVIDER}".`);
		}
	}
}
