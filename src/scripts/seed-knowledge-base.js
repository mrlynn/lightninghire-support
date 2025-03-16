// src/scripts/seed-knowledge-base.js
/**
 * This script seeds the database with sample knowledge base articles and categories.
 * 
 * Usage:
 * 1. Ensure your .env.local file is set up with your MongoDB connection string
 * 2. Run this script with: NODE_OPTIONS=--experimental-modules node -r dotenv/config src/scripts/seed-knowledge-base.js
 */

// Import required modules
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create mongoose schemas directly in this script to avoid import issues
const { Schema } = mongoose;

// ArticleCategory Schema
const ArticleCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this category'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'ArticleCategory',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// KnowledgeArticle Schema
const KnowledgeArticleSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this article'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Please provide content for this article']
  },
  shortDescription: {
    type: String,
    required: [true, 'Please provide a short description'],
    maxlength: [250, 'Short description cannot be more than 250 characters']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ArticleCategory',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    // ref: 'User',
    required: false
  },
  publishedDate: {
    type: Date,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  unhelpfulCount: {
    type: Number,
    default: 0
  },
  relatedArticles: [{
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeArticle'
  }],
  embedding: {
    type: [Number],
    default: null,
    index: false
  }
}, { timestamps: true });

// Create models
const ArticleCategory = mongoose.model('ArticleCategory', ArticleCategorySchema);
const KnowledgeArticle = mongoose.model('KnowledgeArticle', KnowledgeArticleSchema);

// Simple OpenAI embedding mock function (we'll skip actual embeddings for seeding)
const createEmbedding = async (text) => {
  console.log('Mocking embedding generation for:', text.substring(0, 50) + '...');
  // Return a mock embedding vector (1536 dimensions, typical for OpenAI)
  return Array(1536).fill(0).map(() => Math.random() - 0.5);
};

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Sample categories
const categories = [
  {
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Learn the basics of LightningHire and how to get started with the platform.',
    icon: 'PlayArrow',
    order: 1,
    isActive: true
  },
  {
    name: 'Resume Parsing',
    slug: 'resume-parsing',
    description: 'Learn how to use LightningHire\'s resume parsing capabilities.',
    icon: 'Description',
    order: 2,
    isActive: true
  },
  {
    name: 'Job Management',
    slug: 'job-management',
    description: 'Manage job requisitions, templates, and settings.',
    icon: 'Work',
    order: 3,
    isActive: true
  },
  {
    name: 'Candidate Evaluation',
    slug: 'candidate-evaluation',
    description: 'Learn how to evaluate candidates and understand match scores.',
    icon: 'Assessment',
    order: 4,
    isActive: true
  },
  {
    name: 'FAQs',
    slug: 'faqs',
    description: 'Frequently asked questions about LightningHire.',
    icon: 'Help',
    order: 5,
    isActive: true
  }
];

