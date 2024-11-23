import type { TypeBaseConfig } from '@messagehub/core';
import type { RequireAtLeastOne } from 'type-fest';

/**
 * Interface representing the configuration for the Resend email provider.
 * This extends the base configuration type from the core package.
 */
export interface TypeResendConfig extends TypeBaseConfig
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	RESEND_API_KEY: string; // API key for authenticating with the Resend API
	// eslint-disable-next-line @typescript-eslint/naming-convention
	RESEND_API_URL?: string; // Optional custom API URL
}

interface Attachment
{
	/** Content of an attached file. */
	content?: string | Buffer;
	/** Name of attached file. */
	filename?: string | false | undefined;
	/** Path where the attachment file is hosted */
	path?: string;
}

export type Tag = {
	/**
	 * The name of the email tag. It can only contain ASCII letters (a–z, A–Z), numbers (0–9), underscores (_), or dashes (-). It can contain no more than 256 characters.
	 */
	name: string;
	/**
	 * The value of the email tag. It can only contain ASCII letters (a–z, A–Z), numbers (0–9), underscores (_), or dashes (-). It can contain no more than 256 characters.
	 */
	value: string;
};

/**
 * Interface representing the email message format required by the Resend API.
 */
interface CreateEmailBaseOptions
{
	/**
	 * Filename and content of attachments (max 40mb per email)
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	attachments?: Attachment[];
	/**
	 * Blind carbon copy recipient email address. For multiple addresses, send as an array of strings.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	bcc?: string | string[];
	/**
	 * Carbon copy recipient email address. For multiple addresses, send as an array of strings.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	cc?: string | string[];
	/**
	 * Sender email address. To include a friendly name, use the format `"Your Name <sender@domain.com>"`
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	from: string;
	/**
	 * Custom headers to add to the email.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	headers?: Record<string, string>;
	/**
	 * The HTML version of the message.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	html?: string;
	/**
	 * The plain text version of the message.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	text?: string;
	/**
	 * Reply-to email address. For multiple addresses, send as an array of strings.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	reply_to?: string | string[];
	/**
	 * Email subject.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	subject: string;
	/**
	 * Email tags
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	tags?: Tag[];
	/**
	 * Recipient email address. For multiple addresses, send as an array of strings. Max 50.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	to: string | string[];
}

export type TypeResendEmailMessage = RequireAtLeastOne<CreateEmailBaseOptions, 'html' | 'text'>;

export interface TypeResendErrorResponse
{
	statusCode: number;
	message: string;
	name: string;
}
