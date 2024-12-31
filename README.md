# MessageHub Mono Repo

**MessageHub is a TypeScript-based mono repository that provides a collection of packages designed for handling messaging workflows and integrating with various email service providers.** This repository aims to simplify the process of sending and receiving messages across different channels, making it easier for developers to build robust applications.

## Why Choose MessageHub?

MessageHub offers a powerful and flexible solution for managing email communications in your applications. With seamless integration across multiple email service providers, you can easily switch between services or add new ones as your needs evolve. Our architecture is designed with serverless environments in mind, ensuring that you can build scalable applications without the overhead of managing infrastructure.

## Structure

The mono repo contains the following key packages:

- **@messagehub/core**: The foundational library that provides core functionalities, interfaces, and tools for managing messaging workflows.
- **@messagehub/mailgun**: An integration package for sending emails using the Mailgun API.
- **@messagehub/nylas**: An integration package for sending emails using the Nylas API.
- **@messagehub/resend**: An integration package for sending emails using the Resend API.
- **@messagehub/sendgrid**: An integration package for sending emails using the SendGrid API.

## Installation

To get started, install the core package along with any specific provider packages you need:

```bash
pnpm add @messagehub/core
pnpm add @messagehub/mailgun
pnpm add @messagehub/nylas
pnpm add @messagehub/resend
pnpm add @messagehub/sendgrid
```

## Usage

Refer to the individual package READMEs for detailed usage instructions, examples, and configuration options.

### Sending an Email with a Provider

To send an email using the SendGrid integration, you can use the following example:

```typescript
import { sendEmail } from '@messagehub/core';

// Import the provider package to trigger self-registration
import '@messagehub/sendgrid';

const emailMessage = {
  from: [{ email: 'sender@example.com', name: 'Sender Name' }],
  to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
  subject: 'Hello from MessageHub SendGrid',
  text: 'This is a test email sent using MessageHub with SendGrid.',
  html: '<p>This is a test email sent using MessageHub with SendGrid.</p>',
  attachments: [
    {
      content: 'base64-encoded-content',
      filename: 'attachment.txt',
      path: '/path/to/attachment.txt',
    },
  ],
};

const config = {
  MESSAGE_PROVIDER: 'sendgrid', // it can be any of supported providers
  // the following settings will vary per provider
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_API_URL: process.env.SENDGRID_API_URL,
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
       public createSender(config: TypeMyProviderConfig): EmailSenderInterface {
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

5. **Self-Registering the Package**: To make your package self-registering, ensure your package registers the factory with the `EmailProviderFactoryRegistry` and exports the factory class as the default export in `index.ts`. For example:

```typescript
import { EmailProviderFactoryRegistry } from '@messagehub/core';
import { MyProviderEmailProviderFactory } from './Factory/MyProviderEmailProviderFactory';

EmailProviderFactoryRegistry.registerEmailProviderFactory('my-provider', new MyProviderEmailProviderFactory());

// default export so that core factory can use it directly
export default MyProviderEmailProviderFactory;
```

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


## Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests. Before submitting, please ensure your code passes all linting and unit tests.

You can format code using:

```bash
pnpm format
```

You can run unit tests using:

```bash
pnpm test
