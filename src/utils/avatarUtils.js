// Utility functions for generating realistic, diverse, and elegant lecturer avatars

export const MALE_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
];

export const FEMALE_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
];

export const GRADIENT_PALETTES = [
  { from: 'from-indigo-600', to: 'to-purple-600', text: 'text-white' },
  { from: 'from-blue-600', to: 'to-cyan-600', text: 'text-white' },
  { from: 'from-emerald-600', to: 'to-teal-600', text: 'text-white' },
  { from: 'from-rose-600', to: 'to-orange-500', text: 'text-white' },
  { from: 'from-violet-600', to: 'to-fuchsia-600', text: 'text-white' },
  { from: 'from-amber-600', to: 'to-red-600', text: 'text-white' },
  { from: 'from-cyan-600', to: 'to-blue-700', text: 'text-white' },
  { from: 'from-teal-600', to: 'to-emerald-700', text: 'text-white' }
];

const FEMALE_NAME_KEYWORDS = [
  'yenny', 'yeni', 'yayu', 'sri', 'rahayu', 'siti', 'dewi', 'ayu', 'putri',
  'nur', 'indah', 'inda', 'dian', 'anita', 'ratna', 'rina', 'dwi', 'linda',
  'sarah', 'fatimah', 'aisyah', 'tri', 'kartika', 'novi', 'wulan', 'maya',
  'fitri', 'retno', 'maria', 'eka', 'lia', 'rini', 'mutia', 'amelia', 'mega',
  'nadia', 'pratiwi', 'safitri', 'anggraeni', 'zahra', 'tiara', 'annis'
];

// Hash string deterministically
export function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Clean titles from lecturer name to get clean name
export function cleanLecturerName(name = '') {
  if (!name) return 'Dosen';
  return name
    .replace(/(Prof\.|Dr\.|Drs\.|Dra\.|Ir\.|H\.|Hj\.)/gi, '')
    .replace(/(,\s*(M\.Kom\.|M\.T\.|S\.T\.|S\.Kom\.|M\.Sc\.|Ph\.D\.|M\.Pd\.|S\.Pd\.|M\.Si\.|S\.Si\.|M\.M\.|S\.E\.|B\.Sc\.|M\.Eng\.|S\.Ked\.?|M\.H\.?|S\.H\.?|M\.Kn\.?|Sp\.[A-Z]+)).*$/gi, '')
    .trim();
}

// Get initials (1-2 uppercase letters)
export function getInitials(name = '') {
  const clean = cleanLecturerName(name);
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'D';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Detect if name is likely female
export function isLikelyFemale(name = '') {
  const lower = name.toLowerCase();
  return FEMALE_NAME_KEYWORDS.some((kw) => lower.includes(kw));
}

// Get deterministic gradient
export function getGradientByName(name = '') {
  const hash = hashString(name);
  return GRADIENT_PALETTES[hash % GRADIENT_PALETTES.length];
}

// Check if avatar is the old bad placeholder that caused everyone to look identical
export const OLD_BAD_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';

export function isBadAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string') return true;
  return avatar.includes('photo-1534528741775-53994a69daeb');
}

// Get deterministic realistic photo for lecturer
export function getDefaultLecturerPhoto(name = '') {
  const hash = hashString(name);
  const female = isLikelyFemale(name);
  const presets = female ? FEMALE_AVATAR_PRESETS : MALE_AVATAR_PRESETS;
  return presets[hash % presets.length];
}

// Resolve avatar src or fallback
export function resolveLecturerAvatar(avatar, name = '') {
  if (avatar === 'initials') {
    return null;
  }
  if (avatar && !isBadAvatar(avatar)) {
    return avatar;
  }
  return getDefaultLecturerPhoto(name);
}
