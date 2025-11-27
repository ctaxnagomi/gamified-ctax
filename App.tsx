import React, { useState, useMemo, useEffect, useRef } from 'react';
import CircularNav from './components/CircularNav';
import SchematicSidebar from './components/SchematicSidebar';
import DashboardView from './views/DashboardView';
import JobsView from './views/JobsView';
import QuestsView from './views/QuestsView';
import LeaderboardView from './views/LeaderboardView';
import ProfileView from './views/ProfileView';
import MapView from './views/MapView';
import { NavItem, View } from './types';
import { LayoutDashboard, Briefcase, Scroll, Trophy, User, Sword, Star, Map, Terminal, PenTool, Gamepad2, Users, Calendar, Award, Globe, MessageCircle, Play, Pause, SkipForward, Music, Volume2, VolumeX, Minus, ChevronUp, Move } from 'lucide-react';

// Declaration for SoundCloud Widget API
declare global {
    interface Window {
        SC: any;
    }
}

import LeandrosWelcome from './components/LeandrosWelcome';

const MainSystem: React.FC = () => {
    const [activeView, setActiveView] = useState<string>(View.DASHBOARD);
    const [pageRotation, setPageRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
    const [sidebarPos, setSidebarPos] = useState({ x: 20, y: 260 });

    // Theme State: DEFAULT -> DOODLE -> CONSOLE
    const [themeMode, setThemeMode] = useState<'DEFAULT' | 'DOODLE' | 'CONSOLE'>('DEFAULT');

    // Music Player Refs
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const widgetRef = useRef<any>(null);

    const tracks = useMemo(() => ({
        DEFAULT: {
            src: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1253288662&color=%23443424&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
            title: "What if The Strokes covered As It Was",
            artist: "ojc",
            url: "https://soundcloud.com/oscar-cannon-147192226/what-if-the-strokes-covered-as"
        },
        DOODLE: {
            src: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2184250927&color=%23443424&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
            title: "The Good News, ft. Packed Rich",
            artist: "Chillhop Music",
            url: "https://soundcloud.com/chillhopdotcom/the-good-news-ft-packed-rich"
        },
        CONSOLE: {
            src: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/194878233&color=%23443424&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
            title: "Whiplash | John Wasson - Caravan",
            artist: "GoodDay Motion & Waves",
            url: "https://soundcloud.com/goodday-3/whiplash-john-wasson-caravan-1"
        }
    }), []);

    // Initialize SoundCloud Widget
    useEffect(() => {
        if (iframeRef.current && window.SC) {
            widgetRef.current = window.SC.Widget(iframeRef.current);
            widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
                // Widget is ready
            });
            widgetRef.current.bind(window.SC.Widget.Events.FINISH, () => {
                setIsPlaying(false);
            });
        }
    }, [themeMode]);

    useEffect(() => {
        setIsPlaying(false);
        // We rely on the iframe src updating in the render
    }, [themeMode]);

    const togglePlay = () => {
        if (!widgetRef.current) return;
        widgetRef.current.toggle();
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!widgetRef.current) return;
        if (isMuted) {
            // Unmute: restore volume (or 100 if it was 0)
            const restoreVol = volume === 0 ? 50 : volume;
            setVolume(restoreVol);
            widgetRef.current.setVolume(restoreVol);
            setIsMuted(false);
        } else {
            // Mute
            widgetRef.current.setVolume(0);
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseInt(e.target.value);
        setVolume(newVol);

        if (widgetRef.current) {
            widgetRef.current.setVolume(newVol);
        }

        if (newVol === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            setIsMuted(false);
        }
    };

    const handleSkip = () => {
        // Cycle theme to skip track
        handleCenterClick();
    };


    // Track Mouse for Console Spotlight
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleCenterClick = () => {
        setThemeMode(prev => {
            if (prev === 'DEFAULT') return 'DOODLE';
            if (prev === 'DOODLE') return 'CONSOLE';
            return 'DEFAULT';
        });
    };

    // Dynamic Navigation Items based on Theme
    const navItems = useMemo<NavItem[]>(() => {
        const baseItems = [
            { id: View.DASHBOARD, color: '#3b82f6' },
            { id: View.JOBS, color: '#22c55e' },
            { id: View.QUESTS, color: '#eab308' },
            { id: View.LEADERBOARD, color: '#a855f7' },
            { id: View.PROFILE, color: '#f43f5e' },
            { id: 'MAP', color: '#06b6d4' },
        ];

        return baseItems.map(item => {
            if (themeMode === 'DOODLE') {
                // Community Talks / Doodle Theme
                const labels: Record<string, string> = {
                    [View.DASHBOARD]: 'Feed',
                    [View.JOBS]: 'Discuss',
                    [View.QUESTS]: 'Events',
                    [View.LEADERBOARD]: 'Mentors',
                    [View.PROFILE]: 'Blog',
                    'MAP': 'Gallery'
                };
                const icons: Record<string, React.ReactNode> = {
                    [View.DASHBOARD]: <MessageCircle size={20} />,
                    [View.JOBS]: <Users size={20} />,
                    [View.QUESTS]: <Calendar size={20} />,
                    [View.LEADERBOARD]: <Star size={20} />,
                    [View.PROFILE]: <PenTool size={20} />,
                    'MAP': <Globe size={20} />
                };
                return { ...item, label: labels[item.id], icon: icons[item.id] };
            } else if (themeMode === 'CONSOLE') {
                // Hackathon / Modern White Console Theme
                const labels: Record<string, string> = {
                    [View.DASHBOARD]: 'Overview',
                    [View.JOBS]: 'Teams',
                    [View.QUESTS]: 'Submit',
                    [View.LEADERBOARD]: 'Judges',
                    [View.PROFILE]: 'Prizes',
                    'MAP': 'Schedule'
                };
                const icons: Record<string, React.ReactNode> = {
                    [View.DASHBOARD]: <Terminal size={18} />,
                    [View.JOBS]: <Users size={18} />,
                    [View.QUESTS]: <Sword size={18} />,
                    [View.LEADERBOARD]: <User size={18} />,
                    [View.PROFILE]: <Award size={18} />,
                    'MAP': <Calendar size={18} />
                };
                return { ...item, label: labels[item.id], icon: icons[item.id], color: '#000000' };
            } else {
                // Default
                const labels: Record<string, string> = {
                    [View.DASHBOARD]: 'Home',
                    [View.JOBS]: 'Jobs',
                    [View.QUESTS]: 'Quests',
                    [View.LEADERBOARD]: 'Ranks',
                    [View.PROFILE]: 'Profile',
                    'MAP': 'Map'
                };
                const icons: Record<string, React.ReactNode> = {
                    [View.DASHBOARD]: <LayoutDashboard size={18} />,
                    [View.JOBS]: <Briefcase size={18} />,
                    [View.QUESTS]: <Scroll size={18} />,
                    [View.LEADERBOARD]: <Trophy size={18} />,
                    [View.PROFILE]: <User size={18} />,
                    'MAP': <Map size={18} />
                };
                return { ...item, label: labels[item.id], icon: icons[item.id] };
            }
        });
    }, [themeMode]);

    // Get current active theme color
    const activeColor = navItems.find(item => item.id === activeView)?.color || '#3b82f6';

    const handleRotationChange = (rotation: number, dragging: boolean) => {
        if (dragging) {
            // Limit the rotation visual to avoid flipping over completely (clamping)
            // Map full rotation loop to a -45 to 45 degree tilt for a controlled swing
            // OR allow full spin if that's the "Revolving Door" intent.
            // Let's do a dampened 1:0.5 ratio but clamp it visually to prevent reading backwards text
            // Actually, for "Revolving door" effect, full spin is 3D. 
            // But for usability, let's keep it swinging.

            let tilt = rotation % 360;
            if (tilt > 180) tilt -= 360;

            // Dampen it
            setPageRotation(tilt * 0.3);
        } else {
            // Snap back to 0 (flat) when released
            setPageRotation(0);
        }
        setIsDragging(dragging);
    };

    // Helper styles based on theme
    const getThemeStyles = () => {
        switch (themeMode) {
            case 'DOODLE':
                return {
                    bg: 'bg-[#2b2b2b] pencil-grid',
                    text: 'text-white font-doodle',
                    osBorder: 'border-gray-500 border-dashed',
                    keyCap: 'bg-white text-black key-cap-white',
                    footer: 'bg-[#1a1a1a] border-t-2 border-dashed border-gray-600',
                    contentBorder: 'border-white/20 border-dashed'
                };
            case 'CONSOLE':
                return {
                    bg: 'bg-white',
                    text: 'text-black font-console',
                    osBorder: 'border-black',
                    keyCap: 'bg-gray-100 text-black border border-black key-cap-white',
                    footer: 'bg-white border-t border-black',
                    contentBorder: 'border-black/20 border-dashed'
                };
            default:
                return {
                    bg: 'bg-kraken-dark',
                    text: 'text-white font-sans',
                    osBorder: 'border-gray-700',
                    keyCap: 'bg-[#222] text-gray-300 key-cap',
                    footer: 'bg-[#0a0f1d] border-t border-gray-800',
                    contentBorder: 'border-white/10 border-dashed'
                };
        }
    };
    const themeStyles = getThemeStyles();

    const renderContent = () => {
        switch (activeView) {
            case View.DASHBOARD:
                return <DashboardView theme={themeMode} />;
            case View.JOBS:
                return <JobsView theme={themeMode} />;
            case View.QUESTS:
                return <QuestsView theme={themeMode} />;
            case View.LEADERBOARD:
                return <LeaderboardView theme={themeMode} />;
            case View.PROFILE:
                return <ProfileView theme={themeMode} />;
            case 'MAP':
                return <MapView theme={themeMode} />;
            default:
                return <DashboardView theme={themeMode} />;
        }
    };

    // Calculate dynamic 3D styles
    const absRotation = Math.abs(pageRotation);
    const blurAmount = Math.min(8, absRotation / 4); // Max 8px blur
    const scaleAmount = Math.max(0.9, 1 - (absRotation / 500)); // Scale down slightly when rotated
    const opacityAmount = Math.max(0.4, 1 - (absRotation / 90)); // Fade out at extreme angles

    return (
        <div className="h-screen w-screen p-2 md:p-4 flex items-center justify-center bg-black select-none">

            {/* --- LINUX OS WRAPPER --- */}
            <div className={`relative w-full h-full max-w-[1600px] mx-auto rounded-xl border-[6px] flex flex-col overflow-hidden transition-colors duration-500 ${themeStyles.osBorder} ${themeStyles.bg}`}>

                {/* OS Status Bar */}
                <div className={`h-8 px-4 flex justify-between items-center text-xs font-mono uppercase border-b z-50 ${themeMode === 'CONSOLE' ? 'bg-black text-white' : 'bg-[#111] text-gray-400 border-gray-700'}`}>
                    <div className="flex gap-4">
                        <span className="hidden sm:inline">KRACKEDDEV_OS v3.0</span>
                        <span className="sm:hidden">OS v3</span>
                        <span>MEM: 64TB</span>
                    </div>
                    <div>{new Date().toLocaleTimeString()}</div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 relative overflow-hidden flex flex-col md:block">

                    {/* --- BACKGROUND LAYERS --- */}
                    {/* 1. Dynamic Glow (Default) */}
                    {themeMode === 'DEFAULT' && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                            {isPlaying && (
                                <div className="absolute bottom-0 left-0 right-0 h-64 flex justify-around items-end opacity-20 px-10 gap-1">
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-full bg-kraken-primary rounded-t-lg animate-bounce-visualizer"
                                            style={{
                                                animationDelay: `${Math.random() * 0.5}s`,
                                                animationDuration: `${0.3 + Math.random() * 0.4}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            )}
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] rounded-full mix-blend-screen filter blur-[100px] opacity-15 transition-colors duration-700 ease-in-out"
                                style={{ backgroundColor: activeColor }}
                            ></div>
                            <div
                                className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                }}
                            ></div>
                        </div>
                    )}

                    {/* 2. Pencil Grid (Doodle) */}
                    {themeMode === 'DOODLE' && (
                        <div className="absolute inset-0 pointer-events-none z-0">
                            {isPlaying && (
                                <div className="absolute bottom-0 left-0 right-0 h-40 flex justify-center items-end opacity-10 gap-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-8 border-2 border-white border-dashed bg-transparent animate-bounce-visualizer"
                                            style={{
                                                animationDelay: `${Math.random() * 0.5}s`,
                                                animationDuration: `${0.4 + Math.random() * 0.4}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. Modern White Scanline (Console) */}
                    {themeMode === 'CONSOLE' && (
                        <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="scanlines-white absolute inset-0 z-40 opacity-50"></div>
                            <div
                                className="fixed w-[200px] h-[200px] rounded-full bg-white z-50 pointer-events-none mix-blend-difference hidden md:block"
                                style={{
                                    left: mousePos.x,
                                    top: mousePos.y,
                                    transform: 'translate(-50%, -50%)',
                                    filter: 'blur(30px)',
                                }}
                            ></div>
                        </div>
                    )}


                    {/* Navigation Layer - Corner Wheel */}
                    <CircularNav
                        items={navItems}
                        activeId={activeView}
                        onSelect={setActiveView}
                        onRotationChange={handleRotationChange}
                        onCenterClick={handleCenterClick}
                        themeMode={themeMode}
                    />

                    {/* Schematic Sidebar (Legend/Tooltip) - Replaces the helper text */}
                    <SchematicSidebar
                        activeView={activeView}
                        theme={themeMode}
                        isMinimized={isSidebarMinimized}
                        onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)}
                        position={sidebarPos}
                        onMove={setSidebarPos}
                    />


                    {/* --- KEYBOARD TOOLS (RIGHT SIDE) --- */}
                    {/* Adjust position for mobile to not cover content */}
                    <div className="absolute right-4 top-16 md:top-1/2 md:-translate-y-1/2 flex flex-col gap-4 z-40 scale-75 md:scale-100 origin-top-right md:origin-center">
                        <button onClick={togglePlay} className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-transform active:scale-95 ${themeStyles.keyCap} ${isPlaying ? 'active' : ''}`}>
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-transform active:scale-95 ${themeStyles.keyCap}`}>
                            <Music size={24} />
                        </button>
                        <button onClick={handleSkip} className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-transform active:scale-95 ${themeStyles.keyCap}`}>
                            <SkipForward size={24} />
                        </button>
                    </div>

                    {/* Main Content Wrapper - 3D Revolving Door Motion */}
                    <div
                        className="relative w-full h-full overflow-y-auto"
                        style={{ perspective: '2000px' }} // 3D Perspective Container
                    >
                        {/* Content Container with dashed border offset from nav */}
                        <main
                            className={`
                            relative z-10 
                            mt-[100px] mx-4 mb-20 md:mb-12
                            md:mt-24 md:ml-32 lg:ml-48 md:mr-28
                            p-4 md:p-6 lg:max-w-6xl 
                            min-h-[500px] rounded-2xl border-2
                            will-change-transform
                            ${themeStyles.text}
                            ${themeStyles.contentBorder}
                        `}
                            style={{
                                // Revolving Door Transform: Rotate Y + Scale + Blur
                                transform: `
                                rotateY(${pageRotation}deg) 
                                scale(${scaleAmount})
                            `,
                                transformOrigin: 'center center', // Axis of revolution
                                filter: `blur(${blurAmount}px)`,
                                opacity: opacityAmount,
                                transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', // Smooth snap back
                            }}
                        >
                            {/* Header Bar */}
                            <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 border-b pb-4 gap-4 ${themeMode === 'CONSOLE' ? 'border-black/10' : 'border-gray-800'}`}>
                                <div>
                                    <h1
                                        className={`text-2xl md:text-3xl font-bold bg-clip-text transition-all duration-500 
                                        ${themeMode === 'CONSOLE' ? 'text-black tracking-tighter' : 'text-transparent bg-gradient-to-r'} 
                                        ${themeMode === 'DOODLE' ? 'tracking-wider' : ''}
                                    `}
                                        style={{ backgroundImage: themeMode === 'DEFAULT' ? `linear-gradient(to right, ${activeColor}, white)` : 'none' }}
                                    >
                                        {themeMode === 'CONSOLE' ? '>> ' : ''} {navItems.find(i => i.id === activeView)?.label || activeView}
                                        {themeMode === 'CONSOLE' && <span className="animate-pulse">_</span>}
                                    </h1>
                                    <p className={`text-xs md:text-sm ${themeMode === 'CONSOLE' ? 'text-gray-600' : 'text-gray-400'}`}>Level 12 Junior Developer • 2,450 XP</p>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 w-full md:w-auto justify-center
                                    ${themeMode === 'CONSOLE' ? 'border-black text-black bg-white shadow-sm' : 'bg-kraken-card border-gray-700'}
                                `}>
                                        <span style={{ color: themeMode === 'CONSOLE' ? '#000' : activeColor }}>⚡</span>
                                        <span className="font-mono text-sm">12 Streak</span>
                                    </div>
                                </div>
                            </header>

                            {renderContent()}

                            {/* Spacer for scroll */}
                            <div className="h-24 md:h-16"></div>
                        </main>
                    </div>
                </div>

                {/* --- FOOTER (Song Description) --- */}
                <div className={`h-16 px-4 md:px-6 flex items-center gap-2 md:gap-4 z-50 ${themeStyles.footer}`}>
                    {/* Minimized Sidebar "Tab" */}
                    {isSidebarMinimized && (
                        <button
                            onClick={() => setIsSidebarMinimized(false)}
                            className={`
                            mr-2 md:mr-4 px-3 py-1.5 rounded border border-dashed flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase transition-colors
                            ${themeMode === 'CONSOLE' ? 'border-black text-black hover:bg-black/10' : 'border-white/30 text-white/70 hover:bg-white/10'}
                        `}
                        >
                            <ChevronUp size={12} />
                            <span className="hidden sm:inline">System</span>
                        </button>
                    )}

                    {/* Hidden Iframe for SoundCloud */}
                    <iframe
                        ref={iframeRef}
                        id="sc-widget"
                        src={tracks[themeMode].src}
                        width="100%"
                        height="166"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay"
                        className="hidden"
                        title="soundcloud-player"
                    ></iframe>

                    {/* Visualizer Icon (Static/Animated) */}
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded shrink-0 flex items-center justify-center ${themeMode === 'CONSOLE' ? 'bg-black text-white' : 'bg-kraken-primary text-white'}`}>
                        {isPlaying ? (
                            <div className="flex gap-0.5 md:gap-1 items-end h-3 md:h-4">
                                <div className="w-0.5 md:w-1 bg-white animate-bounce-visualizer" style={{ animationDuration: '0.4s' }}></div>
                                <div className="w-0.5 md:w-1 bg-white animate-bounce-visualizer" style={{ animationDuration: '0.6s' }}></div>
                                <div className="w-0.5 md:w-1 bg-white animate-bounce-visualizer" style={{ animationDuration: '0.5s' }}></div>
                            </div>
                        ) : (
                            <Play size={14} className="ml-0.5 md:ml-1" />
                        )}
                    </div>

                    <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                        <span className={`text-xs md:text-sm font-bold truncate ${themeMode === 'CONSOLE' ? 'text-black' : 'text-white'}`}>
                            {tracks[themeMode].title}
                        </span>
                        <span className={`text-[10px] md:text-xs truncate ${themeMode === 'CONSOLE' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {tracks[themeMode].artist}
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-2 md:gap-4 shrink-0">
                        {/* Volume Slider */}
                        <div className="hidden sm:flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className={`w-16 md:w-24 h-1 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-current ${themeMode === 'CONSOLE' ? 'text-black' : 'text-white'}`}
                            />
                        </div>

                        <button onClick={toggleMute} className={`p-2 rounded-lg hover:bg-gray-500/10 ${themeMode === 'CONSOLE' ? 'text-black' : 'text-gray-400'}`}>
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <div className={`hidden md:block text-xs opacity-50 ${themeMode === 'CONSOLE' ? 'text-black' : 'text-white'}`}>
                            {isPlaying ? 'PLAYING' : 'PAUSED'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <LeandrosWelcome onSuccess={() => setIsAuthenticated(true)} />;
    }

    return <MainSystem />;
};


export default App;