export * from './Factory';
export * from './Provider';
export * from './RequestSender';
export * from './Transformer';
export * from './Type';

import { EmailProviderFactoryRegistry } from '@messagehub/core';
import { MailgunEmailProviderFactory } from './Factory';

EmailProviderFactoryRegistry.registerEmailProviderFactory('mailgun', MailgunEmailProviderFactory);

// default export so that core factory can use it directly
export default MailgunEmailProviderFactory;
