import React from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { User, Github, Linkedin, Mail } from 'lucide-react';

interface ProfileViewProps {
    theme: 'DEFAULT' | 'DOODLE' | 'CONSOLE';
}

const ProfileView: React.FC<ProfileViewProps> = ({ theme }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Header */}
            <div className="md:col-span-3">
                <Card title={theme === 'DOODLE' ? 'My Sketchbook' : (theme === 'CONSOLE' ? 'User Configuration' : 'Profile Overview')} theme={theme}>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className={`
                            w-24 h-24 rounded-full flex items-center justify-center border-4
                            ${theme === 'CONSOLE' ? 'bg-black text-white border-gray-200' : 'bg-kraken-card border-kraken-primary'}
                        `}>
                            <User size={40} />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className={`text-2xl font-bold ${theme === 'CONSOLE' ? 'text-black' : 'text-white'}`}>Alex Developer</h2>
                            <p className={`mb-4 ${theme === 'CONSOLE' ? 'text-gray-600' : 'text-gray-400'}`}>Full Stack Engineer • Level 12</p>
                            <div className="flex gap-2 justify-center md:justify-start">
                                <Badge theme={theme}>React</Badge>
                                <Badge theme={theme}>TypeScript</Badge>
                                <Badge theme={theme}>Node.js</Badge>
                                <Badge theme={theme}>Design</Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {[Github, Linkedin, Mail].map((Icon, i) => (
                                <button key={i} className={`
                                    p-2 rounded-lg border transition-colors
                                    ${theme === 'CONSOLE' ? 'border-black text-black hover:bg-black hover:text-white' : 'border-gray-700 text-gray-400 hover:text-white hover:border-white'}
                                `} aria-label={`Social Link ${i}`}>
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Stats */}
            <div className="md:col-span-2">
                <Card title="Statistics" theme={theme}>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Total XP', value: '24,500' },
                            { label: 'Quests', value: '42' },
                            { label: 'Streak', value: '12 Days' },
                            { label: 'Rank', value: '#5' }
                        ].map((stat, i) => (
                            <div key={i} className={`p-4 rounded-lg ${theme === 'CONSOLE' ? 'bg-gray-50' : 'bg-white/5'}`}>
                                <div className={`text-xs uppercase mb-1 ${theme === 'CONSOLE' ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</div>
                                <div className={`text-xl font-bold ${theme === 'CONSOLE' ? 'text-black' : 'text-white'}`}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Recent Badges */}
            <div>
                <Card title="Badges" theme={theme}>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={`
                                aspect-square rounded-lg flex items-center justify-center border
                                ${theme === 'CONSOLE' ? 'border-black bg-white' : 'border-gray-700 bg-white/5'}
                            `}>
                                <div className={`w-8 h-8 rounded-full ${theme === 'CONSOLE' ? 'bg-black' : 'bg-kraken-accent'}`}></div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProfileView;
