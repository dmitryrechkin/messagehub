import { Base64 } from '@dmitryrechkin/base64';
import type { TypeEmailMessage, TypeEmailAddress, TypeEmailMessageAttachment, TransformerInterface } from '@messagehub/core';
import type { TypeNylasEmail, TypeNylasEmailAddress, TypeNylasEmailAttachment } from '../Type/Types';


export class ToNylasEmailTransformer implements TransformerInterface<TypeEmailMessage, TypeNylasEmail>
{
	/**
	 * Transforms a custom TypeEmailMessage object to a Nylas TypeNylasEmail object.
	 *
	 * @param {TypeEmailMessage | undefined} input - The custom email message object
	 * @returns {TypeNylasEmail | undefined} - The transformed Nylas email object
	 */
	public transform(input: TypeEmailMessage | undefined): TypeNylasEmail | undefined
	{
		if (!input)
		{
			return undefined;
		}

		return {
			id: input.id,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			reply_to_message_id: input.replyToMessageId,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			send_at: input.scheduledAt,
			body: input.html || input.text || '',
			subject: input.subject || '',
			from: this.transformAddresses(input.from),
			to: this.transformAddresses(input.to),
			cc: this.transformAddresses(input.cc),
			bcc: this.transformAddresses(input.bcc),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			reply_to: this.transformAddresses(input.replyTo),
			attachments: this.transformAttachments(input.attachments),
			date: input.scheduledAt || Math.floor(new Date().getTime() / 1000),
			folders: [], // Add logic if folders are required
			// eslint-disable-next-line @typescript-eslint/naming-convention
			grant_id: '' // Needs to be populated from the context
		};
	}

	/**
	 * Transforms an array of TypeEmailAddress objects to an array of TypeNylasEmailAddress objects.
	 *
	 * @param {TypeEmailAddress[] | undefined} addresses - The custom message addresses
	 * @returns {TypeNylasEmailAddress[]} - The transformed Nylas email addresses
	 */
	private transformAddresses(addresses?: TypeEmailAddress[]): TypeNylasEmailAddress[]
	{
		if (!addresses)
		{
			return [];
		}

		return addresses.map(address => ({
			email: address.email,
			name: address.name
		}));
	}

	/**
	 * Transforms an array of TypeAttachment objects to an array of TypeNylasAttachment objects.
	 *
	 * @param {TypeAttachment[] | undefined} attachments - The custom attachments
	 * @returns {TypeNylasAttachment[]} - The transformed Nylas attachments
	 */
	private transformAttachments(attachments?: TypeEmailMessageAttachment[]): TypeNylasEmailAttachment[]
	{
		if (!attachments)
		{
			return [];
		}

		return attachments.map(attachment => ({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			content_disposition: attachment.contentDisposition,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			content_type: this.detectContentType(attachment.filename),
			filename: attachment.filename,
			content: attachment.content,
			size: attachment.content ? Base64.decode(attachment.content).length : 0
		}));
	}

	/**
	 * Detects the content type of a file based on its filename.
	 *
	 * @param {string | undefined} filename - The filename of the attachment
	 * @returns {string} - The detected content type (default to 'application/octet-stream')
	 */
	private detectContentType(filename?: string): string
	{
		if (!filename)
		{
			return 'application/octet-stream';
		}

		const ext = filename.split('.').pop()?.toLowerCase();
		switch (ext)
		{
			case 'pdf': return 'application/pdf';
			case 'jpg': case 'jpeg': return 'image/jpeg';
			case 'png': return 'image/png';
			case 'doc': case 'docx': return 'application/msword';
			default: return 'application/octet-stream';
		}
	}
}
