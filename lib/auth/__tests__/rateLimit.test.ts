import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../rateLimit';

describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('truncates to 1000 characters', () => {
    const long = 'a'.repeat(2000);
    expect(sanitizeInput(long)).toHaveLength(1000);
  });

  it('returns empty string for non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeInput(123 as any)).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeInput(null as any)).toBe('');
  });

  it('returns input unchanged when short and trimmed', () => {
    expect(sanitizeInput('test@example.com')).toBe('test@example.com');
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});
