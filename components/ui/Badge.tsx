import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    theme: string;
}

const Badge: React.FC<BadgeProps> = ({ children, theme }) => (
    <span className={`px-2 py-1 rounded text-[10px] md:text-xs border
        ${theme === 'CONSOLE' ? 'border-black text-black bg-gray-100' : (theme === 'DOODLE' ? 'border-gray-400 text-gray-300' : 'bg-gray-800 text-gray-300 border-gray-700')}
    `}>
        {children}
    </span>
);

export default Badge;
