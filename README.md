# LightningHire Support Portal

![LightningHire Logo](public/images/logo.png)

A comprehensive support portal for the LightningHire platform, deployed at [support.lightninghire.com](https://support.lightninghire.com).

## Overview

LightningHire Support Portal is a Next.js application designed to provide a centralized knowledge base, documentation, and support resources for users of the LightningHire platform. It offers searchable articles, categorized content, and an AI-powered chatbot to assist users with their questions.

## Features

- **Knowledge Base**: Searchable articles organized by categories
- **RAG-Powered Chatbot**: AI assistant backed by OpenAI and retrieval-augmented generation
- **Admin Dashboard**: Content management for support staff
- **User Authentication**: Seamless integration with the main LightningHire platform
- **Responsive Design**: Optimized for desktop and mobile devices
- **Vector Search**: Advanced semantic search capabilities for knowledge articles

## Tech Stack

- **Frontend**: Next.js 15, React 19, Material UI 6
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI API
- **Content Rendering**: React Markdown

## Prerequisites

- Node.js 18.x or later
- MongoDB (shared with the main LightningHire application)
- OpenAI API key for RAG-powered chat and embeddings

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/lightning-hire-support.git
   cd lightning-hire-support
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on the provided example:
   ```bash
   cp .env.local.example .env.local
   ```

4. Edit the `.env.local` file and fill in the required values:
   - `MONGODB_URI`: Connection string to your MongoDB database
   - `NEXTAUTH_URL`: The base URL of your support portal
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
   - `OPENAI_API_KEY`: Your OpenAI API key

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

The support portal shares the same MongoDB database as the main LightningHire application. It creates the following collections:

- `knowledgearticles`
- `articlecategories`
- `chatconversations`
- `chatmessages`

For the RAG-powered chatbot, you need to set up a MongoDB vector search index:

```bash
# Start the server, then access:
GET http://localhost:3000/api/admin/setup/vector-index
```

## Initial Content Setup

1. Log in with an admin account from the main LightningHire application
2. Navigate to the admin dashboard at `/admin`
3. Create categories and knowledge base articles

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Vercel or another hosting platform:
   ```bash
   vercel --prod
   ```

3. Ensure all environment variables are set in your production environment

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and configuration
- `/src/models` - Mongoose database models
- `/src/services` - Business logic services
- `/src/context` - React context providers
- `/src/hooks` - Custom React hooks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - All rights reserved

## Additional Documentation

- [Authentication Guide](AUTHENTICATION.md)
- [Setup Guide](SETUP.md)
- [Next Steps](NEXT_STEPS.md)

---

© 2024 LightningHire. All rights reserved.
