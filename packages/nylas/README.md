# MessageHub Nylas

**MessageHub Nylas is a TypeScript library that provides integration with the Nylas email service, allowing for seamless email sending capabilities within your applications.** This package extends the core functionality of MessageHub to support Nylas as an email provider.

## Installation

Install the package using pnpm:

```bash
pnpm add @messagehub/nylas
```

## Features

- **Email Sending**: Easily send emails using the Nylas API.
- **Attachment Support**: Send emails with attachments.
- **Requires Core Package**: This package requires the `@messagehub/core` package for functionality.

## Usage

### Sending an Email

The `sendEmail` function can be used as follows:

```typescript
import { sendEmail } from '@messagehub/core';
// Import the provider package to trigger self-registration
import '@messagehub/nylas';

const emailMessage = {
  from: [{ email: 'sender@example.com', name: 'Sender Name' }],
  to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
  subject: 'Hello from MessageHub Nylas',
  text: 'This is a test email sent using MessageHub with Nylas.',
  html: '<p>This is a test email sent using MessageHub with Nylas.</p>',
  attachments: [
    {
      content: 'base64-encoded-content',
      filename: 'attachment.txt',
      path: '/path/to/attachment.txt',
    },
  ],
};

const config = {
  MESSAGE_PROVIDER: 'nylas',
  NYLAS_API_KEY: process.env.NYLAS_API_KEY,
  NYLAS_GRANT_ID: process.env.NYLAS_GRANT_ID,
  NYLAS_API_URL: process.env.NYLAS_API_URL // Optional
};

sendEmail(emailMessage, config)
  .then(response => {
    if (response.success) {
      console.log('Email sent successfully:', response.data);
    } else {
      console.error('Error sending email:', response.messages);
    }
  })
  .catch(error => {
    console.error('Error sending email:', error);
  });
```

### Configuration

Configuration for the `sendEmail` function can be defined in a `.env` file. The naming convention for the configuration variables is as follows:

- `MESSAGE_PROVIDER`: The name of the provider to use.
- `NYLAS_API_KEY`: The API key for authenticating with the Nylas API.
- `NYLAS_GRANT_ID`: The Grant ID for authenticating with the connected email account with Nylas API.
- `NYLAS_API_URL`: An optional custom API URL.

Example `.env` file:

```
NYLAS_API_KEY=your_nylas_api_key
NYLAS_GRANT_ID=your_nylas_grant_id
NYLAS_API_URL=https://api.nylas.com
```

### Extensibility

The `@messagehub/nylas` package is an implementation of the Nylas email provider. The core functionality is provided by the `@messagehub/core` package, which is designed to be extensible. You can create new email providers by implementing the `EmailProviderFactoryInterface` and `EmailSenderInterface` in the core package. This allows you to add support for additional email services in the future.

## Rationale

The `@messagehub/nylas` package is designed to provide integration with the Nylas API for managing email sending workflows in TypeScript applications. By using the core package, developers can easily integrate Nylas capabilities into their domain-driven designs and AI-driven processes.

## Contributing

Contributions are welcome! Feel free to fork this project and submit pull requests. Before submitting, please ensure your code passes all linting and unit tests.

You can format code using:

```bash
pnpm format
```

You can run unit tests using:

```bash
pnpm test
