import React from 'react';
import { Sword } from 'lucide-react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';

interface DashboardViewProps {
    theme: 'DEFAULT' | 'DOODLE' | 'CONSOLE';
}

const DashboardView: React.FC<DashboardViewProps> = ({ theme }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card title={theme === 'DOODLE' ? 'Current Bounty' : (theme === 'CONSOLE' ? 'Primary Directive' : 'Active Quest')} theme={theme}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0
                ${theme === 'CONSOLE' ? 'bg-black text-white' : ''}
                ${theme === 'DOODLE' ? 'bg-white text-black border-2 border-black' : ''}
                ${theme === 'DEFAULT' ? 'bg-purple-500/20 text-purple-400' : ''}
            `}>
                    <Sword size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">Deploy to Production</h3>
                    <p className={`text-xs md:text-sm mb-3 ${theme === 'CONSOLE' ? 'text-gray-600' : 'text-gray-400'}`}>Complete 3 CI/CD pipeline deployments.</p>
                    <ProgressBar progress={66} color={theme === 'CONSOLE' ? 'bg-black' : 'bg-purple-500'} theme={theme} />
                    <p className={`text-xs text-right mt-1 ${theme === 'CONSOLE' ? 'text-black' : 'text-purple-400'}`}>2/3 Completed</p>
                </div>
            </div>
        </Card>

        <Card title={theme === 'DOODLE' ? 'Loot' : (theme === 'CONSOLE' ? 'System Logs' : 'Daily Rewards')} theme={theme}>
            <div className="flex justify-between items-center h-full">
                {['M', 'T', 'W', 'T'].map((day, i) => (
                    <div key={day} className="text-center">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all
                        ${i === 1
                                ? (theme === 'CONSOLE' ? 'bg-black text-white border-2 border-black' : (theme === 'DOODLE' ? 'bg-white border-2 border-dashed border-black text-black' : 'bg-kraken-primary/20 border border-kraken-primary text-kraken-primary'))
                                : (theme === 'CONSOLE' ? 'border border-gray-300 text-gray-400' : 'bg-gray-800 text-gray-500')}
                    `}>
                            {day}
                        </div>
                        <div className={`text-[10px] md:text-xs ${theme === 'CONSOLE' ? 'text-black font-bold' : 'text-gray-500'}`}>{i === 1 ? 'Today' : 'Wed'}</div>
                    </div>
                ))}
            </div>
        </Card>

        <Card title={theme === 'DOODLE' ? 'Chronicles' : (theme === 'CONSOLE' ? 'Output Stream' : 'Recent Activity')} theme={theme}>
            <ul className="space-y-3 text-xs md:text-sm">
                {[
                    { txt: 'Applied to Netflix', xp: '+50 XP' },
                    { txt: 'Updated Profile', xp: '+20 XP' }
                ].map((item, i) => (
                    <li key={i} className={`flex justify-between ${theme === 'CONSOLE' ? 'text-gray-800' : 'text-gray-300'}`}>
                        <span>{item.txt}</span>
                        <span className={theme === 'CONSOLE' ? 'text-black font-bold' : 'text-green-400'}>{item.xp}</span>
                    </li>
                ))}
                <li className={`flex justify-between ${theme === 'CONSOLE' ? 'text-gray-800' : 'text-gray-300'}`}>
                    <span>Skill Badge: React</span>
                    <span className="text-yellow-500">Badge</span>
                </li>
            </ul>
        </Card>
    </div>
);

export default DashboardView;
