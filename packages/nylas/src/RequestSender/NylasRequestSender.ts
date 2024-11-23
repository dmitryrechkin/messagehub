import type { RequestSenderInterface } from '@messagehub/core';
import type { TypeNylasConfig } from '../Type/Types';

export class NylasRequestSender implements RequestSenderInterface
{
	/**
	 * Constructor.
	 *
	 * @param {TypeNylasConfig} config - The Nylas configuration object.
	 */
	public constructor(private readonly config: TypeNylasConfig) {}

	/**
	 * Sends a request to the Nylas API
	 *
	 * @param {string} path - The endpoint URL
	 * @param {RequestInit} options - The request options (method, headers, body, etc.)
	 * @param {boolean} includeGrantId - Whether to include the grant ID in the URL
	 * @returns {Promise<Response>} - A promise that resolves to the response
	 */
	public async send(path: string, options: RequestInit = {}, includeGrantId: boolean = true): Promise<Response>
	{
		const headers = new Headers(options.headers || {});
		// eslint-disable-next-line @typescript-eslint/naming-convention
		headers.append('Authorization', `Bearer ${this.config.NYLAS_API_KEY}`);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		headers.append('Content-Type', 'application/json');

		const apiUrl = this.config.NYLAS_API_URL || 'https://api.us.nylas.com';

		const url = apiUrl + '/v3' + (includeGrantId ? `/grants/${this.config.NYLAS_GRANT_ID}` : '') + path;

		return fetch(url, {
			...{ ...options, headers }
		})
			.catch(error =>
			{
				// Handle the exception and return a custom Response object
				const responseInit: ResponseInit = {
					status: 500,
					statusText: error.message
				};
				// Return a Response object with an appropriate error message
				return new Response(null, responseInit);
			});
	 }
}
