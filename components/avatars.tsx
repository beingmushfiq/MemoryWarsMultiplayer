import React from 'react';

interface AvatarProps {
    className?: string;
}

export const Avatar1: React.FC<AvatarProps> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#22d3ee"/>
        <circle cx="50" cy="50" r="38" fill="#0891b2"/>
        <path d="M30 60 C35 70, 65 70, 70 60" stroke="#f0f9ff" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="38" cy="45" r="5" fill="#f0f9ff"/>
        <circle cx="62" cy="45" r="5" fill="#f0f9ff"/>
    </svg>
);

export const Avatar2: React.FC<AvatarProps> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#a3e635"/>
        <circle cx="50" cy="50" r="38" fill="#65a30d"/>
        <rect x="30" y="58" width="40" height="8" rx="4" fill="#f0f9ff"/>
        <rect x="35" y="40" width="10" height="10" fill="#f0f9ff" rx="2"/>
        <rect x="55" y="40" width="10" height="10" fill="#f0f9ff" rx="2"/>
    </svg>
);

export const Avatar3: React.FC<AvatarProps> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#f97316"/>
        <circle cx="50" cy="50" r="38" fill="#ea580c"/>
        <path d="M35 40 L65 40 L50 60 Z" fill="#f0f9ff"/>
        <circle cx="50" cy="70" r="8" fill="#f0f9ff"/>
    </svg>
);

export const Avatar4: React.FC<AvatarProps> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#8b5cf6"/>
        <circle cx="50" cy="50" r="38" fill="#6d28d9"/>
        <path d="M35 65 Q50 50 65 65" stroke="#f0f9ff" strokeWidth="4" strokeLinecap="round"/>
        <path d="M40 40 L35 50" stroke="#f0f9ff" strokeWidth="4" strokeLinecap="round"/>
        <path d="M60 40 L65 50" stroke="#f0f9ff" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

export const Avatar5: React.FC<AvatarProps> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#ec4899"/>
        <circle cx="50" cy="50" r="38" fill="#be185d"/>
        <circle cx="50" cy="50" r="15" fill="#f0f9ff"/>
        <circle cx="50" cy="50" r="8" fill="#be185d"/>
    </svg>
);

export const Avatar6: React.FC<AvatarProps> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#facc15"/>
        <circle cx="50" cy="50" r="38" fill="#ca8a04"/>
        <path d="M30 35 L70 65" stroke="#f0f9ff" strokeWidth="5" strokeLinecap="round"/>
        <path d="M70 35 L30 65" stroke="#f0f9ff" strokeWidth="5" strokeLinecap="round"/>
    </svg>
);

export const AvatarAI: React.FC<AvatarProps> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#475569"/>
        <circle cx="50" cy="50" r="38" fill="#1e293b"/>
        <rect x="25" y="58" width="50" height="6" rx="3" fill="#64748b"/>
        <circle cx="50" cy="45" r="10" fill="#f87171"/>
        <circle cx="50" cy="45" r="5" fill="#dc2626"/>
        <path d="M40 30 L30 20 M60 30 L70 20" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

export const AVATARS: { [key: string]: React.FC<AvatarProps> } = {
    avatar1: Avatar1,
    avatar2: Avatar2,
    avatar3: Avatar3,
    avatar4: Avatar4,
    avatar5: Avatar5,
    avatar6: Avatar6,
    avatarAI: AvatarAI,
};

export const AVATAR_OPTIONS = Object.keys(AVATARS).filter(key => key !== 'avatarAI');

export const getAvatar = (name: string): React.FC<AvatarProps> | null => {
    return AVATARS[name] || null;
};
