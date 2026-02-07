# Contributing to Pix3lWiki

Thank you for your interest in contributing to Pix3lWiki! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We're building tools to help content creators succeed.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the issue template** with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS version

### Suggesting Features

1. **Open an issue** with the `enhancement` label
2. **Describe the feature** and its use case
3. **Explain why** it would benefit users
4. **Consider alternatives** you've thought about

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following our code style
4. **Test thoroughly** - ensure `npm run build` and `npm run type-check` pass
5. **Commit with clear messages**: Use conventional commits (feat:, fix:, docs:, etc.)
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Open a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/videos if UI changes

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- A Pix3lBoard Turso database (shared)

### Installation

```bash
# Clone the repository
git clone https://github.com/Pix3ltools-lab/pix3lwiki.git
cd pix3lwiki

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Turso credentials (same as Pix3lBoard)

# Initialize wiki tables
npm run db:setup

# Start development server
npm run dev
```

The app will be available at `http://localhost:3001`

### Build

```bash
npm run build
npm run start
```

## Code Style Guidelines

### TypeScript/React

- Use **TypeScript** strict mode
- Use **functional components** with hooks
- Follow **React best practices**
- Use **descriptive variable names**
- Keep components **focused and small**

### File Organization

```
pix3lwiki/
├── app/                   # Next.js App Router pages and API routes
├── components/
│   ├── admin/            # Admin panel components
│   ├── layout/           # Header, Sidebar, Footer
│   ├── providers/        # Context providers
│   ├── ui/               # Reusable UI components
│   └── wiki/             # Wiki-specific components
├── lib/
│   ├── auth/             # Authentication
│   ├── bridge/           # Pix3lBoard integration
│   ├── context/          # React contexts
│   ├── db/               # Database client
│   ├── utils/            # Helper functions
│   └── validation/       # Zod schemas
└── types/                # TypeScript types
```

### Naming Conventions

- **Components**: PascalCase (`WikiEditor.tsx`)
- **Files**: camelCase for utils (`slug.ts`)
- **Variables**: camelCase (`selectedPage`)
- **Constants**: UPPER_CASE (`MAX_PAGE_SIZE`)
- **Types**: PascalCase (`WikiPage`, `WikiCategory`)

### Git Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Example:
```
feat: Add version comparison view
fix: Resolve search pagination bug
docs: Update README with deploy instructions
```

## Project Architecture

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS 3.4**: Utility-first styling
- **react-markdown**: Markdown rendering with GFM and syntax highlighting
- **Lucide React**: Icon library
- **Zod**: Schema validation
- **nanoid**: ID generation

### State Management

- **React Context API**: AuthContext, UIContext
- **Server-side**: API routes with Turso database

### Key Files

- `lib/db/turso.ts`: Database singleton (shared with Pix3lBoard)
- `lib/auth/auth.ts`: JWT auth functions (compatible with Pix3lBoard)
- `lib/auth/middleware.ts`: API route auth helpers
- `lib/bridge/pix3lboard.ts`: Cross-app context bridge
- `components/wiki/WikiEditor.tsx`: Markdown editor with live preview
- `components/wiki/MarkdownRenderer.tsx`: Markdown rendering with prose-wiki styles

### Important Notes

- **Shared Database**: Pix3lWiki uses the same Turso database as Pix3lBoard. Wiki tables (`wiki_pages`, `wiki_categories`, `wiki_versions`, `pix3lboard_links`) are separate. Never modify the `users` table schema.
- **CSS Variables**: Tailwind colors based on CSS variables (`bg-bg-secondary`) don't support opacity modifiers in `@apply` directives. Use the color directly or inline styles.
- **Token Compatibility**: JWT tokens are interchangeable with Pix3lBoard. Keep `JWT_SECRET` identical.

## Testing

Before submitting a PR, test:

1. **Auth**: Login with Pix3lBoard credentials
2. **Page CRUD**: Create, edit, delete pages
3. **Markdown**: Headers, code blocks, tables, GFM features
4. **Categories**: Create, edit, delete, assign to pages
5. **Search**: Search by title and content, filter by category
6. **Versions**: Edit creates new version, restore works
7. **Admin panel**: Page table and category manager
8. **Navigation**: Sidebar, header links, breadcrumbs
9. **Theme toggle**: Dark/light mode persistence
10. **Build**: `npm run build` and `npm run type-check` pass

## Questions?

- Open an issue with the `question` label
- Check existing discussions
- Review the README.md

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Pix3lWiki!**

Part of the [Pix3lTools](https://github.com/Pix3ltools-lab) suite.
