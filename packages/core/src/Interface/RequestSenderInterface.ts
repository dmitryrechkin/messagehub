export interface RequestSenderInterface
{
	/**
	 * Sends a request to a given URL.
	 *
	 * @param {string} url - The endpoint URL
	 * @param {RequestInit} options - The request options (method, headers, body, etc.)
	 * @param {unknown[]} args - Additional arguments
	 * @returns {Promise<Response>} - A promise that resolves to the response
	 */
	send(url: string, options: RequestInit, ...args: unknown[]): Promise<Response>;
}
