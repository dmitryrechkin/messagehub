import type { TypeEmailMessage } from '@messagehub/core';
import type { TransformerInterface } from '@messagehub/core';
import type { TypeResendEmailMessage } from '../Type/Types';

/**
 * Transformer class for converting TypeEmailMessage to the format required by the Resend API.
 */
export class ToResendEmailMessageTransformer implements TransformerInterface<TypeEmailMessage, TypeResendEmailMessage>
{
	/**
	 * Transforms a TypeEmailMessage to the format required by the Resend API.
	 *
	 * @param {TypeEmailMessage} message - The email message to transform.
	 * @returns {TypeResendEmailMessage} - The transformed email message for the Resend API.
	 */
	public transform(message: TypeEmailMessage | undefined): TypeResendEmailMessage | undefined
	{
		if (!message)
		{
			return undefined;
		}

		return {
			from: message.from && message.from.length > 0 ? message.from[0].email : '', // Default to empty string if undefined
			to: message.to ? message.to.map(addr => addr.email) : [], // Default to empty array if undefined
			subject: message.subject || '', // Default to empty string if undefined
			html: message.html || undefined, // Optional
			text: message.text || '', // Default to empty string if undefined
			bcc: message.bcc ? message.bcc.map(addr => addr.email) : undefined, // Map if defined
			cc: message.cc ? message.cc.map(addr => addr.email) : undefined, // Map if defined
			// eslint-disable-next-line @typescript-eslint/naming-convention
			reply_to: message.replyTo ? message.replyTo.map(addr => addr.email) : undefined, // Map if defined
			attachments: message.attachments ? message.attachments.map(att => ({
				filename: att.filename,
				content: att.content || '' // Ensure content is a string
			})) : undefined, // Transform attachments
			headers: message.headers || {}, // Default to empty object if undefined
			tags: message.tags || [] // Default to empty array if undefined
		};
	}
}
