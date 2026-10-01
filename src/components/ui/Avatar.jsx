import React, { useState } from 'react';
import {
  getInitials,
  getGradientByName,
  resolveLecturerAvatar,
  isBadAvatar
} from '../../utils/avatarUtils';

const SIZES = {
  xs: { box: 'w-7 h-7 text-[10px]', img: 'w-7 h-7', dot: 'w-1.5 h-1.5' },
  sm: { box: 'w-9 h-9 text-xs', img: 'w-9 h-9', dot: 'w-2 h-2' },
  md: { box: 'w-11 h-11 text-sm', img: 'w-11 h-11', dot: 'w-2.5 h-2.5' },
  lg: { box: 'w-14 h-14 text-base', img: 'w-14 h-14', dot: 'w-3 h-3' },
  xl: { box: 'w-16 h-16 text-lg', img: 'w-16 h-16', dot: 'w-3.5 h-3.5' },
  '2xl': { box: 'w-20 h-20 text-2xl', img: 'w-20 h-20', dot: 'w-4 h-4' }
};

export default function Avatar({
  src,
  name = 'Dosen',
  size = 'md',
  rounded = 'rounded-xl',
  className = '',
  status = null,
  useInitialsOnly = false,
  alt = ''
}) {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZES[size] || SIZES.md;
  const initials = getInitials(name);
  const palette = getGradientByName(name);

  // If user explicitly chose initials or if src is bad/errored
  const showPhoto = !useInitialsOnly && !hasError;
  const finalSrc = resolveLecturerAvatar(src, name);

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      {showPhoto && finalSrc ? (
        <img
          src={finalSrc}
          alt={alt || name}
          onError={() => setHasError(true)}
          className={`${sizeConfig.img} ${rounded} object-cover ring-1 ring-slate-200/80 dark:ring-slate-700/80 shadow-2xs transition-transform duration-200`}
          loading="lazy"
        />
      ) : (
        <div
          className={`${sizeConfig.box} ${rounded} bg-gradient-to-br ${palette.from} ${palette.to} ${palette.text} font-bold flex items-center justify-center shadow-2xs ring-1 ring-white/10 tracking-tight`}
          title={name}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 ${sizeConfig.dot} rounded-full ring-2 ring-white dark:ring-slate-900 ${
            status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}
