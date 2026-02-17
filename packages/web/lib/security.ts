/**
 * Security utilities for safe HTML rendering and input sanitization
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['mark', 'span', 'em', 'strong', 'code', 'pre'],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Escape special regex characters in a string
 * @param string - String to escape
 * @returns String with regex special characters escaped
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight search query in text with sanitization
 * @param text - Text to highlight in
 * @param query - Search query to highlight
 * @param className - CSS class for highlighting
 * @returns Sanitized HTML with highlighted query
 */
export function highlightQuery(
  text: string,
  query: string,
  className: string = 'bg-yellow-200 dark:bg-yellow-900/50'
): string {
  if (!query.trim()) return text;
  
  const escapedQuery = escapeRegExp(query);
  const highlighted = text.replace(
    new RegExp(escapedQuery, 'gi'),
    `<mark class="${className}">$&</mark>`
  );
  
  return sanitizeHtml(highlighted);
}

/**
 * Validate and sanitize user input
 * @param input - User input string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized input
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove angle brackets
}
