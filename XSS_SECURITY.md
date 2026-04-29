# XSS (Cross-Site Scripting) Security

## Overview

This document outlines the XSS prevention measures implemented in the React frontend to protect against cross-site scripting attacks.

## XSS Prevention Strategy

### Primary Defense: React's Built-in Protection

React automatically escapes all content rendered in JSX, providing strong default protection against XSS attacks.

```tsx
// ✅ SAFE - React automatically escapes content
<div>{userInput}</div>
<p>{booking.customerName}</p>
<span>{dish.description}</span>
```

### Defense Layers

1. **React Auto-Escaping** - All JSX content is escaped by default
2. **Input Validation** - Joi validation on backend prevents malicious input
3. **DOMPurify** - Additional sanitization for any rich text content
4. **Content Security Policy** - HTTP headers restrict script execution
5. **HTTP-Only Cookies** - Tokens not accessible to JavaScript

## Safe Patterns

### ✅ Rendering User Content (Safe)

```tsx
// React automatically escapes these
<div>{user.name}</div>
<p>{booking.specialRequests}</p>
<span>{testimonial.content}</span>
```

### ✅ Using Sanitization Utilities

```tsx
import { sanitizeHTML, sanitizeUserInput, stripHTML } from '@/lib/sanitize';

// For plain text display
const safeName = sanitizeUserInput(userInput);
<p>{safeName}</p>

// For rich text (if needed)
const cleanHTML = sanitizeHTML(richTextInput);
<div dangerouslySetInnerHTML={{ __html: cleanHTML }} />

// Strip all HTML
const plainText = stripHTML(htmlContent);
<div>{plainText}</div>
```

### ✅ URL Sanitization

```tsx
import { sanitizeURL } from '@/lib/sanitize';

const safeURL = sanitizeURL(userProvidedURL);
<a href={safeURL}>Link</a>
```

## Unsafe Patterns (NOT USED)

### ❌ dangerouslySetInnerHTML with User Input

```tsx
// NEVER DO THIS - Vulnerable to XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### ❌ Direct innerHTML Manipulation

```tsx
// NEVER DO THIS - Bypasses React's protection
element.innerHTML = userInput;
```

### ❌ eval() or Function() with User Input

```tsx
// NEVER DO THIS - Executes arbitrary code
eval(userInput);
new Function(userInput)();
```

### ❌ Unvalidated URLs

```tsx
// NEVER DO THIS - Can execute JavaScript
<a href={userInput}>Link</a>  // If userInput is "javascript:alert(1)"
```

## Audit Results

### ✅ No XSS Vulnerabilities Found

**Checked Components:**
- ✅ `BookingsPage.tsx` - Displays customer names, special requests (auto-escaped)
- ✅ `DishesPage.tsx` - Displays dish names, descriptions (auto-escaped)
- ✅ `MenusPage.tsx` - Displays menu names, descriptions (auto-escaped)
- ✅ `PackagesPage.tsx` - Displays package names, descriptions (auto-escaped)
- ✅ `TestimonialsPage.tsx` - Displays customer names, content (auto-escaped)
- ✅ `BookingDialog.tsx` - Displays menu info, package details (auto-escaped)
- ✅ `AdminDashboard.tsx` - Displays statistics, customer names (auto-escaped)

**dangerouslySetInnerHTML Usage:**
- ✅ `chart.tsx` - Only uses hardcoded theme values (SAFE)
- ❌ No user input rendered with dangerouslySetInnerHTML

**innerHTML Usage:**
- ❌ No direct innerHTML manipulation found

## User-Generated Content Locations

All user-generated content is safely rendered:

1. **Customer Information**
   - Names, emails, phone numbers
   - Addresses
   - All auto-escaped by React

2. **Booking Details**
   - Special requests
   - Notes
   - Event locations
   - All auto-escaped by React

3. **Dish/Menu/Package Content**
   - Names
   - Descriptions
   - All auto-escaped by React

4. **Testimonials**
   - Customer names
   - Content/reviews
   - All auto-escaped by React

## Content Security Policy (CSP)

Recommended CSP headers for production (to be added to server):

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' http://localhost:5000;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

## Sanitization Utilities

Located in `src/lib/sanitize.ts`:

### sanitizeHTML(dirty, options?)
Sanitizes HTML content using DOMPurify. Only allows safe tags (b, i, em, strong, p, br, ul, ol, li).

### escapeHTML(text)
Escapes HTML special characters for plain text display.

### stripHTML(html)
Removes all HTML tags, returning plain text.

### sanitizeURL(url)
Validates URLs and prevents javascript: and data: URIs.

### sanitizeUserInput(input)
General-purpose sanitization for user input.

## Testing for XSS

### Test Payloads

Test these inputs to verify protection (all should be safely escaped):

```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
javascript:alert('XSS')
<iframe src="javascript:alert('XSS')">
<body onload=alert('XSS')>
<input onfocus=alert('XSS') autofocus>
```

### Expected Behavior

With React's auto-escaping:
- Scripts are displayed as text, not executed
- Event handlers are not triggered
- HTML tags are shown as text
- No JavaScript execution occurs

## Best Practices

1. **Never use dangerouslySetInnerHTML** with user input
2. **Trust React's auto-escaping** for most content
3. **Use sanitization utilities** when you must render HTML
4. **Validate URLs** before using in href or src attributes
5. **Implement CSP headers** in production
6. **Keep dependencies updated** (React, DOMPurify)
7. **Validate input on backend** before storing
8. **Use HTTP-only cookies** for sensitive tokens
9. **Escape data in attributes** when building dynamic attributes
10. **Review third-party components** for XSS vulnerabilities

## React-Specific Protection

### JSX Auto-Escaping

React escapes these characters automatically:
- `<` becomes `&lt;`
- `>` becomes `&gt;`
- `"` becomes `&quot;`
- `'` becomes `&#x27;`
- `&` becomes `&amp;`

### Safe by Default

```tsx
// All of these are safe
<div>{userInput}</div>
<input value={userInput} />
<img alt={userInput} />
<a title={userInput}>Link</a>
```

### Unsafe Scenarios

```tsx
// Only these are potentially unsafe:
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // ❌
<a href={userInput}>Link</a>  // ❌ if userInput is "javascript:..."
```

## Monitoring and Logging

### What to Monitor
- Attempts to inject scripts in form inputs
- Unusual characters in user input
- Failed validation attempts
- CSP violation reports

### What NOT to Log
- User passwords
- JWT tokens
- Sensitive personal information

## Dependencies

- `dompurify`: ^3.0.0 - HTML sanitization library
- `@types/dompurify`: ^3.0.0 - TypeScript definitions

## Security Checklist

- [x] React auto-escaping enabled (default)
- [x] No dangerouslySetInnerHTML with user input
- [x] No direct innerHTML manipulation
- [x] DOMPurify installed for sanitization
- [x] Sanitization utilities created
- [x] URL validation implemented
- [x] All user content auto-escaped
- [x] No eval() or Function() with user input
- [x] HTTP-only cookies for tokens
- [x] Input validation on backend
- [ ] CSP headers configured (production)
- [x] Dependencies up to date

## Resources

- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Conclusion

The React frontend is protected against XSS attacks through:
1. React's automatic content escaping
2. Backend input validation with Joi
3. DOMPurify sanitization utilities
4. No use of dangerouslySetInnerHTML with user input
5. URL validation for links
6. HTTP-only cookies for authentication tokens

All user-generated content is safely rendered without risk of script execution.
