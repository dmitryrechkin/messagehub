export * from './Factory';
export * from './Provider';
export * from './Transformer';
export * from './Type';

// default export so that core factory can use it directly
import { ResendEmailProviderFactory } from './Factory';
export default ResendEmailProviderFactory;
