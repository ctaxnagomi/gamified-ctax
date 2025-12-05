import React, { useState } from 'react';
import Card from '../components/ui/Card';
import EmulatorFrame from '../components/EmulatorFrame';
import { Gamepad2, Disc, RefreshCw, Monitor, ChevronDown, X } from 'lucide-react';

interface Game {
    id: string;
    title: string;
    system: string;
    romUrl: string;
    coverUrl?: string;
}

const SAMPLE_GAMES: Game[] = [
    {
        id: '1',
        title: 'Super Mario Bros',
        system: 'NES',
        romUrl: 'https://archive.org/download/super-mario-bros-nes/Super%20Mario%20Bros%20%28E%29.nes',
    },
    {
        id: '2',
        title: 'Sonic the Hedgehog',
        system: 'SEGA GENESIS',
        romUrl: 'games/sonic.md',
    },
    {
        id: '3',
        title: 'Doom',
        system: 'DOS',
        romUrl: 'games/doom.zip',
    }
];

interface EmulatorViewProps {
    theme: 'DEFAULT' | 'DOODLE' | 'CONSOLE' | 'RETRO' | 'LOFI';
}

const EmulatorView: React.FC<EmulatorViewProps> = ({ theme }) => {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] gap-2 md:gap-4 animate-in fade-in zoom-in duration-500 relative">

            {/* MAIN: Game Display */}
            <div className="flex-1 flex flex-col min-h-0">
                {selectedGame ? (
                    <div className="relative w-full h-full">
                        <EmulatorFrame romUrl={selectedGame.romUrl} gameName={selectedGame.title} />
                        {/* Mobile: Quick game info overlay */}
                        <div className="absolute bottom-2 left-2 right-2 md:hidden bg-black/80 backdrop-blur-sm rounded-lg p-2 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-white">{selectedGame.title}</div>
                                <div className="text-[10px] text-gray-400">{selectedGame.system}</div>
                            </div>
                            <button
                                onClick={() => setSelectedGame(null)}
                                className="p-2 bg-red-500/20 text-red-400 rounded-lg active:scale-95"
                                aria-label="Stop Game"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 border border-dashed border-gray-700 rounded-lg p-4 md:p-8 text-center">
                        <Gamepad2 className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mb-3 md:mb-4 animate-pulse" />
                        <h2 className="text-lg md:text-2xl font-bold text-gray-400 mb-2">No Cartridge Inserted</h2>
                        <p className="text-sm md:text-base text-gray-500 max-w-md px-4">
                            <span className="md:hidden">Tap a game below to start playing.</span>
                            <span className="hidden md:inline">Select a game from the playlist to boot up the system.</span>
                        </p>

                        {/* System Info - Hidden on small mobile */}
                        <div className="hidden sm:block mt-6 md:mt-8 p-3 md:p-4 bg-gray-900/50 rounded-lg border border-gray-800 text-xs text-left max-w-sm">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Disc size={12} /> CORE SYSTEM INFO</h3>
                            <ul className="space-y-1 text-gray-400 font-mono text-[10px] md:text-xs">
                                <li>Engine: EmulatorJS v4.3</li>
                                <li>Cores: Libretro (RetroArch)</li>
                                <li>Render: WebGL 2.0</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-20 right-4 z-50 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
                aria-label="Toggle Game Library"
            >
                {isSidebarOpen ? <ChevronDown size={24} /> : <Gamepad2 size={24} />}
            </button>

            {/* SIDEBAR: Game Library - Bottom sheet on mobile, side panel on desktop */}
            <div className={`
                lg:relative lg:w-72 xl:w-80 lg:shrink-0 lg:flex lg:flex-col lg:gap-4
                fixed lg:static inset-x-0 bottom-0 lg:inset-auto
                transition-transform duration-300 ease-out z-40
                ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
            `}>
                {/* Mobile backdrop */}
                {isSidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 -z-10"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <div className="lg:h-full bg-gray-900 lg:bg-transparent rounded-t-2xl lg:rounded-none max-h-[60vh] lg:max-h-full overflow-hidden">
                    {/* Mobile drag handle */}
                    <div className="lg:hidden flex justify-center py-2">
                        <div className="w-12 h-1 bg-gray-600 rounded-full" />
                    </div>

                    <Card title="Cartridges" theme={theme} className="h-full flex flex-col !rounded-t-none lg:!rounded-lg">
                        {/* Horizontal scroll on mobile, vertical on desktop */}
                        <div className="flex-1 overflow-y-auto lg:overflow-y-auto overflow-x-auto lg:overflow-x-hidden">
                            <div className="flex lg:flex-col gap-2 p-1 lg:p-0 lg:space-y-2 lg:pr-1">
                                {SAMPLE_GAMES.map((game) => (
                                    <button
                                        key={game.id}
                                        onClick={() => {
                                            setSelectedGame(game);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`
                                            flex-shrink-0 w-36 lg:w-full p-3 rounded-lg border text-left transition-all group relative overflow-hidden
                                            active:scale-95 touch-manipulation
                                            ${selectedGame?.id === game.id
                                                ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                                                : 'bg-black/20 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start z-10 relative">
                                            <div>
                                                <div className="font-bold text-xs lg:text-sm group-hover:text-white transition-colors line-clamp-1">{game.title}</div>
                                                <div className="text-[9px] lg:text-[10px] font-mono opacity-70 mt-1">{game.system}</div>
                                            </div>
                                            {selectedGame?.id === game.id && <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_#00ffff]" />}
                                        </div>

                                        <div className="absolute -bottom-4 -right-4 text-gray-800/20 group-hover:text-cyan-500/10 transition-colors">
                                            <Disc className="w-10 h-10 lg:w-14 lg:h-14" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-800">
                            <div className="flex gap-2">
                                <button className="flex-1 py-2.5 lg:py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-xs font-bold rounded flex items-center justify-center gap-2 text-gray-300 touch-manipulation">
                                    <RefreshCw size={14} /> SCAN
                                </button>
                                <button className="flex-1 py-2.5 lg:py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-xs font-bold rounded flex items-center justify-center gap-2 text-gray-300 touch-manipulation">
                                    <Monitor size={14} /> CONFIG
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmulatorView;
