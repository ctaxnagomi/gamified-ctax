import React from 'react';
import Card from '../components/ui/Card';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardViewProps {
    theme: 'DEFAULT' | 'DOODLE' | 'CONSOLE';
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ theme }) => {
    const users = [
        { rank: 1, name: 'Sarah Connor', xp: 15420, role: 'Senior Dev' },
        { rank: 2, name: 'John Doe', xp: 12350, role: 'Full Stack' },
        { rank: 3, name: 'Jane Smith', xp: 11200, role: 'Frontend' },
        { rank: 4, name: 'Alex Murphy', xp: 9800, role: 'Backend' },
        { rank: 5, name: 'You', xp: 2450, role: 'Junior Dev' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
            <Card title={theme === 'DOODLE' ? 'Hall of Fame' : (theme === 'CONSOLE' ? 'Top Contributors' : 'Global Leaderboard')} theme={theme}>
                <div className="space-y-2">
                    {users.map((user) => (
                        <div
                            key={user.rank}
                            className={`
                                flex items-center justify-between p-3 rounded-lg border
                                ${user.rank === 5 ? (theme === 'CONSOLE' ? 'bg-black text-white border-black' : 'bg-kraken-primary/20 border-kraken-primary') : 'border-transparent'}
                                ${theme === 'CONSOLE' && user.rank !== 5 ? 'hover:bg-gray-50' : ''}
                                ${theme !== 'CONSOLE' && user.rank !== 5 ? 'hover:bg-white/5' : ''}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                                    w-8 h-8 flex items-center justify-center rounded font-bold
                                    ${user.rank <= 3 ? (theme === 'CONSOLE' ? 'text-black' : 'text-kraken-accent') : (theme === 'CONSOLE' ? 'text-gray-400' : 'text-gray-500')}
                                `}>
                                    {user.rank <= 3 ? <Trophy size={16} /> : `#${user.rank}`}
                                </div>
                                <div>
                                    <div className={`font-bold ${theme === 'CONSOLE' ? (user.rank === 5 ? 'text-white' : 'text-black') : 'text-white'}`}>
                                        {user.name}
                                    </div>
                                    <div className={`text-xs ${theme === 'CONSOLE' ? (user.rank === 5 ? 'text-gray-300' : 'text-gray-500') : 'text-gray-400'}`}>
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                            <div className={`font-mono font-bold ${theme === 'CONSOLE' ? (user.rank === 5 ? 'text-white' : 'text-black') : 'text-kraken-primary'}`}>
                                {user.xp.toLocaleString()} XP
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default LeaderboardView;
