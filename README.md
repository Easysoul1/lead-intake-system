# 🧠 Lead Intake & Qualification System

A full-stack TypeScript application built with Next.js, Node.js, and Prisma that enables lead submission, automatic enrichment, scoring, and qualification tracking.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Technical-Test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000]

## 📋 Features

### Backend
- ✅ **Lead Submission API** (`POST /api/leads`)
  - Validates name, email, and optional website
  - Prevents duplicate email submissions
  - Persists leads to SQLite database

- ✅ **Lead Enrichment**
  - Integrates with AnyMail Finder API (simulated for demo)
  - Gracefully handles API failures
  - Enriches with company name, size, industry, and country

- ✅ **Lead Scoring System**
  - Website presence: +10 points
  - Company size 11-50: +20 points
  - High-value countries (US/UK/CA): +10 points
  - Missing enrichment data: -5 points per field
  - Qualification threshold: Score ≥ 20

- ✅ **Lead Listing API** (`GET /api/leads/list`)
  - Filter by qualification status
  - Sort by score or creation date

### Frontend
- ✅ **Lead Submission Form**
  - Client-side validation
  - Loading states
  - Error handling
  - Success feedback

- ✅ **Dashboard**
  - Displays all leads with enrichment data
  - Shows lead scores and qualification status
  - Filter to show only qualified leads
  - Sort by score or date
  - Statistics cards (total leads, qualified count, average score)

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router with Pages Router for API routes)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod

### Project Structure
```
Technical-Test/
├── components/          # React components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── LeadForm.tsx    # Lead submission form
│   └── LeadCard.tsx    # Lead display card
├── lib/                # Utility functions
│   ├── prisma.ts       # Prisma client singleton
│   ├── enrichment.ts   # AnyMail Finder integration
│   ├── scoring.ts      # Lead scoring logic
│   └── validation.ts   # Validation schemas
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   │   └── leads/     # Lead endpoints
│   ├── index.tsx      # Lead submission page
│   └── dashboard.tsx  # Dashboard page
├── prisma/            # Database schema
│   └── schema.prisma  # Prisma schema
├── styles/            # Global styles
│   └── globals.css    # Tailwind CSS imports
└── types/             # TypeScript types
    └── lead.ts        # Lead-related types
```

## 🔑 Key Architectural Decisions

### 1. **Next.js API Routes**
Chose Next.js API routes over a standalone server for:
- Simplicity and deployment ease
- Built-in TypeScript support
- Unified codebase
- Easy Vercel deployment

### 2. **Prisma + SQLite**
Selected Prisma with SQLite because:
- Type-safe database access
- Easy migrations
- No external database setup required
- Can easily migrate to PostgreSQL/MySQL later
- Perfect for development and small-scale production

### 3. **Zod for Validation**
Used Zod for:
- Type-safe validation
- Automatic TypeScript inference
- Consistent validation
- Single source of truth for validation rules

### 4. **Component-Based Architecture**
Organized components for:
- Reusability
- Maintainability
- Separation of concerns
- Easy testing

### 5. **Graceful Error Handling**
Implemented comprehensive error handling:
- API failures don't block lead creation
- User-friendly error messages
- Proper HTTP status codes
- Logging for debugging

## 🔄 Trade-offs Made

### 1. **Simulated Enrichment API**
- **Decision**: Used a mock implementation of AnyMail Finder API
- **Reason**: Requires API key and account setup
- **Impact**: Demonstrates proper integration patterns, error handling, and async behavior
- **Production**: Replace with actual API call using environment variable for API key

### 2. **In-Memory vs Database**
- **Decision**: Used SQLite with Prisma
- **Reason**: Better for persistence, testing, and production readiness
- **Trade-off**: Slightly more setup, but provides real-world data persistence

### 3. **No Authentication**
- **Decision**: Skipped authentication for MVP
- **Reason**: Focus on core functionality within timebox
- **Future**: Can add NextAuth.js or similar

### 4. **No Rate Limiting**
- **Decision**: Not implemented in initial version
- **Reason**: Time constraints
- **Future**: Can add middleware-based rate limiting

## 📡 AnyMail Finder Enrichment

### How It Works

The enrichment process is implemented in `lib/enrichment.ts`:

