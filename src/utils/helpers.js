/**
 * Formats a UTC timestamp into a human-readable string.
 * @param {string} dateStr ISO date string
 * @param {boolean} withTime Include hour/minute in output
 */
export const formatDate = (dateStr, withTime = false) => {
  if (!dateStr) return 'Unknown';
  const opts = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  };
  return new Date(dateStr).toLocaleDateString(undefined, opts);
};

/**
 * Converts bytes to a human-readable file size string.
 * @param {number} bytes
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Truncates a string to a maximum character count, appending ellipsis.
 * @param {string} str
 * @param {number} maxLen
 */
export const truncate = (str, maxLen = 40) => {
  if (!str || str.length <= maxLen) return str;
  return `${str.substring(0, maxLen)}...`;
};

/**
 * Extracts filename without its extension.
 * @param {string} filename
 */
export const stripExtension = (filename) => {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? filename : filename.substring(0, lastDot);
};

/**
 * Clamps a number between min and max bounds.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Builds a full asset URL — resolves relative backend paths to absolute localhost URL in development.
 * @param {string} url Path from database (either https:// or /uploads/...)
 */
export const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://quleep-backend-e33h.onrender.com';
  return `${base}${url}`;
};
