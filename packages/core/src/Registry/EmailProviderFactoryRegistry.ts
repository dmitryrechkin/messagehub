import type { EmailProviderFactoryInterface } from '../Interface';
import type { EmailProviderFactoryConstructor, TypeBaseConfig } from '../Type';

export class EmailProviderFactoryRegistry
{
	private static emailProviderFactories: Record<string, EmailProviderFactoryConstructor<EmailProviderFactoryInterface<TypeBaseConfig>, TypeBaseConfig>> = {};

	/**
	 * Register email provider factory for a provider.
	 *
	 * @param {string} provider - The unique identifier for the email provider factory
	 * @param {EmailProviderFactoryConstructor} emailProviderFactoryConstructor - The email provider factory constructor
	 * @returns {void}
	 */
	public static registerEmailProviderFactory(
		provider: string,
		emailProviderFactoryConstructor: EmailProviderFactoryConstructor<EmailProviderFactoryInterface<TypeBaseConfig>, TypeBaseConfig>
	): void
	{
		this.emailProviderFactories[provider] = emailProviderFactoryConstructor;
	}

	/**
	 * Get an email provider factory by provider.
	 *
	 * @param {string} provider - The unique identifier of the email provider factory
	 * @returns {EmailProviderFactoryConstructor} The email provider factory constructor
	 * @throws {Error} If no factory is found for the given provider
	 */
	public static getEmailProviderFactory(provider: string): EmailProviderFactoryConstructor<EmailProviderFactoryInterface<TypeBaseConfig>, TypeBaseConfig>
	{
		const factoryClass = this.emailProviderFactories[provider];
		if (!factoryClass)
		{
			throw new Error(`No email provider factory found for the provider "${provider}".`);
		}

		return factoryClass;
	}
}
