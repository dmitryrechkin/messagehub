import { EmailProviderFactory } from "../Factory";
import type { TypeBaseConfig, TypeEmailMessage, TypeEmailMessageResponse } from "../Type";

/**
 * Send email
 * 
 * @param {TypeEmailMessage} emailMessage - Email message
 * @param {TypeBaseConfig} config - Configuration
 * @returns {Promise<TypeEmailMessageResponse>} - Email message response
 */
export const sendEmail = async (emailMessage: TypeEmailMessage, config: TypeBaseConfig): Promise<TypeEmailMessageResponse> => 
{
	const sender = await (new EmailProviderFactory()).createSender(config);

	return sender.send(emailMessage);
}
