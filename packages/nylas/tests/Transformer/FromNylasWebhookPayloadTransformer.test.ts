import { describe, it, expect } from 'vitest';
import { convert } from 'html-to-text';
import {
	FromNylasWebhookPayloadTransformer
} from '../../src/Transformer/FromNylasWebhookPayloadTransformer';
import {
	type TypeNylasMessageWebhookPayload
} from '../../src/Type/Types';



describe('FromNylasWebhookPayloadTransformer', () =>
{
	const transformer = new FromNylasWebhookPayloadTransformer();

	it('should correctly transform a Nylas webhook payload to a TypeMessageThread object', () =>
	{
		// Sample payload data
		const webhookPayload: TypeNylasMessageWebhookPayload = {
			specversion: '1.0',
			type: 'message.created',
			source: '/google/emails/realtime',
			id: 'sample_id',
			time: 1723396754,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			webhook_delivery_attempt: 1,
			data: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				application_id: 'c4de3da4-dcfb-424c-a944-0de8bcaea39a',
				object: {
					attachments: [
						{
							// eslint-disable-next-line @typescript-eslint/naming-convention
							content_disposition: 'attachment; filename="Test.pdf"',
							// eslint-disable-next-line @typescript-eslint/naming-convention
							content_id: 'f_lzp2unnb0',
							// eslint-disable-next-line @typescript-eslint/naming-convention
							content_type: 'application/pdf; name="Test.pdf"',
							filename: 'Test.pdf',
							// eslint-disable-next-line @typescript-eslint/naming-convention
							grant_id: '7e477edc-618a-400f-8956-bd1d98e95a10',
							id: 'v0:VGVzdC5wZGY=:YXBwbGljYXRpb24vcGRmOyBuYW1lPSJUZXN0LnBkZiI=:10132',
							// eslint-disable-next-line @typescript-eslint/naming-convention
							is_inline: false,
							size: 10132
						}
					],
					bcc: [],
					body: '<div dir="ltr">Hi there, I wanted to book an appointment?<div><br></div><div>THanks!</div></div>\r\n',
					cc: [],
					date: 1723351273,
					folders: ['INBOX'],
					from: [{ email: 'user@example.com', name: 'User Name' }],
					// eslint-disable-next-line @typescript-eslint/naming-convention
					grant_id: '7e477edc-618a-400f-8956-bd1d98e95a10',
					id: '1913fbdc4e4ebeac',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					reply_to: [],
					snippet: 'Hi there, I wanted to book an appointment? THanks!',
					starred: false,
					subject: 'Booking Request',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					thread_id: '1913fbdc4e4ebeac',
					to: [{ email: 'agent@company.com' }],
					unread: true
				}
			}
		};

		// Perform the transformation
		const chat = transformer.transform(webhookPayload);

		// Assertions
		expect(chat.id).toBe('1913fbdc4e4ebeac');
		expect(chat.to).toEqual([{email: 'agent@company.com'}]);
		expect(chat.cc).toEqual([]);
		expect(chat.from).toEqual([{email:'user@example.com', name: 'User Name'}]);
		expect(chat.messages.length).toBe(1);

		const message = chat.messages[0];
		expect(message.id).toBe('1913fbdc4e4ebeac');
		expect(message.text).toBe(convert(webhookPayload.data.object.body));
		expect(message.attachments?.length).toBe(1);

		const attachment = message.attachments && message.attachments[0];
		expect(attachment?.path).toBe('/attachments/v0:VGVzdC5wZGY=:YXBwbGljYXRpb24vcGRmOyBuYW1lPSJUZXN0LnBkZiI=:10132/download?message_id=1913fbdc4e4ebeac');
		expect(attachment?.filename).toBe('Test.pdf');
	});

	it('should mark the message as AGENT when the sender email matches the agentEmail', () =>
	{
		// Sample payload where the agent is the sender
		const webhookPayload: TypeNylasMessageWebhookPayload = {
			specversion: '1.0',
			type: 'message.created',
			source: '/google/emails/realtime',
			id: 'sample_id',
			time: 1723396754,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			webhook_delivery_attempt: 1,
			data: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				application_id: 'c4de3da4-dcfb-424c-a944-0de8bcaea39a',
				object: {
					attachments: [],
					bcc: [],
					body: '<div dir="ltr">I\'ve booked it for you.</div>',
					cc: [],
					date: 1723351273,
					folders: ['SENT'],
					from: [{ email: 'agent@company.com', name: 'Agent Name' }],
					// eslint-disable-next-line @typescript-eslint/naming-convention
					grant_id: '7e477edc-618a-400f-8956-bd1d98e95a10',
					id: '1913fbdc4e4ebeac',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					reply_to: [],
					snippet: 'I\'ve booked it for you.',
					starred: false,
					subject: 'Re: Booking Request',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					thread_id: '1913fbdc4e4ebeac',
					to: [{ email: 'user@example.com' }],
					unread: false
				}
			}
		};

		// Perform the transformation
		const chat = transformer.transform(webhookPayload);

		// Assertions
		const message = chat.messages[0];
		expect(message.from).toStrictEqual([{email: 'agent@company.com', name: 'Agent Name'}]);
		expect(message.text).toContain('I\'ve booked it for you.');
	});

	it('should correctly parse a user message and strip quoted text', () =>
	{
		const webhookPayload = {
			specversion: '1.0',
			type: 'message.created',
			source: '/google/emails/realtime',
			id: '9xGZMdU3a4PYSaD7NZQm4m1672',
			time: 1723401672,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			webhook_delivery_attempt: 1,
			data: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				application_id: 'c4de3da4-dcfb-424c-a944-0de8bcaea39a',
				object: {
					attachments: [],
					bcc: [],
					body: '<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body style="overflow-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;">Yes, but room is unavailable, what do you want from us?<br id="lineBreakAtBeginningOfMessage"><div><br><blockquote type="cite"><div>On Aug 11, 2024, at 11:40, ModVictoria Bot &lt;bot.modvictoria@gmail.com&gt; wrote:</div><br class="Apple-interchange-newline"><div><div dir="ltr">I understand your replay, but I still want to book this room!</div><br><div class="gmail_quote"><div dir="ltr" class="gmail_attr">On Sun, Aug 11, 2024 at 11:03 AM Dmitry Rechkin &lt;<a href="mailto:rechkin@gmail.com">rechkin@gmail.com</a>&gt; wrote:<br></div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"><div>Yeah, I’m doing very good thanks!<br id="m_6740165586270334136lineBreakAtBeginningOfMessage"><div><br><blockquote type="cite"><div>On Aug 11, 2024, at 10:19, ModVictoria Bot &lt;<a href="mailto:bot.modvictoria@gmail.com" target="_blank">bot.modvictoria@gmail.com</a>&gt; wrote:</div><br><div><div dir="ltr">I\'m doing well and you?</div><br><div class="gmail_quote"><div dir="ltr" class="gmail_attr">On Sat, Aug 10, 2024 at 9:41 PM Dmitry Rechkin &lt;<a href="mailto:rechkin@gmail.com" target="_blank">rechkin@gmail.com</a>&gt; wrote:<br></div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"><div dir="ltr">Hi there, I wanted to book an appointment?<div><br></div><div>THanks!</div></div>\r\n</blockquote></div>\r\n</div></blockquote></div><br></div></blockquote></div>\r\n</div></blockquote></div><br></body></html>',
					cc: [],
					date: 1723401655,
					from: [{ email: 'rechkin@gmail.com', name: 'Dmitry Rechkin' }],
					// eslint-disable-next-line @typescript-eslint/naming-convention
					grant_id: '7e477edc-618a-400f-8956-bd1d98e95a10',
					id: '19142be8bcaa1358',
					object: 'message',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					reply_to: [],
					snippet: 'Yes, but room is unavailable, what do you want from us?',
					starred: false,
					subject: 'Re: Hey, how are you?',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					thread_id: '1913fbdc4e4ebeac',
					to: [{ email: 'bot.modvictoria@gmail.com', name: 'ModVictoria Bot' }],
					unread: true
				}
			}
		};

		const expectedText = 'Yes, but room is unavailable, what do you want from us?';

		const chat = transformer.transform(webhookPayload);
		expect(chat.messages[0].text).toBe(expectedText);
	});
});
