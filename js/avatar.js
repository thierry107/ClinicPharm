/**
 * Curis Health - User Profile Avatar Helper
 * Provides a reusable, offline-first fallback mechanism for user profile pictures.
 * Displays a neutral "No Profile Photo" placeholder when avatar_url is absent or invalid.
 */

// Modern, neutral SVG "No Profile Photo" placeholder (offline-first, zero asset request)
export const DEFAULT_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="24" fill="#1e293b"/>
    <circle cx="24" cy="18" r="8" fill="#94a3b8"/>
    <path d="M10 40c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#94a3b8"/>
  </svg>`
)}`;

/**
 * Returns a valid avatar URL or falls back to DEFAULT_AVATAR.
 * Supports both avatar_url and avatar properties.
 * @param {Object} [user] - The user profile object
 * @returns {string} - Valid image URL or default SVG data URI
 */
export function getAvatarUrl(user) {
  if (!user) return DEFAULT_AVATAR;
  const url = user.avatar_url || user.avatar;
  if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('unsplash.com')) {
    return DEFAULT_AVATAR;
  }
  return url.trim();
}

/**
 * Generates an <img> element string with built-in onerror fallback.
 * @param {Object} [user] - The user profile object
 * @param {string} [className='user-avatar'] - CSS class name(s)
 * @returns {string} - HTML string
 */
export function renderAvatarHTML(user, className = 'user-avatar') {
  const url = getAvatarUrl(user);
  const name = user?.name || user?.full_name || 'User';
  return `<img src="${url}" alt="${name}" class="${className}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}'">`;
}
