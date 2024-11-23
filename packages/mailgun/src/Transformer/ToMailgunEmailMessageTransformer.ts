import type { TypeEmailMessage, TransformerInterface } from '@messagehub/core';
import { Base64 } from '@dmitryrechkin/base64';

export class ToMailgunEmailMessageTransformer implements TransformerInterface<TypeEmailMessage, FormData>
{
	/**
	 * Transforms a custom TypeEmailMessage object to a FormData object.
	 *
	 * @param {TypeEmailMessage | undefined} message - The custom email message object
	 * @returns {FormData | undefined} - The FormData object
	 */
	public transform(message: TypeEmailMessage | undefined): FormData | undefined
	{
		if (!message)
		{
			return undefined;
		}

		const formData = new FormData();
		formData.append('from', message.from?.[0]?.email || '');
		formData.append('to', message.to?.map(addr => addr.email).join(',') || '');
		formData.append('subject', message.subject || '');
		formData.append('text', message.text || '');

		if (message.html)
		{
			formData.append('html', message.html);
		}

		if (message.cc && message.cc.length > 0)
		{
			formData.append('cc', message.cc.map(addr => addr.email).join(','));
		}

		if (message.bcc && message.bcc.length > 0)
		{
			formData.append('bcc', message.bcc.map(addr => addr.email).join(','));
		}

		if (message.replyTo && message.replyTo.length > 0)
		{
			formData.append('h:Reply-To', message.replyTo.map(addr => addr.email).join(','));
		}

		for (const [key, value] of Object.entries(message.headers ?? {}))
		{
			formData.append(`h:${key}`, value);
		}

		if (message.tags && message.tags.length > 0)
		{
			formData.append('o:tag', message.tags.map(tag => tag.name).join(','));
		}

		// Handle attachments
		message.attachments?.forEach((attachment, index) =>
		{
			try
			{
				const decodedContent = Base64.decode(attachment.content ?? '');
				const blob = new Blob([decodedContent], { type: 'application/octet-stream' });
				const filename = attachment.filename || `attachment-${index}`;
				formData.append('attachment', blob, filename);
			}
			catch (error)
			{
			}
		});

		return formData;
	}
}
