import type { TypeEmailAttachmentResponse } from '../Type';

export interface EmailAttachmentHandlerInterface
{
	/**
	 * Downloads an attachment by its ID.
	 *
	 * @param {string} attachmentId - The ID of the attachment to download.
	 * @returns {Promise<TypeEmailAttachmentResponse>} - The binary data of the attachment.
	 */
	downloadAttachment(attachmentId: string): Promise<TypeEmailAttachmentResponse>;
}
