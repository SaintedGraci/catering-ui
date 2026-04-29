import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param dirty - The potentially unsafe HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * ```tsx
 * const cleanHTML = sanitizeHTML(userInput);
 * <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
 * ```
 */
export function sanitizeHTML(
  dirty: string,
  options?: DOMPurify.Config
): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    ...options,
  });
}

/**
 * Escape HTML special characters to prevent XSS
 * Use this when you want to display user input as plain text
 * 
 * @param text - The text to escape
 * @returns Escaped text safe for rendering
 * 
 * @example
 * ```tsx
 * const safeText = escapeHTML(userInput);
 * <div>{safeText}</div>
 * ```
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Strip all HTML tags from a string
 * Useful for displaying user input in plain text contexts
 * 
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 * 
 * @example
 * ```tsx
 * const plainText = stripHTML(userInput);
 * <p>{plainText}</p>
 * ```
 */
export function stripHTML(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

/**
 * Validate and sanitize a URL to prevent javascript: and data: URIs
 * 
 * @param url - The URL to validate
 * @returns Sanitized URL or empty string if invalid
 * 
 * @example
 * ```tsx
 * const safeURL = sanitizeURL(userProvidedURL);
 * <a href={safeURL}>Link</a>
 * ```
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http, https, and mailto protocols
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return url;
    }
    return '';
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Sanitize user input for safe display
 * This is the default function to use for most user-generated content
 * React already escapes content by default, but this provides extra protection
 * 
 * @param input - User input to sanitize
 * @returns Sanitized string
 */
export function sanitizeUserInput(input: string): string {
  // Remove any HTML tags
  const stripped = stripHTML(input);
  // Trim whitespace
  return stripped.trim();
}
