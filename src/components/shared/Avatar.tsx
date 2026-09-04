import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  gender?: 'M' | 'F' | string;
  size?: 'sm' | 'lg';
}

export function Avatar({ src, name = 'P', gender, size = 'sm' }: AvatarProps) {
  const sz = size === 'lg' ? 'w-24 h-24 md:w-28 md:h-28' : 'w-11 h-11 md:w-12 md:h-12';

  const isFemale = gender === 'F' || gender === 'Femenino';
  const isGeneric = !src || src.includes('dicebear') || src.includes('ui-avatars') || src.includes('pravatar');

  const renderClayRestroomIcon = () => {
    const color = isFemale ? '#f472b6' : '#008190'; // Rosa 400 o Azul Petróleo 500

    return (
      <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 drop-shadow-lg transition-transform duration-500 group-hover:scale-110">
        <defs>
          <radialGradient id={`clayGrad-${gender}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="black" stopOpacity="0.1" />
          </radialGradient>
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {isFemale ? (
          // ICONO BAÑO MUJER 3D (Vestido)
          <g filter="url(#clayShadow)">
            <circle cx="50" cy="25" r="15" fill={color} />
            <path d="M50 42 L25 85 L75 85 Z" fill={color} stroke={color} strokeWidth="8" strokeLinejoin="round" />
            <circle cx="50" cy="25" r="15" fill={`url(#clayGrad-${gender})`} />
            <path d="M50 42 L25 85 L75 85 Z" fill={`url(#clayGrad-${gender})`} stroke="none" />
          </g>
        ) : (
          // ICONO BAÑO HOMBRE 3D (Cuerpo recto)
          <g filter="url(#clayShadow)">
            <circle cx="50" cy="25" r="15" fill={color} />
            <rect x="32" y="42" width="36" height="43" rx="15" fill={color} />
            <circle cx="50" cy="25" r="15" fill={`url(#clayGrad-${gender})`} />
            <rect x="32" y="42" width="36" height="43" rx="15" fill={`url(#clayGrad-${gender})`} />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className={`${sz} relative flex items-center justify-center shrink-0 group transition-all duration-500`}>
      {/* Círculo contenedor con profundidad */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 border-2 shadow-inner ${
          isFemale
            ? 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50'
            : 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50'
        }`}
      ></div>

      {/* Personaje "Restroom" en Plastilina */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {isGeneric ? (
          renderClayRestroomIcon()
        ) : (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover rounded-full p-[3px]"
          />
        )}
      </div>

      {/* Brillo Quirúrgico */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    </div>
  );
}
