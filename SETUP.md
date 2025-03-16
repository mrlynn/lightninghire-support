# LightningHire Support Portal - Setup Guide

This document outlines the steps to set up and run the LightningHire Support portal, which complements the main LightningHire application.

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
   - `MONGODB_URI`: Connection string to your MongoDB database (same as main app)
   - `NEXTAUTH_URL`: The base URL of your support portal
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
   - `OPENAI_API_KEY`: Your OpenAI API key

## Database Setup

The support portal shares the same MongoDB database as the main LightningHire application. It will create the following new collections:

- `knowledgearticles`
- `articlecategories`
- `chatconversations`
- `chatmessages`

## Vector Search Setup

For the RAG-powered chatbot to work effectively, you need to set up a MongoDB vector search index:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the vector index creation endpoint:
   ```
   GET http://localhost:3000/api/admin/setup/vector-index
   ```
   
   This will create the necessary vector search index for knowledge articles.

## Development

Run the development server:

```bash
npm run dev
```

The support portal will be available at [http://localhost:3000](http://localhost:3000).

## Initial Content Setup

1. Log in with an admin account from the main LightningHire application.

2. Navigate to the admin dashboard at `/admin`.

3. Create categories:
   - Go to `/admin/categories`
   - Create categories like "Getting Started", "Tutorials", "FAQs", etc.

4. Create articles:
   - Go to `/admin/articles/new`
   - Create knowledge base articles with markdown content
   - Assign categories and tags

## Deployment

The support portal can be deployed alongside the main LightningHire application:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Vercel or another hosting platform:
   ```bash
   vercel --prod
   ```

3. Ensure the following environment variables are set in your production environment:
   - `MONGODB_URI`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `OPENAI_API_KEY`
   - `ENABLE_VECTOR_SEARCH` (set to "true")

## Integration with Main Application

Add links to the support portal from the main LightningHire application:

1. In the main app's navigation, add a "Support" link pointing to the support portal.

2. Update the help documentation links to point to specific articles in the support portal.

## Additional Configuration

### Custom Styling

To match the main LightningHire application's styling:

1. Update the theme configuration in `src/components/ThemeProvider.js`

2. Modify global styles in `src/app/globals.css`

### User Roles

The support portal recognizes the following roles from the main application:
- Admin users can access the admin dashboard and manage content
- Regular users can view articles and use the chatbot