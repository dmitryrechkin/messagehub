import type { TypeEmailMessage, TypeEmailMessageResponse } from '../Type/Types';

/**
 * Interface representing an email sender.
 */
export interface EmailSenderInterface
{
	/**
	 * Sends an email based on the provided EmailMessage.
	 *
	 * @param {TypeEmailMessage} message - The email message to be sent.
	 * @returns {Promise<TypeEmailMessageResponse>} - A promise that resolves to the response of the email sending operation.
	 */
	send(message: TypeEmailMessage): Promise<TypeEmailMessageResponse>;
}
