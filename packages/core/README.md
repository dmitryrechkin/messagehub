# MessageHub Core

**MessageHub Core is a TypeScript library that provides foundational classes, interfaces, and tools for handling and processing messages within domain-driven and AI applications.** This package offers a set of abstractions that make it easier to manage messaging workflows, including sending and receiving messages across different channels.

## Supported Packages

The `@messagehub/core` package supports several email service providers, including:

- **Mailgun**: Integration with the Mailgun email service for sending emails.
- **Nylas**: Integration with the Nylas email service for sending emails.
- **Resend**: Integration with the Resend email service for sending emails.
- **SendGrid**: Integration with the SendGrid email service for sending emails.

### Adding New Providers

To add a new email provider, you can implement the `EmailProviderFactoryInterface` and `EmailSenderInterface`. Here’s a brief example of how to implement a new provider:

1. **Create a New Folder**: Create a new folder for your provider (e.g., `packages/myprovider`).
2. **Implement the Factory**: Create a factory class that implements the `EmailProviderFactoryInterface`. This class should have a method to create an email sender instance.

   Example:
   ```typescript
   import { MyProviderEmailSender } from './Provider/MyProviderEmailSender';
   import type { TypeMyProviderConfig } from './Type/Types';
   import type { EmailProviderFactoryInterface, EmailSenderInterface } from '@messagehub/core';

   export class MyProviderEmailProviderFactory implements EmailProviderFactoryInterface<TypeMyProviderConfig> {
       public async createSender(config: TypeMyProviderConfig): Promise<EmailSenderInterface> {
           return new MyProviderEmailSender(config);
       }
   }
   ```

3. **Implement the Email Sender**: Create a class that implements the `EmailSenderInterface`. This class should handle the logic for sending emails.

   Example:
   ```typescript
   import type { TypeEmailMessage, TypeEmailMessageResponse, EmailSenderInterface } from '@messagehub/core';

   export class MyProviderEmailSender implements EmailSenderInterface {
       constructor(private config: TypeMyProviderConfig) {}

       public async send(message: TypeEmailMessage): Promise<TypeEmailMessageResponse> {
           // Implement the logic to send the email using your provider's API
           // It is recommended to use transformers and types for consistency
       }
   }
   ```

4. **Use Transformers and Types**: It is recommended to use transformers and types to ensure consistency in the data being processed. This helps maintain the expected structure and format across different email providers.

### Folder Structure

The folder structure for each package typically includes:

- `src/`: Contains the source code for the package, including:
  - `Factory/`: Contains factory classes for creating email providers.
  - `Provider/`: Contains classes that implement the email sending logic.
  - `Transformer/`: Contains classes for transforming email messages to the required format.
  - `Type/`: Contains type definitions and interfaces.
- `tests/`: Contains unit tests for the package.
- `README.md`: Documentation for the package.
- `.env`: Environment variables for configuration.

## Installation

Install the package using pnpm:

```bash
pnpm add @messagehub/core
```

## Features

- **Unified Messaging Interfaces**: Define consistent interfaces for handling message-related actions, such as downloading attachments, sending messages, and handling webhooks.
- **AI Integration Ready**: Tools are designed to wrap actions and services, allowing them to be easily integrated into AI workflows, especially with structured validation using Zod.
- **Extensible and Reusable**: Easily extend the provided base classes and interfaces to fit your specific messaging needs.

## Usage

### Sending an Email

The `sendEmail` function is the primary method for sending emails. It can be used as follows:

```typescript
import { sendEmail } from '@messagehub/core';

const emailMessage = {
  from: [{ email: 'sender@example.com', name: 'Sender Name' }],
  to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
  subject: 'Hello from MessageHub',
  text: 'This is a test email sent using MessageHub.',
  html: '<p>This is a test email sent using MessageHub.</p>',
  attachments: [
    {
      content: 'base64-encoded-content',
      filename: 'attachment.txt',
      path: '/path/to/attachment.txt',
    },
  ],
};

const config = {
  MESSAGE_PROVIDER: process.env.MESSAGE_PROVIDER, // any supported service from @messagehub/[MESSAGE_PROVIDER]
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_API_URL: process.env.RESEND_API_URL,
};

sendEmail(emailMessage, config)
  .then(response => {
    console.log('Email sent successfully:', response);
  })
  .catch(error => {
    console.error('Error sending email:', error);
  });
```

### Configuration

Configuration for the `sendEmail` function can be defined in a `.env` file. The naming convention for the configuration variables is as follows:

- `MESSAGE_PROVIDER`: The email service provider (e.g., 'sendgrid', 'mailgun', 'resend').
- `RESEND_API_KEY`: The API key for authenticating with the Resend API, for Nylas it will be `NYLAS_API_KEY`, and so on...
- `RESEND_API_URL`: An optional custom API URL.

Example `.env` file:

```
RESEND_API_KEY=your_resend_api_key
RESEND_API_URL=https://api.resend.com
```

### Extensibility

The `@messagehub/core` package is designed to be extensible. You can create new email providers by implementing the `EmailProviderFactoryInterface` and `EmailSenderInterface`. This allows you to add support for additional email services in the future.

## Rationale

The `@messagehub/core` package is designed to provide a consistent and extensible foundation for managing messaging workflows in TypeScript applications. By using well-defined interfaces and tools, developers can easily integrate messaging capabilities into their domain-driven designs and AI-driven processes. The library also leverages Zod for schema validation, ensuring that the data being processed meets the expected structure.

## Serverless Focus

This package focuses on serverless (nodeless) environments, which is why it implements integrations with raw HTTP APIs.

## Installation & Setup

Install the package using pnpm:

```bash
pnpm add @messagehub/core
pnpm add @messagehub/resend
```

Ensure that your project is set up to handle TypeScript and supports ES modules, as this library is built with modern JavaScript standards.

## Contributing

Contributions are welcome! Feel free to fork this project and submit pull requests. Before submitting, please ensure your code passes all linting and unit tests.

You can format code using:

```bash
pnpm format
```

You can run unit tests using:

```bash
pnpm test
