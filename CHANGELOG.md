# Changelog

All notable changes to Pix3lWiki will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-02-08

### Added
- **SSO Cross-App Authentication**: Single sign-on between Pix3lBoard and Pix3lWiki
  - Shared `auth-token` cookie on `.pix3ltools.com` domain
  - Login on one app automatically authenticates on the other
  - Logout shared across both apps

### Changed
- Cookie renamed from `token` to `auth-token` for Pix3lBoard compatibility

---

## [1.1.0] - 2026-02-07

### Added
- **Pix3lBoard Integration**: Seamless linking between wiki pages and Pix3lBoard cards
  - Create wiki pages directly from card modal via `?board=ID&card=ID` URL params
  - Automatic redirect to existing wiki page when card already has a linked page
  - Links stored in `pix3lboard_links` table for card-to-page associations
- **Experimental Demo Disclaimers**: Warning banners on homepage matching Pix3lBoard style

### Fixed
- **Login Redirect**: Query params (`?board=ID&card=ID`) now preserved through login redirect
- **Suspense Boundary**: Wrapped `useSearchParams()` in Suspense on login page (Vercel build fix)
- **Page Visibility**: Pages now visible immediately after creation (default status changed from `draft` to `published`)
- **Sidebar Pages**: Removed `status=published` filter from sidebar recent pages
- **Category Pages**: Removed `status=published` filter from category page view
- **Cold Start**: Added `force-dynamic` to all API routes for Vercel serverless

### Changed
- Sidebar now shows "Manage Categories" link for admin users

---

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
