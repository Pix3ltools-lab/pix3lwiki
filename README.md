# Pix3lWiki

**Document, organize, and share knowledge for your Pix3lBoard projects.**

Pix3lWiki is a wiki companion app that integrates with [Pix3lBoard](https://board.pix3ltools.com). It shares the same database and authentication, allowing you to create rich documentation linked to your boards and cards.

> **Note**: This is an experimental app. Data persistence is not guaranteed and may be reset at any time.

## Features

### Core Functionality
- **Wiki Pages**: Create and edit pages with full Markdown support (GFM, syntax highlighting, tables)
- **Categories**: Organize pages with color-coded categories
- **Tags**: Tag pages for flexible cross-category organization
- **Full-Text Search**: Search across titles and content with category filters
- **Version History**: Every edit creates a new version with optional change summary and restore capability
- **Live Preview Editor**: Split-pane editor with toolbar and real-time Markdown preview
- **Table of Contents**: Auto-generated TOC from page headings
- **Public/Draft/Archived**: Control page visibility with status

### Pix3lBoard Integration
- **Shared Database**: Same Turso database and user accounts as Pix3lBoard
- **Cross-App Auth**: Same JWT tokens work across both apps
- **Board Links**: Link wiki pages to boards and cards
- **Context Bridge**: Navigate from Pix3lBoard with `?board=123&card=456` parameters
- **Back Links**: Quick navigation back to the originating board/card

### Admin Panel
- **Page Management**: View, edit, and delete all pages
- **Category Management**: Create, edit, and delete categories with color picker

### User Experience
- **Dark Mode**: Eye-friendly dark theme with light mode toggle
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Consistent Design**: Same design system as Pix3lBoard (colors, components, typography)
- **Toast Notifications**: Clear feedback for all actions
- **Protected Routes**: Middleware redirects unauthenticated users

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Turso (libSQL/SQLite) - shared with Pix3lBoard
- **Authentication**: Custom JWT with bcryptjs (same as Pix3lBoard)
- **Validation**: Zod schema validation
- **Styling**: Tailwind CSS with custom CSS variables
- **Markdown**: react-markdown + remark-gfm + rehype-highlight + rehype-slug
- **Icons**: Lucide React
- **ID Generation**: nanoid

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- A running Pix3lBoard instance (same Turso database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Pix3ltools-lab/pix3lwiki.git
cd pix3lwiki
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials (same as Pix3lBoard):
```env
# Turso Database (same as Pix3lBoard)
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# JWT Secret (same as Pix3lBoard for token compatibility)
JWT_SECRET="your-jwt-secret"

# Pix3lBoard URL
NEXT_PUBLIC_PIX3LBOARD_URL=https://board.pix3ltools.com
```

4. Initialize the wiki tables:
```bash
npm run db:setup
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3001](http://localhost:3001) in your browser

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_PIX3LBOARD_URL`
4. Deploy

## Project Structure

```
pix3lwiki/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication (login, me, logout)
│   │   └── wiki/                 # Wiki API
│   │       ├── pages/            # Pages CRUD + versions
│   │       ├── categories/       # Categories CRUD
│   │       ├── search/           # Full-text search
│   │       └── links/            # Pix3lBoard links
│   ├── admin/                    # Admin panel
│   ├── auth/login/               # Login page
│   ├── wiki/
│   │   ├── [slug]/               # Page view + edit
│   │   ├── categories/[cat]/     # Category listing
│   │   ├── new/                  # New page
│   │   └── search/               # Search
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles + prose-wiki
├── components/
│   ├── admin/                    # PageTable, CategoryManager
│   ├── layout/                   # Header, Sidebar, Footer, ThemeToggle
│   ├── providers/                # AppProvider
│   ├── ui/                       # Button, Input, Modal, Spinner, Toast, etc.
│   └── wiki/                     # MarkdownRenderer, WikiEditor, WikiCard, etc.
├── lib/
│   ├── auth/                     # JWT auth + middleware helpers
│   ├── bridge/                   # Pix3lBoard integration bridge
│   ├── context/                  # AuthContext, UIContext
│   ├── db/                       # Turso client + setup
│   ├── utils/                    # ID generation, slugify
│   ├── validation/               # Zod schemas
│   └── constants.ts              # App constants
├── types/                        # TypeScript types
└── middleware.ts                  # Route protection
```

## Database Schema

Wiki-specific tables (in the shared Turso database):

```sql
wiki_categories    -- Categories with name, slug, color, sort_order
wiki_pages         -- Pages with title, slug, content, category, tags, status, version
wiki_versions      -- Version history per page with change summary
pix3lboard_links   -- Cross-references to boards/cards/workspaces
```

## Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run db:setup` - Initialize wiki database tables

## Security

- **Authentication**: JWT tokens stored in HttpOnly cookies with SameSite protection
- **Password Security**: bcrypt hashing with 12 salt rounds (via Pix3lBoard)
- **Input Validation**: Zod schema validation on all API inputs
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **SQL Injection Prevention**: Parameterized queries throughout
- **Route Protection**: Middleware redirects for authenticated-only pages
- **Authorization**: Only authors and admins can edit/delete pages

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Turso](https://turso.tech/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [Lucide Icons](https://lucide.dev/)

---

**Part of [Pix3lTools](https://x.com/pix3ltools)**

Made with the help of Claude Code
