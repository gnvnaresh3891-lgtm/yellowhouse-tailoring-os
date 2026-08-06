/**
 * Auto-generates a clean slug from boutique name.
 * e.g., "Savile Row Atelier & Co." -> "savile-row-atelier-co"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim leading hyphen
    .replace(/-+$/, ''); // Trim trailing hyphen
}

/**
 * Validates slug format against rule: 3-50 chars, lowercase alphanumeric characters and hyphens only, no leading/trailing hyphens.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
