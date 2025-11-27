import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    theme: string;
}

const Card: React.FC<CardProps> = ({ title, children, theme }) => (
    <div className={`
        p-4 md:p-6 rounded-xl border transition-all h-full flex flex-col
        ${theme === 'CONSOLE' ? 'bg-white border-black text-black shadow-sm' : ''}
        ${theme === 'DOODLE' ? 'bg-[#2a2a2a] border-2 border-dashed border-gray-600 shadow-[4px_4px_0px_rgba(255,255,255,0.2)]' : ''}
        ${theme === 'DEFAULT' ? 'bg-kraken-card border-gray-700 hover:border-gray-600' : ''}
    `}>
        <h3 className={`text-base md:text-lg font-bold mb-4 ${theme === 'CONSOLE' ? 'text-black uppercase tracking-widest border-b border-black pb-2' : 'text-gray-200'}`}>
            {title}
        </h3>
        <div className="flex-1">
            {children}
        </div>
    </div>
);

export default Card;
