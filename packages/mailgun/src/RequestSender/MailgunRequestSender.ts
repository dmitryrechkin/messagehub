import type { RequestSenderInterface } from '@messagehub/core';
import { Base64 } from '@dmitryrechkin/base64';
import type { TypeMailgunConfig } from '../Type/Types';

export class MailgunRequestSender implements RequestSenderInterface
{
	/**
	 * Creates a new instance of the MailgunRequestSender class.
	 *
	 * @param {TypeMailgunConfig} config - The Mailgun configuration object.
	 */
	public constructor(private readonly config: TypeMailgunConfig) {}

	/**
	 * Sends a request to the Nylas API
	 *
	 * @param {string} path - The endpoint URL
	 * @param {RequestInit} options - The request options (method, headers, body, etc.)
	 * @returns {Promise<Response>} - A promise that resolves to the response
	 */
	public async send(path: string, options: RequestInit = {}): Promise<Response>
	{
		const headers = new Headers(options.headers || {});
		headers.append('Authorization', `Basic ${Base64.encode(new TextEncoder().encode(`api:${this.config.MAILGUN_API_KEY}`))}`);

		const apiUrl = this.config.MAILGUN_API_URL || 'https://api.mailgun.net';
		const url = `${apiUrl}/v3/${this.config.MAILGUN_DOMAIN}${path}`;

		return fetch(url, {
			...options,
			headers
		}).catch((error: unknown) =>
		{
			const responseInit: ResponseInit = {
				status: 500,
				statusText: (error instanceof Error) ? error.message : 'An unknown error occurred.'
			};
			return new Response(null, responseInit);
		});
	}
}
