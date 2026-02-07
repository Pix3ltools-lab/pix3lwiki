# Changelog

All notable changes to Pix3lWiki will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-07

### Added
- **Wiki Pages**: Create and edit pages with full Markdown support (GFM, syntax highlighting, tables)
- **Live Preview Editor**: Split-pane editor with formatting toolbar and real-time Markdown preview
- **Categories**: Color-coded categories with admin CRUD management
- **Tags**: Flexible tagging system for cross-category organization
- **Full-Text Search**: Search across titles and content with category filters and debounce
- **Version History**: Every edit creates a new version with optional change summary and restore capability
- **Table of Contents**: Auto-generated TOC from page headings with smooth scroll
- **Page Status**: Draft, Published, and Archived states
- **Shared Authentication**: Same Turso database and JWT tokens as Pix3lBoard
- **Auth API**: Login, session check, and logout endpoints
- **Admin Panel**: Page table with bulk actions and category manager with color picker
- **Pix3lBoard Bridge**: Cross-app context via URL params (`?board=&card=`) and localStorage
- **Back Links**: Quick navigation back to originating board/card
- **Board Links API**: Link wiki pages to Pix3lBoard boards, cards, and workspaces
- **Layout**: Header with nav, collapsible sidebar with categories and recent pages, footer
- **Theme Toggle**: Dark/light mode with localStorage persistence
- **Route Protection**: Middleware redirects for authenticated-only pages (`/wiki/new`, `/wiki/*/edit`, `/admin`)
- **UI Components**: Button, Input, Textarea, Modal, Spinner, Toast, ConfirmDialog (consistent with Pix3lBoard)
- **Branded Logo**: Pix3lWiki with Pix3lTools color scheme (red 3, blue l)
- **Error Handling**: 404 page, error boundary, loading states
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Vercel Deploy**: vercel.json configuration ready