1. **API Call**: After a lead is created, the system attempts to enrich it
2. **Error Handling**: If enrichment fails, the lead is still saved
3. **Data Extraction**: Extracts company name, size, industry, and country
4. **Partial Data**: Handles cases where only partial data is available

### Production Implementation

To use the real AnyMail Finder API:

1. Sign up at [anymailfinder.com](https://anymailfinder.com)
2. Get your API key
3. Add to `.env.local`:
   ```
   ANYMAIL_FINDER_API_KEY=your_api_key_here
   ```
4. Update `lib/enrichment.ts` to use the actual API endpoint:
   ```typescript
   const response = await fetch(
     `https://api.anymailfinder.com/v4.0/search/person.json?email=${encodeURIComponent(email)}`,
     {
       headers: {
         'X-Api-Key': process.env.ANYMAIL_FINDER_API_KEY || '',
       },
     }
   )
   ```

### Current Implementation

The current implementation simulates:
- API response delays (500-1500ms)
- Occasional failures (10% failure rate)
- Partial data scenarios (30% chance)
- Realistic enrichment data based on email domain

## 🎨 UI Design

### Color Scheme
- **Primary**: Blue gradient (professional, trustworthy)
- **Accent**: Purple gradient (modern, engaging)
- **Success**: Green (positive actions)
- **Warning**: Yellow (attention needed)
- **Background**: Subtle gradient from slate to blue to indigo

### Design Principles
- Clean, modern interface
- Responsive design (mobile-first)
- Accessible color contrasts
- Smooth transitions and animations
- Clear visual hierarchy

## 📊 Lead Scoring System

### Scoring Rules

| Criteria | Points |
|----------|--------|
| Has website | +10 |
| Company size 11-50 | +20 |
| Country in US/UK/CA | +10 |
| Missing enrichment field | -5 per field |
| No enrichment data | -20 |

### Qualification Threshold
- **Qualified**: Score ≥ 20
- **Unqualified**: Score < 20

### Rationale
- Website indicates business maturity
- 11-50 employees is optimal for B2B sales
- US/UK/CA are high-value markets
- Missing data suggests lower quality

## 🧪 Testing the Application

### Manual Testing Steps

1. **Submit a Lead**
   - Go to `/`
   - Fill in name, email, and optional website
   - Submit and verify success message

2. **View Dashboard**
   - Navigate to `/dashboard`
   - Verify lead appears with enrichment data
   - Check score calculation

3. **Test Validation**
   - Try submitting with invalid email
   - Try submitting duplicate email
   - Verify error messages

4. **Test Filtering**
   - Toggle "Show only qualified leads"
   - Verify filtering works

5. **Test Sorting**
   - Change sort order
   - Verify leads reorder correctly

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables if needed
4. Deploy

### Other Platforms

The app can be deployed to any Node.js hosting platform:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## 🔮 Future Improvements

Given more time, I would:

1. **Add Authentication**
   - Implement NextAuth.js
   - Protect dashboard route
   - User roles and permissions

2. **Rate Limiting**
   - Add middleware-based rate limiting
   - Prevent abuse of submission endpoint

3. **Retry Logic**
   - Implement exponential backoff for enrichment failures
   - Queue failed enrichments for retry

4. **Real-time Updates**
   - WebSocket or Server-Sent Events
   - Live dashboard updates

5. **Advanced Filtering**
   - Filter by score range
   - Filter by country, industry, etc.
   - Search functionality

6. **Export Functionality**
   - Export leads to CSV
   - Export to Excel

7. **Analytics**
   - Lead conversion tracking
   - Enrichment success rate
   - Score distribution charts

8. **Testing**
   - Unit tests for scoring logic
   - Integration tests for API routes
   - E2E tests with Playwright

9. **Performance**
   - Implement pagination
   - Add caching for enrichment data
   - Optimize database queries

10. **Documentation**
    - API documentation with Swagger
    - Component Storybook
    - Architecture diagrams

## 📝 Environment Variables

Create a `.env.local` file for production:

```env
# Database
DATABASE_URL="file:./dev.db"

# AnyMail Finder (when using real API)
ANYMAIL_FINDER_API_KEY="your_api_key_here"
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 📄 License

This project is created for a technical assessment.

## 👤 Author

Built with attention to:
- TypeScript best practices
- Clean code architecture
- User experience
- Error handling
- Documentation

---

**Note**: This project demonstrates full-stack development capabilities with modern tools and best practices.
# lead-intake-system