// Sample knowledge base articles
const articles = [
  // Getting Started
  {
    title: 'Welcome to LightningHire',
    slug: 'welcome-to-lightning-hire',
    shortDescription: 'An introduction to LightningHire and its key features.',
    content: `# Welcome to LightningHire

LightningHire is an AI-powered resume evaluation system designed to streamline your recruitment process. This guide will help you get started with the platform and understand its key features.

## What is LightningHire?

LightningHire uses advanced AI to analyze resumes and match candidates to your job requirements. The platform helps you:

- Save time by automatically parsing and evaluating resumes
- Find the best candidates based on skills and experience
- Ensure objective, consistent candidate evaluation
- Streamline your recruitment workflow

## Key Features

### Resume Parsing

Upload resumes in various formats (PDF, DOCX, etc.), and LightningHire will automatically extract key information:

- Contact details
- Skills and expertise
- Work experience
- Education and certifications

### Job Requisition Management

Create detailed job requisitions with:
- Required skills and qualifications
- Experience level requirements
- Role-specific criteria

### AI-Powered Candidate Matching

Our AI analyzes each candidate against your job requirements to:
- Generate match scores and rankings
- Provide insights on candidate strengths and weaknesses
- Recommend top candidates for each position

### Collaborative Workflow

Work with your team:
- Share candidate evaluations
- Add notes and feedback
- Track candidate status through the hiring process

## Getting Started

1. [Create your account](/register)
2. [Set up your first job requisition](/articles/creating-your-first-job-requisition)
3. [Upload and evaluate candidates](/articles/uploading-resumes)
4. [Understand match scores](/articles/understanding-match-scores)

We're excited to help you transform your recruitment process with LightningHire!`,
    category: 'Getting Started',
    tags: ['introduction', 'overview', 'getting started'],
    status: 'published',
    publishedDate: new Date()
  },
  {
    title: 'Creating Your First Job Requisition',
    slug: 'creating-your-first-job-requisition',
    shortDescription: 'Step-by-step guide to creating your first job requisition in LightningHire.',
    content: `# Creating Your First Job Requisition

This guide will walk you through the process of creating your first job requisition in LightningHire.

## What is a Job Requisition?

A job requisition is a detailed description of a job opening. It includes information about the role, required skills, experience level, and other criteria. LightningHire uses this information to evaluate candidates and provide match scores.

## Step-by-Step Guide

### 1. Navigate to the Jobs Section

From your dashboard, click on "Jobs" in the main navigation menu, then click "Create New Job."

### 2. Enter Basic Information

Fill in the basic information about the job:

- **Job Title**: Enter a clear, specific title
- **Department**: Select the relevant department
- **Location**: Specify where the job is located
- **Employment Type**: Select full-time, part-time, contract, etc.

### 3. Describe the Role

In the "Description" field, provide a detailed overview of the role. This should include:

- Main responsibilities
- Day-to-day tasks
- Team structure
- Reporting relationships

### 4. Define Requirements

In the "Requirements" section, specify:

- **Skills**: Technical and soft skills needed
- **Experience**: Years of experience required
- **Education**: Required degrees or certifications
- **Other qualifications**: Any other necessary qualifications

#### Pro Tip: Be Specific with Skills

The more specific you are with required skills, the better LightningHire can match candidates. For example, instead of just "Programming," specify "Java," "Python," or other specific languages.

### 5. Set Skill Weights

Adjust the importance of different skills by setting weights:
- Essential skills: Set to "Required"
- Important but not critical skills: Set to "Preferred"
- Nice-to-have skills: Set to "Bonus"

### 6. Save and Publish

Once you've entered all the information, click "Save" to save as a draft, or "Publish" to make the job active.

## Using Templates

To save time, you can create job requisition templates:

1. Create a new job as described above
2. Click "Save as Template" instead of "Publish"
3. Give your template a name
4. Use the template when creating future similar jobs

## Bulk Import

If you have multiple jobs to create, you can use our bulk import feature:

1. Go to "Jobs" → "Bulk Operations" → "Import Jobs"
2. Download the template CSV file
3. Fill in your job details in the CSV format
4. Upload the completed CSV

## Next Steps

After creating your job requisition:
- [Upload candidate resumes](/articles/uploading-resumes)
- [View match scores](/articles/understanding-match-scores)
- [Manage your hiring pipeline](/articles/managing-hiring-pipeline)`,
    category: 'Getting Started',
    tags: ['job requisition', 'tutorial', 'getting started'],
    status: 'published',
    publishedDate: new Date()
  },
  
  // Resume Parsing
  {
    title: 'How Resume Parsing Works',
    slug: 'how-resume-parsing-works',
    shortDescription: 'Understand how LightningHire parses and extracts information from resumes.',
    content: `# How Resume Parsing Works in LightningHire

LightningHire uses advanced AI and Natural Language Processing (NLP) to parse resumes with high accuracy. This article explains how our resume parsing technology works and what information it extracts.

## The Resume Parsing Process

When you upload a resume to LightningHire, it goes through several processing stages:

### 1. Document Extraction

First, our system extracts the text content from various file formats:
- PDF documents
- Word documents (DOCX, DOC)
- Plain text files
- Rich text formats

For PDF documents that contain images or scanned pages, we use Optical Character Recognition (OCR) to convert the image content to text.

### 2. Section Identification

Next, our AI identifies different sections in the resume, such as:
- Contact information
- Professional summary
- Work experience
- Education
- Skills
- Certifications
- Projects
- Publications
- References

### 3. Information Extraction

Within each section, our NLP engine extracts specific details:

#### Contact Information
- Name
- Email address
- Phone number
- Location
- LinkedIn profile and other social links

#### Work Experience
- Company names
- Job titles
- Employment dates
- Job descriptions
- Achievements and responsibilities

#### Education
- Institutions
- Degrees and fields of study
- Graduation dates
- GPA/Grades (when available)

#### Skills
- Technical skills
- Soft skills
- Proficiency levels (when indicated)
- Tools and technologies

#### Certifications
- Certification names
- Issuing organizations
- Dates obtained
- Expiration dates (if applicable)

### 4. Skills Normalization

Our system normalizes extracted skills to match our standardized skills database. For example:
- "MS Excel" and "Microsoft Excel" are recognized as the same skill
- "JavaScript" and "JS" are identified as the same programming language
- "Customer Service" and "Client Relations" are understood as related skills

### 5. Enrichment

Finally, our AI enriches the parsed data by:
- Inferring skills from job descriptions
- Calculating experience durations
- Identifying career progression
- Recognizing achievements

## Accuracy and Handling Edge Cases

Our resume parser is trained on millions of resumes from various industries and formats. However, it may occasionally face challenges with:

- Unconventional resume formats
- Creative designs with complex layouts
- Foreign languages and international formats
- Heavily stylized or graphic-based resumes

In these cases, the system will extract as much information as possible and flag any sections where confidence is low. You can always review and edit the parsed information.

## Handling Multiple Resumes

LightningHire Supports bulk processing of resumes:
- Upload multiple files at once
- Process resumes in batch via our API
- Import from applicant tracking systems

## Supported File Formats

We support all common resume file formats:
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Rich Text Format (.rtf)
- Plain Text (.txt)

## Tips for Better Parsing Results

To get the best results from our resume parser:
- Use standard resume formats
- Ensure clean, readable PDF conversions
- Avoid watermarks or background images
- Use common section headings
- Provide resumes in digital format rather than scanned copies when possible

## Next Steps

Learn how to:
- [Upload resumes to LightningHire](/articles/uploading-resumes)
- [Review and edit parsed information](/articles/reviewing-parsed-resumes)
- [Match candidates to job requirements](/articles/matching-candidates-to-jobs)`,
    category: 'Resume Parsing',
    tags: ['parsing', 'resume', 'extraction', 'NLP'],
    status: 'published',
    publishedDate: new Date()
  },
  
  // FAQs
  {
    title: 'Frequently Asked Questions',
    slug: 'frequently-asked-questions',
    shortDescription: 'Answers to common questions about LightningHire.',
    content: `# Frequently Asked Questions

## General Questions

### What is LightningHire?
LightningHire is an AI-powered resume evaluation system that helps recruiters and hiring managers find the best candidates for their job openings. It uses advanced artificial intelligence to parse resumes, match candidates to job requirements, and provide objective evaluations.

### How does LightningHire work?
LightningHire works by analyzing both job requirements and candidate resumes. It extracts key information from resumes, normalizes skills and experience data, and then compares candidates against job requirements to generate match scores and insights.

### What file formats does LightningHire Support?
LightningHire Supports all common resume formats:
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Rich Text Format (.rtf)
- Plain Text (.txt)
- HTML (.html)

### Is my data secure with LightningHire?
Yes. LightningHire employs enterprise-grade security measures, including:
- Data encryption in transit and at rest
- Regular security audits
- Role-based access controls
- Compliance with data protection regulations
- Secure cloud infrastructure

### How accurate is LightningHire's AI?
Our AI has been trained on millions of resumes and job descriptions across various industries. It achieves an accuracy rate of over 95% for information extraction and 90% for candidate-job matching. We continuously improve our models based on user feedback and new data.

## Account & Billing

### What plans does LightningHire offer?
LightningHire offers three pricing tiers:
- **Free**: For small teams (up to 2 active jobs, 50 candidates)
- **Pro**: For growing companies ($49/month - 25 jobs, 500 candidates)
- **Enterprise**: For larger organizations (Custom pricing - unlimited usage)

See our [Pricing Page](/pricing) for complete details.

### How do I upgrade or downgrade my plan?
To change your subscription:
1. Log in to your account
2. Go to Settings → Billing
3. Select "Change Plan"
4. Choose your new plan and confirm

### How are active jobs and candidates counted?
- **Active Jobs**: Any job requisition that is published and not archived
- **Active Candidates**: Any candidate that has been uploaded and processed in the last 12 months

### Do you offer a free trial?
Yes, we offer a 14-day free trial of our Pro plan. No credit card is required to start the trial.

### What payment methods do you accept?
We accept major credit cards (Visa, Mastercard, American Express) and, for annual Enterprise plans, we can also arrange invoice payments.

## Features & Usage

### Can I import candidates in bulk?
Yes, LightningHire Supports bulk import of candidates via:
- Multiple file upload
- ZIP file containing multiple resumes
- CSV import with resume file attachments
- API integration

### How do I share candidate evaluations with my team?
You can share candidate evaluations by:
- Adding team members to your LightningHire account
- Generating shareable evaluation reports
- Exporting data to your ATS (with Enterprise plan)
- Using our email sharing feature

### Can LightningHire integrate with my ATS?
Yes, LightningHire offers integrations with popular Applicant Tracking Systems:
- Greenhouse
- Lever
- Workday
- Taleo
- BambooHR
- And more

Enterprise customers can also access our API for custom integrations.

### What languages does LightningHire Support?
LightningHire currently supports resumes in:
- English
- Spanish
- French
- German
- Portuguese
- Italian
- Dutch

We're continually adding support for more languages.

### Can I customize the skills and requirements?
Yes, you can customize:
- Skills library with company-specific skills
- Scoring weights for different criteria
- Matching algorithms for specific roles
- Evaluation templates

### How do I get support?
Support options include:
- In-app chat support
- Email support at support@lightninghire.com
- Knowledge base articles (you're reading one now!)
- Scheduled training sessions (Enterprise plan)
- Phone support (Enterprise plan)

## Technical Questions

### Does LightningHire work on mobile devices?
Yes, LightningHire has a responsive design that works on desktops, tablets, and mobile phones. We also offer mobile apps for iOS and Android.

### What browsers are supported?
LightningHire Supports:
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

We recommend using the latest version of any browser for optimal performance.

### Can I export data from LightningHire?
Yes, you can export:
- Candidate evaluations (PDF, CSV)
- Match reports (PDF, CSV)
- Job requisitions (PDF, CSV)
- Analytics data (CSV, Excel)

### What happens if I exceed my plan limits?
If you approach your plan limits, you'll receive a notification. If you exceed them:
- For job limits: You'll need to archive some jobs before creating new ones
- For candidate limits: You can purchase additional candidate credits or upgrade your plan

### Is an internet connection required?
Yes, LightningHire is a cloud-based solution that requires an internet connection to access and use its features.

## Still have questions?

If you didn't find the answer you were looking for:
- [Contact our support team](/contact)
- [Schedule a demo](/demo)
- [Visit our blog](/blog) for the latest updates and tips`,
    category: 'FAQs',
    tags: ['faq', 'help', 'questions'],
    status: 'published',
    publishedDate: new Date()
  },
  // Pricing
  {
    title: 'LightningHire Pricing Plans',
    slug: 'pricing-plans',
    shortDescription: 'A complete guide to LightningHire\'s pricing plans, features, and subscription options.',
    content: `# LightningHire Pricing Plans

This guide provides detailed information about LightningHire's pricing plans, features, and subscription options to help you choose the right plan for your organization.

## Available Plans

LightningHire offers three flexible pricing plans designed to meet the needs of different organizations, from small teams to large enterprises.

### Free Plan

Our Free plan is perfect for small teams or individual recruiters just getting started:

- **Active Jobs**: 2 simultaneous active job requisitions
- **Candidates**: 50 active candidates
- **Monthly Evaluations**: 50 resume evaluations per month
- **Price**: $0/month

#### Free Plan Limitations

The Free plan is designed for small teams and individual recruiters with basic needs. It includes core functionality but has usage limits and doesn't support purchasing additional evaluations.

### Pro Plan

Our most popular plan for growing companies and recruitment teams:

- **Active Jobs**: 25 simultaneous active job requisitions
- **Candidates**: 500 active candidates
- **Monthly Evaluations**: 250 resume evaluations per month
- **Price**: $49/month
- **Extra Evaluations**: Available at $0.50 per evaluation

#### Pro Plan Benefits

The Pro plan includes everything in the Free plan, plus:
- Higher usage limits for all features
- Ability to purchase extra evaluations
- Advanced matching algorithm
- Deeper candidate insights
- Priority support

### Enterprise Plan

Custom solution for larger organizations with high-volume recruitment needs:

- **Active Jobs**: 100+ simultaneous active job requisitions
- **Candidates**: Unlimited active candidates
- **Monthly Evaluations**: 500+ resume evaluations per month
- **Price**: Custom pricing based on needs
- **Extra Evaluations**: Available at $0.40 per evaluation

#### Enterprise Plan Benefits

The Enterprise plan includes everything in the Pro plan, plus:
- Highest usage limits
- Custom features and integrations
- Dedicated account manager
- Premium support with faster response times
- Lower per-unit cost for extra evaluations
- Custom reporting and analytics

## Plan Comparison

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Active Jobs | 2 | 25 | 100+ |
| Active Candidates | 50 | 500 | Unlimited |
| Monthly Evaluations | 50 | 250 | 500+ |
| Extra Evaluations | Not available | $0.50 each | $0.40 each |
| Advanced Matching | Basic | Advanced | Advanced+ |
| Custom Integrations | No | Limited | Yes |
| Support | Email | Priority | Premium |
| Price | Free | $49/month | Custom |

## Understanding Usage Limits

### Active Jobs

An active job is any job requisition that is published and not archived. Jobs count toward your limit until they are archived or deleted.

### Active Candidates

Active candidates include any candidate that has been uploaded and processed in the last 12 months.

### Monthly Evaluations

Evaluations reset on the first day of each billing cycle. Each resume evaluation counts as one evaluation credit. Unused evaluations do not roll over to the next month.

## Purchasing Extra Evaluations

If you need more than your plan's included evaluations, you can purchase extra evaluation credits:

### How to Purchase Extra Evaluations

1. Navigate to **Dashboard** → **Subscription**
2. Click the **Buy Extra Evaluations** button
3. Select the number of extra evaluations you want to purchase
4. Complete the payment process

Extra evaluations never expire and will be used after your monthly allocation is depleted.

## Changing Your Plan

### How to Upgrade

1. Navigate to **Dashboard** → **Subscription**
2. Click **View All Plans**
3. Select your desired plan and click **Upgrade**
4. Complete the payment process

Upgrades take effect immediately, and you'll have immediate access to the higher limits and features.

### How to Downgrade

1. Navigate to **Dashboard** → **Subscription**
2. Click **Manage Payment**
3. Select **Cancel Subscription** or **Switch Plans**
4. Follow the prompts to downgrade

Downgrades take effect at the end of your current billing cycle.

## Payment and Billing

### Payment Methods

LightningHire accepts:
- All major credit cards (Visa, Mastercard, American Express, Discover)
- Invoice payments for annual Enterprise plans

### Billing Cycles

- **Monthly**: Subscriptions are billed on the same date each month
- **Annual**: Annual plans are available with a 15% discount (contact sales)

### Managing Your Subscription

Access your subscription details and payment information at any time through the **Dashboard** → **Subscription** page.

From there, you can:
- Update payment methods
- View invoices and payment history
- Change your subscription plan
- Cancel your subscription

## Frequently Asked Questions About Pricing

### Is there a free trial?

Yes, we offer a 14-day free trial of our Pro plan with no credit card required.

### Can I change plans at any time?

Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately while downgrades take effect at the end of your current billing cycle.

### What happens if I exceed my plan limits?

For job and candidate limits, you'll need to upgrade your plan or archive some jobs/candidates before adding new ones. For evaluations, you can purchase additional evaluation credits or wait until your next billing cycle when your allocation resets.

### Do unused evaluations roll over?

No, monthly evaluations reset at the beginning of each billing cycle. However, purchased extra evaluations never expire.

### Can I get a custom plan?

Yes, please contact our sales team at sales@lightninghire.com to discuss custom requirements and enterprise pricing.

## Need Help?

If you have questions about our pricing or need help selecting the right plan:

- Email us at billing@lightninghire.com
- Chat with us using the in-app chat support
- Schedule a demo with our sales team at [lightninghire.com/demo](/demo)`,
    category: 'FAQs',
    tags: ['pricing', 'subscription', 'plans', 'billing'],
    status: 'published',
    publishedDate: new Date()
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectToDatabase();
    
    console.log('Creating categories...');
    const categoryMap = {};
    
    // Create categories
    for (const category of categories) {
      const existingCategory = await ArticleCategory.findOne({ slug: category.slug });
      
      if (existingCategory) {
        console.log(`Category '${category.name}' already exists, skipping...`);
        categoryMap[category.name] = existingCategory._id;
      } else {
        const newCategory = await ArticleCategory.create(category);
        console.log(`Created category: ${newCategory.name}`);
        categoryMap[category.name] = newCategory._id;
      }
    }
    
    console.log('Creating articles...');
    
    // Create articles
    for (const article of articles) {
      // Find category ID
      const categoryId = categoryMap[article.category];
      if (!categoryId) {
        console.error(`Category '${article.category}' not found, skipping article '${article.title}'`);
        continue;
      }
      
      // Check if article already exists
      const existingArticle = await KnowledgeArticle.findOne({ slug: article.slug });
      
      if (existingArticle) {
        console.log(`Article '${article.title}' already exists, skipping...`);
        continue;
      }
      
      // Create article
      const newArticle = await KnowledgeArticle.create({
        ...article,
        category: categoryId,
        author: new mongoose.Types.ObjectId('000000000000000000000000'), // Placeholder author
      });
      
      console.log(`Created article: ${newArticle.title}`);
      
      // Generate mock embedding (skip actual OpenAI call for seeding)
      if (newArticle.status === 'published') {
        try {
          console.log(`Generating mock embedding for article: ${newArticle.title}`);
          
          const content = `${newArticle.title}\n${newArticle.shortDescription}\n${newArticle.content}`;
          const embedding = await createEmbedding(content);
          
          await KnowledgeArticle.findByIdAndUpdate(newArticle._id, { embedding });
          
          console.log(`Generated mock embedding for article: ${newArticle.title}`);
        } catch (error) {
          console.error(`Error generating embedding for article '${newArticle.title}':`, error);
        }
      }
    }
    
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedDatabase();