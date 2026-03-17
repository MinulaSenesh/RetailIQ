import React from 'react';

export const MastercardIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="10" cy="16" r="10" fill="#EB001B"/>
        <circle cx="22" cy="16" r="10" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

export const VisaIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M11.6,20.4l1.6-9.7h2.6l-1.6,9.7H11.6z M27,11.2l-2.4,9.2h-2.3l-1.3-4.7c-0.3-1.1-0.6-1.5-1.5-2 c-1.4-0.8-3.7-1.5-5.1-1.8l0.1-0.5h5.1c1.2,0,2.1,0.8,2.4,1.9l1.1,5.6l2.1-7.7H27z M10.4,11.2l-3,6.3L6.1,11.2H2.9l4.5,9.2h2.8 l4.7-9.2H10.4z" fill="#1A1F71"/>
        <path d="M6.1,11.2L5.8,12.8" stroke="#F7B600" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

export const AmexIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="32" height="20" y="6" rx="3" fill="#016FD0"/>
        <text x="50%" y="19" textAnchor="middle" fill="white" fontFamily="sans-serif" fontWeight="bold" fontSize="8">AMEX</text>
    </svg>
);
