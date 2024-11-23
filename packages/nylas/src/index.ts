export * from './Factory';
export * from './Provider';
export * from './RequestSender';
export * from './Transformer';
export * from './Type';

// default export so that core factory can use it directly
import { NylasEmailProviderFactory } from './Factory';
export default NylasEmailProviderFactory;
