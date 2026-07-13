// src/app/components/figma/AppIconPlaceholder.tsx
import React from 'react';

const COLOR_PALETTES = [
  { bg: '#1a3a5c', text: '#85b7eb', badge: '#0c447c' },
  { bg: '#1a3a2a', text: '#5dcaa5', badge: '#0f6e56' },
  { bg: '#3a1a2a', text: '#ed93b1', badge: '#72243e' },
  { bg: '#2a2a1a', text: '#c0dd97', badge: '#3b6d11' },
  { bg: '#2a1a1a', text: '#f09595', badge: '#791f1f' },
  { bg: '#2a1a3a', text: '#afa9ec', badge: '#3c3489' },
  { bg: '#1a2a3a', text: '#85b7eb', badge: '#185fa5' },
  { bg: '#3a2a1a', text: '#fac775', badge: '#854f0b' },
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

interface AppIconPlaceholderProps {
  name: string;
  type: 'apk' | 'url';
  size?: number;
  borderRadius?: number;
}

export function AppIconPlaceholder({
  name,
  type,
  size = 64,
  borderRadius = 16,
}: AppIconPlaceholderProps) {
  const palette = COLOR_PALETTES[hashName(name) % COLOR_PALETTES.length];
  const letter = name.trim()[0]?.toUpperCase() ?? '?';
  const badgeSize = Math.round(size * 0.26);
  const fontSize = Math.round(size * 0.4);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        background: palette.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '0.5px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 500,
          color: palette.text,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {letter}
      </span>

      {/* APK / URL badge */}
      <div
        style={{
          position: 'absolute',
          bottom: Math.round(size * 0.06),
          right: Math.round(size * 0.06),
          width: badgeSize,
          height: badgeSize,
          borderRadius: Math.round(badgeSize * 0.3),
          background: palette.badge,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {type === 'apk' ? (
          // Simple package icon inline SVG
          <svg
            width={badgeSize * 0.6}
            height={badgeSize * 0.6}
            viewBox="0 0 24 24"
            fill="none"
            stroke={palette.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l9 5v8l-9 5-9-5V8z" />
            <polyline points="12 12 21 8" />
            <line x1="12" y1="12" x2="12" y2="22" />
            <polyline points="3 8 12 12" />
          </svg>
        ) : (
          // Globe icon for URLs
          <svg
            width={badgeSize * 0.6}
            height={badgeSize * 0.6}
            viewBox="0 0 24 24"
            fill="none"
            stroke={palette.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3c-2 4-2 14 0 18M12 3c2 4 2 14 0 18M3 12h18" />
          </svg>
        )}
      </div>
    </div>
  );
}
