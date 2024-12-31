import type { EmailProviderFactoryInterface } from '../Interface';
import type { TypeBaseConfig } from './Types';

/**
 * Represents a constructor type for email provider factory implementations.
 * This type ensures that any email provider factory class can be instantiated
 * and properly implements the EmailProviderFactoryInterface.
 *
 * @template T The specific email provider factory interface implementation that extends EmailProviderFactoryInterface
 * @template C The specific email provider configuration type that extends TypeBaseConfig
 */
export type EmailProviderFactoryConstructor<
	T extends EmailProviderFactoryInterface<C>,
	C extends TypeBaseConfig = TypeBaseConfig
> = new () => T;
