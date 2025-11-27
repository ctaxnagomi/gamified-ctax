import React from 'react';
import Badge from '../components/ui/Badge';

interface JobsViewProps {
    theme: 'DEFAULT' | 'DOODLE' | 'CONSOLE';
}

const JobsView: React.FC<JobsViewProps> = ({ theme }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
        {[1, 2, 3].map((i) => (
            <div key={i} className={`
            p-4 md:p-6 rounded-xl border transition-colors group cursor-pointer relative overflow-hidden
            ${theme === 'CONSOLE' ? 'bg-white border-black hover:bg-gray-50' : ''}
            ${theme === 'DOODLE' ? 'bg-[#252525] border-dashed border-gray-500 hover:border-white' : ''}
            ${theme === 'DEFAULT' ? 'bg-kraken-card border-gray-700 hover:border-kraken-primary' : ''}
        `}>
                <div className={`flex flex-col md:flex-row justify-between items-start gap-4`}>
                    <div>
                        <h3 className={`text-lg md:text-xl font-bold group-hover:underline ${theme === 'CONSOLE' ? 'text-black' : 'text-white'}`}>Senior Frontend Engineer</h3>
                        <p className={`text-sm ${theme === 'CONSOLE' ? 'text-gray-600' : 'text-gray-400'}`}>TechCorp Inc. • Remote</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {['React', 'TS', 'Tailwind'].map(skill => <Badge key={skill} theme={theme}>{skill}</Badge>)}
                        </div>
                    </div>
                    <button className={`w-full md:w-auto px-4 py-2 rounded-lg font-medium transition-colors
                    ${theme === 'CONSOLE' ? 'bg-black text-white hover:bg-gray-800' : (theme === 'DOODLE' ? 'bg-white text-black border-2 border-black' : 'bg-kraken-primary hover:bg-blue-600 text-white')}
                `}>
                        Apply
                    </button>
                </div>
            </div>
        ))}
    </div>
);

export default JobsView;
