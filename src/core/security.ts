/**
 * Sanitizes and escapes untrusted strings before interpolation into innerHTML templates.
 * Mitigates Stored and Reflected Cross-Site Scripting (XSS) vulnerabilities.
 *
 * @param {unknown} value - Value or text to sanitize.
 * @returns {string} HTML-safe sanitized string.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
