export * from './Factory';
export * from './Provider';
export * from './RequestSender';
export * from './Transformer';
export * from './Type';

// default export so that core factory can use it directly
import { NylasEmailProviderFactory } from './Factory';
import { EmailProviderFactoryRegistry } from '@messagehub/core';

EmailProviderFactoryRegistry.registerEmailProviderFactory('nylas', NylasEmailProviderFactory);

export default NylasEmailProviderFactory;
