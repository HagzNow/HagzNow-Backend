/**
 * Converts a relative upload path to a full public URL
 * @param relativePath - Relative path like "users/abc123.webp" or null/undefined
 * @returns Full URL like "https://hagznow.com/uploads/users/abc123.webp" or null
 */
export function getUploadUrl(
  relativePath: string | null | undefined,
): string | null {
  // Handle null/undefined/empty
  if (!relativePath || relativePath.trim() === '') {
    return null;
  }

  // If it's already a full URL, return as-is (backward compatibility)
  if (
    relativePath.startsWith('http://') ||
    relativePath.startsWith('https://')
  ) {
    return relativePath;
  }

  // Get base URL from environment or default to localhost
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // Ensure baseUrl doesn't end with slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  // Ensure relativePath doesn't start with slash
  const cleanPath = relativePath.startsWith('/')
    ? relativePath.substring(1)
    : relativePath;

  // Build and return full URL
  return `${cleanBaseUrl}/uploads/${cleanPath}`;
}
