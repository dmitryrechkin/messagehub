export * from './Factory';
export * from './Provider';
export * from './Transformer';
export * from './Type';

// default export so that core factory can use it directly
import { ResendEmailProviderFactory } from './Factory';
import { EmailProviderFactoryRegistry } from '@messagehub/core';

EmailProviderFactoryRegistry.registerEmailProviderFactory('resend', ResendEmailProviderFactory);

export default ResendEmailProviderFactory;
