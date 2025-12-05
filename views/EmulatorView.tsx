import React, { useState } from 'react';
import Card from '../components/ui/Card';
import EmulatorFrame from '../components/EmulatorFrame';
import { Gamepad2, Disc, RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface Game {
    id: string;
    title: string;
    system: string;
    romUrl: string; // URL to the ROM file (relative or absolute)
    coverUrl?: string; // Optional cover art
}

const SAMPLE_GAMES: Game[] = [
    {
        id: '1',
        title: 'Super Mario Bros',
        system: 'NES',
        romUrl: 'https://archive.org/download/super-mario-bros-nes/Super%20Mario%20Bros%20%28E%29.nes', // Example hotlink (might fail CORS, placeholder)
    },
    {
        id: '2',
        title: 'Sonic the Hedgehog',
        system: 'SEGA GENESIS',
        romUrl: 'games/sonic.md', // Local placeholder
    },
    {
        id: '3',
        title: 'Doom',
        system: 'DOS',
        romUrl: 'games/doom.zip', // Local placeholder
    }
];

interface EmulatorViewProps {
    theme: 'DEFAULT' | 'DOODLE' | 'CONSOLE' | 'RETRO' | 'LOFI';
}

const EmulatorView: React.FC<EmulatorViewProps> = ({ theme }) => {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4 animate-in fade-in zoom-in duration-500">

            {/* LEFT: Game Display (Flexible) */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? '' : 'w-full'}`}>
                {selectedGame ? (
                    <EmulatorFrame romUrl={selectedGame.romUrl} gameName={selectedGame.title} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 border border-dashed border-gray-700 rounded-lg p-8 text-center">
                        <Gamepad2 size={64} className="text-gray-600 mb-4 animate-pulse" />
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">No Cartridge Inserted</h2>
                        <p className="text-gray-500 max-w-md">Select a game from the playlist to boot up the system. Ensure you have legal rights to the ROMs you play.</p>

                        {/* Placeholder Info */}
                        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800 text-xs text-left max-w-sm">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Disc size={12} /> CORE SYSTEM INFO</h3>
                            <ul className="space-y-1 text-gray-400 font-mono">
                                <li>Engine: EmulatorJS v4.3</li>
                                <li>Cores: Libretro (RetroArch)</li>
                                <li>Render: WebGL 2.0</li>
                                <li>Audio: Web Audio API</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: Playlist Sidebar */}
            {isSidebarOpen && (
                <div className="w-80 shrink-0 flex flex-col gap-4">
                    <Card title="Cartridges" theme={theme} className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {SAMPLE_GAMES.map((game) => (
                                <button
                                    key={game.id}
                                    onClick={() => setSelectedGame(game)}
                                    className={`
                                        w-full p-3 rounded-lg border text-left transition-all group relative overflow-hidden
                                        ${selectedGame?.id === game.id
                                            ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                                            : 'bg-black/20 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start z-10 relative">
                                        <div>
                                            <div className="font-bold text-sm group-hover:text-white transition-colors">{game.title}</div>
                                            <div className="text-[10px] font-mono opacity-70 mt-1">{game.system}</div>
                                        </div>
                                        {selectedGame?.id === game.id && <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_#00ffff]"></div>}
                                    </div>

                                    {/* Decoration */}
                                    <div className="absolute -bottom-4 -right-4 text-gray-800/20 group-hover:text-cyan-500/10 transition-colors">
                                        <Disc size={60} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded flex items-center justify-center gap-2 text-gray-300">
                                    <RefreshCw size={12} /> SCAN
                                </button>
                                <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded flex items-center justify-center gap-2 text-gray-300">
                                    <Monitor size={12} /> CONFIG
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default EmulatorView;
