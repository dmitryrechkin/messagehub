import type { RequestSenderInterface } from '@messagehub/core';
import type { TypeSendGridConfig } from '../Type/Types';

/**
 * Handles HTTP requests to SendGrid's API.
 */
export class SendGridRequestSender implements RequestSenderInterface
{
	/**
	 * Constructs a new SendGridRequestSender.
	 *
	 * @param {TypeSendGridConfig} config - The SendGrid configuration.
	 */
	public constructor(private readonly config: TypeSendGridConfig) {}

	/**
	 * Sends a request to the SendGrid API.
	 *
	 * @param {string} path - The API endpoint path.
	 * @param {RequestInit} options - The request options (method, headers, body, etc.).
	 * @returns {Promise<Response>} - The response from the SendGrid API.
	 */
	public async send(path: string, options: RequestInit = {}): Promise<Response>
	{
		const headers = new Headers(options.headers || {});
		headers.append('Authorization', `Bearer ${this.config.SENDGRID_API_KEY}`);
		headers.append('Content-Type', 'application/json');

		const apiUrl = this.config.SENDGRID_API_URL || 'https://api.sendgrid.com';
		const url = `${apiUrl}/v3${path.startsWith('/') ? '' : '/'}${path}`;

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
