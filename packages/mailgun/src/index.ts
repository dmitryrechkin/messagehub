export * from './Factory';
export * from './Provider';
export * from './RequestSender';
export * from './Transformer';
export * from './Type';

// default export so that core factory can use it directly
import { MailgunEmailProviderFactory } from './Factory';
export default MailgunEmailProviderFactory;
