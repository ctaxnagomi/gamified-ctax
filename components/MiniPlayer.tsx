import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Maximize2, Move, Youtube } from 'lucide-react';

const MiniPlayer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [url, setUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number, startY: number, startLeft: number, startTop: number } | null>(null);

    const extractVideoId = (inputUrl: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = inputUrl.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleLoadVideo = () => {
        const id = extractVideoId(url);
        if (id) {
            setVideoId(id);
            setIsOpen(true);
            setIsMinimized(false);
        }
    };

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        setIsDragging(true);
        dragRef.current = {
            startX: clientX,
            startY: clientY,
            startLeft: position.x,
            startTop: position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging || !dragRef.current) return;

            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

            const dx = clientX - dragRef.current.startX;
            const dy = clientY - dragRef.current.startY;

            // Constrain to window
            const newX = Math.max(0, Math.min(window.innerWidth - 320, dragRef.current.startLeft + dx));
            const newY = Math.max(0, Math.min(window.innerHeight - 200, dragRef.current.startTop + dy));

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    if (!isOpen && !videoId) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <div className="flex items-center gap-2 bg-black/80 border border-cyan-800 p-2 rounded-lg shadow-lg backdrop-blur-sm">
                    <Youtube size={20} className="text-red-500" />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube Link..."
                        className="bg-transparent border-b border-cyan-800 text-xs text-white focus:outline-none w-32 md:w-48"
                        onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
                    />
                    <button onClick={handleLoadVideo} className="text-cyan-500 hover:text-cyan-300 text-xs">[PLAY]</button>
                </div>
            </div>
        );
    }

    if (isMinimized) {
        return (
            <div
                className="fixed z-50 bg-black border border-cyan-500 p-2 rounded-full cursor-pointer shadow-[0_0_10px_rgba(0,255,255,0.3)] animate-pulse"
                style={{ left: position.x, top: position.y }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onClick={() => setIsMinimized(false)}
            >
                <Youtube size={24} className="text-red-500" />
            </div>
        );
    }

    return (
        <div
            className="fixed z-50 bg-black border-2 border-cyan-800 shadow-2xl flex flex-col w-80 md:w-96"
            style={{ left: position.x, top: position.y }}
        >
            {/* Header / Drag Handle */}
            <div
                className="bg-cyan-900/50 p-2 flex justify-between items-center cursor-move select-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="flex items-center gap-2 text-xs text-cyan-300">
                    <Move size={12} />
                    <span>MINI PLAYER</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMinimized(true)} className="hover:text-white text-cyan-400"><Minus size={14} /></button>
                    <button onClick={() => { setIsOpen(false); setVideoId(''); }} className="hover:text-red-500 text-cyan-400"><X size={14} /></button>
                </div>
            </div>

            {/* Video Container */}
            <div className="relative pt-[56.25%] bg-black">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            {/* Resize Handle (Visual only for now, could implement real resize) */}
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-cyan-800/50 clip-path-triangle"></div>
        </div>
    );
};

export default MiniPlayer;
