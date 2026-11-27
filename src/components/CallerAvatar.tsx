import React from 'react';
import { AvatarStyle, CallerMood } from '../data/scenarios';

interface CallerAvatarProps {
  style: AvatarStyle;
  mood: CallerMood;
  accentColor: string;
}

export const CallerAvatar: React.FC<CallerAvatarProps> = ({ style, mood, accentColor }) => {
  const isAngry = mood === 'furious' || mood === 'impatient';
  const isHappy = mood === 'calm';
  const isSarcastic = mood === 'sarcastic';

  const getHairOrAccessory = () => {
    switch (style) {
      case 'hajja':
        return (
          <>
            <path d="M18 32 C18 14, 46 14, 46 32 L48 48 C42 46, 22 46, 16 48 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
            <circle cx="32" cy="30" r="10.5" fill="#FDE6C4" />
            <circle cx="27" cy="30" r="3" fill="none" stroke="#334155" strokeWidth="1.3" />
            <circle cx="37" cy="30" r="3" fill="none" stroke="#334155" strokeWidth="1.3" />
            <line x1="30" y1="30" x2="34" y2="30" stroke="#334155" strokeWidth="1.3" />
          </>
        );
      case 'auntie':
      case 'mom':
      case 'painter_family':
        return (
          <>
            <path d="M19 30 C19 15, 45 15, 45 30 L47 46 C40 44, 24 44, 17 46 Z" fill={style === 'mom' ? '#7C2D12' : '#1E293B'} />
            <circle cx="32" cy="30" r="10" fill="#F5CBA7" />
          </>
        );
      case 'job_applicant':
        return (
          <>
            <path d="M20 29 C20 14, 44 14, 44 29 L46 47 L18 47 Z" fill="#312E81" />
            <circle cx="32" cy="30" r="10" fill="#FDE6C4" />
          </>
        );
      case 'gamer':
        return (
          <>
            <circle cx="32" cy="31" r="10.5" fill="#F5CBA7" />
            <path d="M21 27 C21 18, 43 18, 43 27" fill="none" stroke="#DC2626" strokeWidth="3.2" strokeLinecap="round" />
            <rect x="18" y="25" width="4.5" height="9" rx="2" fill="#1E293B" />
            <rect x="41.5" y="25" width="4.5" height="9" rx="2" fill="#1E293B" />
            <path d="M21 25 C22 19, 42 19, 43 25 L41 21 C36 18, 28 18, 23 21 Z" fill="#0F172A" />
          </>
        );
      case 'football_fan':
        return (
          <>
            <circle cx="32" cy="31" r="10.5" fill="#E5B88B" />
            <path d="M22 25 C22 18, 42 18, 42 25 L40 22 L24 22 Z" fill="#1E293B" />
            <path d="M24 21 L32 16 L40 21" fill="#DC2626" />
          </>
        );
      case 'grandpa':
      case 'doctor':
        return (
          <>
            <circle cx="32" cy="31" r="10.5" fill="#F5CBA7" />
            <path d="M21 26 C22 21, 27 20, 29 22 M35 22 C37 20, 42 21, 43 26" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M26 37 Q32 40 38 37" stroke="#CBD5E1" strokeWidth="2" fill="none" />
            {style === 'doctor' && (
              <>
                <rect x="24" y="27" width="6.5" height="4.5" rx="1" fill="none" stroke="#0F172A" strokeWidth="1.2" />
                <rect x="33.5" y="27" width="6.5" height="4.5" rx="1" fill="none" stroke="#0F172A" strokeWidth="1.2" />
                <line x1="30.5" y1="29" x2="33.5" y2="29" stroke="#0F172A" strokeWidth="1.2" />
              </>
            )}
          </>
        );
      default:
        return (
          <>
            <circle cx="32" cy="31" r="10.5" fill="#F1C29B" />
            <path d="M21.5 27 C21.5 18, 42.5 18, 42.5 27 C39 22, 25 22, 21.5 27 Z" fill="#1E293B" />
            {(style === 'engineer' || style === 'tech_skeptic') && (
              <>
                <rect x="24" y="27.5" width="6" height="4" rx="1" fill="none" stroke="#0F172A" strokeWidth="1.3" />
                <rect x="34" y="27.5" width="6" height="4" rx="1" fill="none" stroke="#0F172A" strokeWidth="1.3" />
                <line x1="30" y1="29.5" x2="34" y2="29.5" stroke="#0F172A" strokeWidth="1.3" />
              </>
            )}
          </>
        );
    }
  };

  return (
    <div
      className="relative w-14 h-14 rounded-xl shrink-0 flex items-center justify-center border border-slate-200 bg-slate-50 overflow-hidden"
      style={{ backgroundColor: `${accentColor}12` }}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
        <path d="M14 60 C14 47, 50 47, 50 60 Z" fill={accentColor} opacity="0.88" />
        {getHairOrAccessory()}
        {/* Eyes */}
        <circle cx="28" cy="30" r="1.4" fill="#0F172A" />
        <circle cx="36" cy="30" r="1.4" fill="#0F172A" />
        {/* Eyebrows reflecting mood */}
        {isAngry && (
          <>
            <line x1="25" y1="26" x2="30" y2="28" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="39" y1="26" x2="34" y2="28" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}
        {isSarcastic && (
          <>
            <line x1="25" y1="27" x2="30" y2="27" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M34 27 Q36.5 25 39 27" stroke="#0F172A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* Mouth */}
        {isAngry ? (
          <path d="M28 36 Q32 33 36 36" stroke="#7F1D1D" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        ) : isHappy ? (
          <path d="M28 34.5 Q32 38 36 34.5" stroke="#0F172A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        ) : (
          <line x1="29" y1="35.5" x2="35" y2="35.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
};
