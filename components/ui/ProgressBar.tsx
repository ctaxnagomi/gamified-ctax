import React from 'react';

interface ProgressBarProps {
    progress: number;
    color: string;
    theme: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color, theme }) => (
    <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'CONSOLE' ? 'bg-gray-200 border border-black' : 'bg-gray-700'}`}>
        <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${progress}%` }}></div>
    </div>
);

export default ProgressBar;
