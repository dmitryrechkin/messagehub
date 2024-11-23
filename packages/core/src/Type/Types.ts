import type { z } from 'zod';
import type { emailAddressSchema, emailAttachmentResponseSchema, emailMessageAttachmentSchema, emailMessageResponseSchema, emailMessageSchema, emailMessageThreadSchema, responseMessageSchema } from './ZodSchemas';

// Base configuration for all configuration types, the expectation is that each provider will have its own configuration type that extends this.
export interface TypeBaseConfig
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	MESSAGE_PROVIDER: string;
}

// Infer the TypeScript types from the Zod schemas
export interface TypeEmailAddress extends z.infer<typeof emailAddressSchema> {}
export interface TypeEmailMessage extends z.infer<typeof emailMessageSchema> {}
export interface TypeEmailMessageAttachment extends z.infer<typeof emailMessageAttachmentSchema> {}
export interface TypeEmailMessageThread extends z.infer<typeof emailMessageThreadSchema> {}
export interface TypeResponseMessage extends z.infer<typeof responseMessageSchema> {}
export interface TypeEmailMessageResponse extends z.infer<typeof emailMessageResponseSchema> {}
export interface TypeEmailAttachmentResponse extends z.infer<typeof emailAttachmentResponseSchema> {}
