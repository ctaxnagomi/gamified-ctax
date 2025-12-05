import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Maximize2, Move, Youtube, Film, Activity, Key, Loader, Check, XCircle } from 'lucide-react';

const MiniPlayer: React.FC = () => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [size, setSize] = useState({ width: 320, height: 180 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [videoUrl, setVideoUrl] = useState('');
    const [inputUrl, setInputUrl] = useState('');

    // Wayang Mode State
    const [mode, setMode] = useState<'YOUTUBE' | 'WAYANG'>('YOUTUBE');
    const [tmdbId, setTmdbId] = useState('533535'); // Default: Deadpool & Wolverine
    const [status, setStatus] = useState<'Vibing' | 'Focus' | 'KRACKED AF' | '67!'>('Vibing');

    // Key Flow State
    const [apiKey, setApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'IDLE' | 'LOADING' | 'CONNECTED' | 'NOPE'>('IDLE');

    const playerRef = useRef<HTMLDivElement>(null);

    // --- DRAG LOGIC ---
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isMinimized) return;
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragOffset({
            x: clientX - position.x,
            y: clientY - position.y
        });
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (isDragging) {
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

            // Boundary checks
            const newX = Math.min(Math.max(0, clientX - dragOffset.x), window.innerWidth - size.width);
            const newY = Math.min(Math.max(0, clientY - dragOffset.y), window.innerHeight - size.height);

            setPosition({ x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove);
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    // --- VIDFAST EVENT LISTENER ---
    useEffect(() => {
        const vidfastOrigins = [
            'https://vidfast.pro', 'https://vidfast.in', 'https://vidfast.io',
            'https://vidfast.me', 'https://vidfast.net', 'https://vidfast.pm', 'https://vidfast.xyz'
        ];

        const handleMessage = (event: MessageEvent) => {
            if (!vidfastOrigins.includes(event.origin) || !event.data) return;

            if (event.data.type === 'MEDIA_DATA') {
                localStorage.setItem('vidFastProgress', JSON.stringify(event.data.data));
                console.log("VidFast Progress Saved:", event.data.data);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // --- HANDLERS ---
    const handleYoutubeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Extract video ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = inputUrl.match(regExp);
        if (match && match[2].length === 11) {
            setVideoUrl(`https://www.youtube.com/embed/${match[2]}?autoplay=1`);
        }
    };

    const cycleStatus = () => {
        const statuses: ('Vibing' | 'Focus' | 'KRACKED AF' | '67!')[] = ['Vibing', 'Focus', 'KRACKED AF', '67!'];
        const currentIndex = statuses.indexOf(status);
        setStatus(statuses[(currentIndex + 1) % statuses.length]);
    };

    const handleConnect = () => {
        if (!apiKey.trim()) return;
        setConnectionStatus('LOADING');
        setTimeout(() => {
            // Fake validation: check if length > 5
            if (apiKey.length > 5) {
                setConnectionStatus('CONNECTED');
                setMode('WAYANG');
                setTimeout(() => setShowKeyInput(false), 1000);
            } else {
                setConnectionStatus('NOPE');
                setTimeout(() => setConnectionStatus('IDLE'), 2000);
            }
        }, 2000);
    };

    // --- RENDER ---
    if (isMinimized) {
        return (
            <div
                className="fixed bottom-4 right-4 z-[100] w-12 h-12 bg-cyan-900/80 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border-2 border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                onClick={() => setIsMinimized(false)}
                title="Open MiniPlayer"
            >
                {mode === 'YOUTUBE' ? <Youtube size={24} /> : <Film size={24} />}
            </div>
        );
    }

    return (
        <div
            ref={playerRef}
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height
            }}
            className="fixed z-[90] bg-black border border-cyan-700 shadow-[0_0_20px_rgba(0,255,255,0.2)] flex flex-col overflow-hidden transition-shadow hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]"
        >
            {/* Header */}
            <div
                className="h-8 bg-cyan-900/50 flex items-center justify-between px-2 cursor-move select-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <Move size={14} className="opacity-50" />
                    <span className="text-xs font-mono font-bold tracking-wider">
                        {mode === 'YOUTUBE' ? 'YOUTUBE' : 'WAYANG'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Tab */}
                    <button
                        onClick={cycleStatus}
                        className="px-2 py-0.5 text-[10px] bg-black/50 border border-cyan-500/50 rounded hover:bg-cyan-500/20 transition-colors font-mono text-cyan-300"
                        title="Toggle Status"
                    >
                        {status}
                    </button>

                    {/* Key Button */}
                    <button
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        className={`p-1 hover:text-white transition-colors ${connectionStatus === 'CONNECTED' ? 'text-green-500' : ''}`}
                        title="Cable Key Input"
                    >
                        <Key size={14} />
                    </button>

                    {/* Mode Toggle */}
                    <button
                        onClick={() => {
                            if (connectionStatus === 'CONNECTED') {
                                setMode(mode === 'YOUTUBE' ? 'WAYANG' : 'YOUTUBE');
                            } else {
                                setShowKeyInput(true);
                            }
                        }}
                        className="p-1 hover:text-white transition-colors"
                        title={mode === 'YOUTUBE' ? "Switch to Wayang Mode" : "Switch to YouTube Mode"}
                    >
                        {mode === 'YOUTUBE' ? <Film size={14} /> : <Youtube size={14} />}
                    </button>

                    <button onClick={() => setIsMinimized(true)} className="p-1 hover:text-white" aria-label="Minimize Player"><Minus size={14} /></button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-black relative group overflow-hidden">

                {/* Key Input Overlay */}
                {showKeyInput && (
                    <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-4 gap-4 animate-fade-in">
                        <h3 className="text-cyan-500 font-bold text-sm">CABLE KEY REQUIRED</h3>
                        <div className="w-full relative">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Please put Cable Key here"
                                className="w-full bg-cyan-900/20 border border-cyan-700 p-2 text-xs text-center focus:outline-none focus:border-cyan-400 text-white"
                            />
                        </div>

                        <div className="h-8 flex items-center justify-center">
                            {connectionStatus === 'IDLE' && (
                                <button onClick={handleConnect} className="px-4 py-1 border border-cyan-500 text-cyan-500 hover:bg-cyan-500/20 text-xs">
                                    CONNECT
                                </button>
                            )}
                            {connectionStatus === 'LOADING' && <Loader size={20} className="animate-spin text-cyan-500" />}
                            {connectionStatus === 'CONNECTED' && (
                                <div className="flex items-center gap-2 text-green-500 animate-pulse">
                                    <Check size={20} />
                                    <span className="text-xs">CONNECTED</span>
                                </div>
                            )}
                            {connectionStatus === 'NOPE' && (
                                <div className="flex items-center gap-2 text-red-500 animate-shake">
                                    <XCircle size={20} />
                                    <span className="text-xs">NOPE</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {mode === 'YOUTUBE' ? (
                    videoUrl ? (
                        <iframe
                            src={videoUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube Video Player"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
                            <Youtube size={32} className="opacity-50" />
                            <form onSubmit={handleYoutubeSubmit} className="w-full">
                                <input
                                    type="text"
                                    value={inputUrl}
                                    onChange={(e) => setInputUrl(e.target.value)}
                                    placeholder="Paste YouTube Link..."
                                    className="w-full bg-cyan-900/20 border border-cyan-700 p-1 text-xs text-center focus:outline-none focus:border-cyan-400"
                                />
                            </form>
                        </div>
                    )
                ) : (
                    // WAYANG MODE
                    <div className="w-full h-full flex flex-col">
                        <iframe
                            src={`https://vidfast.pro/movie/${tmdbId}?autoPlay=true&theme=00FFFF`}
                            className="w-full h-full flex-1"
                            frameBorder="0"
                            allowFullScreen
                            allow="encrypted-media"
                        ></iframe>

                        {/* Search Overlay (Visible on Hover/Empty) */}
                        <div className="absolute top-0 left-0 w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/80 to-transparent pointer-events-none group-hover:pointer-events-auto">
                            <input
                                type="text"
                                value={tmdbId}
                                onChange={(e) => setTmdbId(e.target.value)}
                                placeholder="Enter TMDB ID..."
                                className="w-full bg-black/50 border border-cyan-500/50 p-1 text-xs text-white focus:outline-none focus:border-cyan-400 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Resize Handle */}
            <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center opacity-50 hover:opacity-100"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = size.width;
                    const startHeight = size.height;

                    const handleResize = (moveEvent: MouseEvent) => {
                        setSize({
                            width: Math.max(200, startWidth + (moveEvent.clientX - startX)),
                            height: Math.max(120, startHeight + (moveEvent.clientY - startY))
                        });
                    };

                    const stopResize = () => {
                        window.removeEventListener('mousemove', handleResize);
                        window.removeEventListener('mouseup', stopResize);
                    };

                    window.addEventListener('mousemove', handleResize);
                    window.addEventListener('mouseup', stopResize);
                }}
            >
                <div className="w-2 h-2 border-r-2 border-b-2 border-cyan-500"></div>
            </div>
        </div>
    );
};

export default MiniPlayer;
