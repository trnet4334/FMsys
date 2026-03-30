const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Validate request origin for CSRF protection.
 * Safe methods (GET, HEAD, OPTIONS) always pass.
 * Mutating methods require a matching Origin header.
 *
 * @param {string} method - HTTP method
 * @param {string|null} origin - Origin header value
 * @param {string[]} allowedOrigins - List of allowed origin URLs
 * @returns {boolean}
 */
export function validateOrigin(method, origin, allowedOrigins) {
  if (SAFE_METHODS.has(method)) return true;
  return origin != null && allowedOrigins.includes(origin);
}
