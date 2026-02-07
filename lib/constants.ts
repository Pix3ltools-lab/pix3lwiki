// App version
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.1.0';

// Pix3lBoard integration
export const PIX3LBOARD_URL = process.env.NEXT_PUBLIC_PIX3LBOARD_URL || 'https://board.pix3ltools.com';

// Toast durations
export const TOAST_DURATION = 3000;
export const TOAST_DURATION_ERROR = 5000;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Content limits
export const MAX_TITLE_LENGTH = 200;
export const MAX_CONTENT_LENGTH = 100000;
export const MAX_TAG_LENGTH = 50;
export const MAX_TAGS = 10;

// Search
export const SEARCH_DEBOUNCE_MS = 300;
