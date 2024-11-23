import type { TypeBaseConfig } from '../Type/Types';
import type { EmailProviderFactoryInterface } from './EmailProviderFactoryInterface';
import type { EmailSenderInterface } from './EmailSenderInterface';

/**
 * Interface representing an email provider factory manager.
 */
export interface EmailProviderManagerInterface
{
	/**
	 * Registers an EmailProviderFactory.
	 *
	 * @param {EmailProviderFactoryInterface} factory - The factory to register.
	 * @returns {void}
	 */
	registerFactory(factory: EmailProviderFactoryInterface): void;

	/**
	 * Retrieves an EmailProvider based on the provided configuration.
	 *
	 * @param {TypeBaseConfig} config - The email configuration.
	 * @returns {EmailSenderInterface} - An instance of EmailProvider.
	 * @throws {Error} - Throws an error if no factory can handle the provided configuration.
	 */
	createSender(config: TypeBaseConfig): EmailSenderInterface;
}
