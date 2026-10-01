/**
 * Normalizes an Indonesian phone number to international 62 format.
 * E.g. "081234567890" -> "6281234567890"
 * "+62 812-3456-7890" -> "6281234567890"
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  // Remove non-digit characters
  let clean = phone.toString().replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  return clean;
}

/**
 * Mask phone number for privacy display (e.g. 62812****7890)
 */
export function maskPhoneNumber(phone) {
  if (!phone) return '-';
  const clean = normalizePhoneNumber(phone);
  if (clean.length < 8) return clean;
  const prefix = clean.slice(0, 5);
  const suffix = clean.slice(-4);
  return `${prefix}••••${suffix}`;
}

/**
 * Formats a normalized number into readable spaced format
 * 6281234567890 -> +62 812-3456-7890
 */
export function formatPhoneNumber(phone) {
  const clean = normalizePhoneNumber(phone);
  if (!clean.startsWith('62')) return clean;
  const rest = clean.slice(2);
  if (rest.length >= 9) {
    return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
  }
  return `+${clean}`;
}
