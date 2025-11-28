import React, { useRef, useEffect } from 'react';
import { Minus, Move } from 'lucide-react';
import { View } from '../types';

interface SchematicSidebarProps {
    activeView: string;
    theme: string;
    isMinimized: boolean;
    onToggle: () => void;
    position: { x: number, y: number };
    onMove: (pos: { x: number, y: number }) => void;
}

const SchematicSidebar: React.FC<SchematicSidebarProps> = ({ activeView, theme, isMinimized, onToggle, position, onMove }) => {
    // If minimized, don't render in the main area (it moves to footer)
    if (isMinimized) return null;

    const descriptions: Record<string, string> = {
        [View.DASHBOARD]: 'Overview of system status, active objectives, and recent log entries.',
        [View.JOBS]: 'Marketplace for available contracts and technical bounties.',
        [View.QUESTS]: 'Daily and weekly challenges to increment user experience.',
        [View.LEADERBOARD]: 'Global rankings and competitive metrics analysis.',
        [View.PROFILE]: 'User configuration, skill tree management, and visual customization.',
        'MAP': 'Geospatial visualization of local and remote nodes.'
    };

    const isConsole = theme === 'CONSOLE';
    const isDoodle = theme === 'DOODLE';
    const isRetro = theme === 'RETRO';

    // Drag Logic
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            onMove({
                x: e.clientX - dragOffsetRef.current.x,
                y: e.clientY - dragOffsetRef.current.y
            });
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onMove]);

    return (
        <div
            className={`
                schematic-sidebar absolute z-20 
                w-32 md:w-56 p-2 md:p-3 
                border-l-2 md:border-2 border-dashed
                transition-colors duration-300 shadow-xl
                ${isConsole ? 'border-black bg-white/50 text-black' : ''}
                ${isDoodle ? 'border-white/50 bg-black/10 text-white font-doodle' : ''}
                ${isRetro ? 'border-[#ff00ff] bg-[#1a1a2e]/90 text-[#00ff00] font-retro shadow-[0_0_15px_#ff00ff]' : ''}
                ${!isConsole && !isDoodle && !isRetro ? 'border-kraken-primary/30 bg-kraken-card/50 text-kraken-primary backdrop-blur-sm' : ''}
            `}
            style={{
                left: position.x,
                top: position.y
            }}
        >
            {/* Header with Minimize Button & Drag Handle */}
            <div
                className="flex justify-between items-start mb-1 cursor-move"
                onMouseDown={(e) => {
                    dragOffsetRef.current = {
                        x: e.clientX - position.x,
                        y: e.clientY - position.y
                    };
                    isDraggingRef.current = true;
                }}
            >
                <div className={`text-[10px] font-bold opacity-70 flex items-center gap-1 ${isConsole ? 'font-console' : 'font-mono'}`}>
                    <Move size={10} /> // SYSTEM_STATUS
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="opacity-50 hover:opacity-100 hover:bg-black/10 rounded p-0.5 transition-all cursor-pointer"
                    title="Minimize"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <Minus size={12} />
                </button>
            </div>

            <div className={`text-xs md:text-sm font-bold mb-2 uppercase ${isConsole ? 'tracking-tighter' : 'tracking-widest'} pointer-events-none`}>
                MODULE: {activeView}
            </div>
            <div className={`text-[8px] md:text-[10px] leading-tight opacity-80 pointer-events-none ${isConsole ? 'font-console' : 'font-sans'}`}>
                {descriptions[activeView] || 'Awaiting input...'}
            </div>

            {/* Decorative Schematics */}
            <div className="mt-3 flex gap-1 opacity-50 pointer-events-none">
                <div className={`h-1 w-full ${isConsole ? 'bg-black' : 'bg-current'}`}></div>
                <div className={`h-1 w-2 ${isConsole ? 'bg-black' : 'bg-current'}`}></div>
            </div>
            <div className="mt-1 flex justify-between text-[8px] opacity-60 font-mono pointer-events-none">
                <span>LAT: 12ms</span>
                <span>SYNC: OK</span>
            </div>
        </div>
    );
};

export default SchematicSidebar;
