import React from 'react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { Scroll, CheckCircle2, Circle } from 'lucide-react';

interface QuestsViewProps {
    theme: 'DEFAULT' | 'DOODLE' | 'CONSOLE';
}

const QuestsView: React.FC<QuestsViewProps> = ({ theme }) => {
    const quests = [
        { id: 1, title: 'First Deployment', desc: 'Deploy your first app to production', progress: 100, xp: 500 },
        { id: 2, title: 'Bug Hunter', desc: 'Resolve 5 critical issues', progress: 60, xp: 300 },
        { id: 3, title: 'Code Reviewer', desc: 'Review 10 pull requests', progress: 20, xp: 1000 },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card title={theme === 'DOODLE' ? 'Adventures' : (theme === 'CONSOLE' ? 'Active Processes' : 'Active Quests')} theme={theme}>
                <div className="space-y-6">
                    {quests.map((quest) => (
                        <div key={quest.id} className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${theme === 'CONSOLE' ? 'bg-black text-white' : 'bg-kraken-primary/20 text-kraken-primary'}`}>
                                        <Scroll size={16} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${theme === 'CONSOLE' ? 'text-black' : 'text-white'}`}>{quest.title}</h4>
                                        <p className={`text-xs ${theme === 'CONSOLE' ? 'text-gray-600' : 'text-gray-400'}`}>{quest.desc}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold ${theme === 'CONSOLE' ? 'text-black' : 'text-kraken-accent'}`}>+{quest.xp} XP</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <ProgressBar progress={quest.progress} color={theme === 'CONSOLE' ? 'bg-black' : 'bg-kraken-success'} theme={theme} />
                                </div>
                                <span className={`text-xs ${theme === 'CONSOLE' ? 'text-black' : 'text-gray-400'}`}>{quest.progress}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default QuestsView;
