import type { TypeEmailMessage, TransformerInterface } from '@messagehub/core';
import type { TypeSendGridMessage } from '../Type/Types';

/**
 * Transforms a TypeEmailMessage object to a TypeSendGridMessage object.
 */
export class ToSendGridEmailMessageTransformer implements TransformerInterface<TypeEmailMessage, TypeSendGridMessage>
{
	/**
	 * Transforms a TypeEmailMessage into SendGrid's email format.
	 *
	 * @param {TypeEmailMessage | undefined} message - The custom email message object.
	 * @returns {TypeSendGridMessage | undefined} - The transformed email object.
	 */
	public transform(message: TypeEmailMessage | undefined): TypeSendGridMessage | undefined
	{
		if (!message)
		{
			return undefined;
		}

		const emailData: TypeSendGridMessage = {
			personalizations: [
				{
					to: message.to?.map(addr => ({ email: addr.email, name: addr.name })) || [],
					cc: message.cc?.map(addr => ({ email: addr.email, name: addr.name })) || undefined,
					bcc: message.bcc?.map(addr => ({ email: addr.email, name: addr.name })) || undefined,
					subject: message.subject || ''
				}
			],
			from: {
				email: message.from?.[0]?.email || '',
				name: message.from?.[0]?.name || ''
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			reply_to: message.replyTo?.[0] ? {
				email: message.replyTo?.[0]?.email || '',
				name: message.replyTo?.[0]?.name || ''
			} : undefined,
			content: [
				{
					type: 'text/plain',
					value: message.text || ''
				},
				{
					type: 'text/html',
					value: message.html || ''
				}
			],
			headers: message.headers || {}
		};

		// Handle attachments
		if (message.attachments && message.attachments.length > 0)
		{
			emailData.attachments = message.attachments.map((attachment) =>
			{
				if (!attachment.content || !attachment.filename)
				{
					// Skip attachments without content or filename
					return null;
				}

				return {
					content: attachment.content, // Use the base64-encoded content directly
					filename: attachment.filename,
					type: 'application/octet-stream',
					disposition: 'attachment'
				};
			}).filter(att => att !== null) as TypeSendGridMessage['attachments'];
		}

		return emailData;
	}
}
