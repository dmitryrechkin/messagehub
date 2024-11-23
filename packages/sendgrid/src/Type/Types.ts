import type { TypeBaseConfig } from '@messagehub/core';

/**
 * Configuration interface for the SendGrid email provider.
 * Extends the base configuration type.
 */
export interface TypeSendGridConfig extends TypeBaseConfig {
	/**
	 * The SendGrid API key used for authentication.
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	SENDGRID_API_KEY: string;

	/**
	 * Optional custom API URL for SendGrid.
	 * Defaults to SendGrid's official API endpoint.
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	SENDGRID_API_URL?: string;
}

/**
 * Interface representing an email message formatted for SendGrid's API.
 */
export interface TypeSendGridMessage {
	/**
	 * An array of personalization objects.
	 * Each object can contain recipients, subject, and other personalization fields.
	 */
	personalizations: Array<{
		to: Array<{
			email: string;
			name?: string;
		}>;
		cc?: Array<{
			email: string;
			name?: string;
		}>;
		bcc?: Array<{
			email: string;
			name?: string;
		}>;
		subject?: string;
		/**
		 * Custom dynamic templates can be specified using dynamic_template_data.
		 * This allows for personalization of emails using Handlebars syntax.
		 */
		// eslint-disable-next-line @typescript-eslint/naming-convention
		dynamic_template_data?: Record<string, any>;
	}>;

	/**
	 * The sender of the email.
	 */
	from: {
		email: string;
		name?: string;
	};

	/**
	 * (Optional) The reply-to email address.
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	reply_to?: {
		email: string;
		name?: string;
	};

	/**
	 * An array of content objects specifying the MIME type and content of the email.
	 * Typically includes 'text/plain' and 'text/html' parts.
	 */
	content: Array<{
		type: string; // e.g., 'text/plain', 'text/html'
		value: string;
	}>;

	/**
	 * (Optional) Array of attachments.
	 * Each attachment must include the content (base64-encoded), filename, type, and disposition.
	 */
	attachments?: Array<{
		content: string; // Base64 encoded string
		filename: string;
		type?: string; // MIME type, e.g., 'application/pdf'
		disposition?: string; // 'attachment' or 'inline'
	}>;

	/**
	 * (Optional) Custom headers to include in the email.
	 */
	headers?: Record<string, string>;

	/**
	 * (Optional) ASM (Advanced Suppression Manager) settings for unsubscribe groups.
	 */
	asm?: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		group_id: number;
	};
}

