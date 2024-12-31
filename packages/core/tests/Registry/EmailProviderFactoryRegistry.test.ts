import { describe, it, expect, beforeEach } from 'vitest';
import { EmailProviderFactoryRegistry } from '../../src/Registry/EmailProviderFactoryRegistry';
import type { EmailProviderFactoryInterface } from '../../src/Interface';
import type { EmailProviderFactoryConstructor, TypeBaseConfig } from '../../src/Type';
import { ResendEmailProviderFactory } from '../../../resend/src/Factory';
import { NylasEmailProviderFactory } from '../../../nylas/src/Factory';

class MockEmailProviderFactory implements EmailProviderFactoryInterface<TypeBaseConfig>
{
	createSender(): any 
	{
		return {};
	}
}

const mockFactoryConstructor: EmailProviderFactoryConstructor<EmailProviderFactoryInterface<TypeBaseConfig>, TypeBaseConfig> = class MockFactory implements EmailProviderFactoryInterface<TypeBaseConfig>
{
	constructor()
	{
		return new MockEmailProviderFactory();
	}
	createSender(): any
	{
		return {};
	}
};

describe('EmailProviderFactoryRegistry', () => {
	beforeEach(() => {
		// Clear the registry before each test
		(EmailProviderFactoryRegistry as any).emailProviderFactories = {};
		EmailProviderFactoryRegistry.registerEmailProviderFactory('resend', ResendEmailProviderFactory);
		EmailProviderFactoryRegistry.registerEmailProviderFactory('nylas', NylasEmailProviderFactory);
	});

	it('should register an email provider factory', () => {
		EmailProviderFactoryRegistry.registerEmailProviderFactory('test-provider', mockFactoryConstructor);
		expect((EmailProviderFactoryRegistry as any).emailProviderFactories['test-provider']).toBe(mockFactoryConstructor);
	});

	it('should get an email provider factory', () => {
		EmailProviderFactoryRegistry.registerEmailProviderFactory('test-provider', mockFactoryConstructor);
		const factory = EmailProviderFactoryRegistry.getEmailProviderFactory('test-provider');
		expect(factory).toBe(mockFactoryConstructor);
	});

	it('should throw an error if no factory is found', () => {
		expect(() => EmailProviderFactoryRegistry.getEmailProviderFactory('non-existent-provider')).toThrowError('No email provider factory found for the provider "non-existent-provider".');
	});
});
