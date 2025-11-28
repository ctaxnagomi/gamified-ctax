import React, { useEffect, useState } from 'react';

interface LeandrosAvatarProps {
    isSpeaking: boolean;
    heresyLevel: number;
    className?: string;
}

const LeandrosAvatar: React.FC<LeandrosAvatarProps> = ({ isSpeaking, heresyLevel, className = '' }) => {
    const [currentImage, setCurrentImage] = useState('/leandros-idle.png');

    useEffect(() => {
        if (heresyLevel > 3) {
            setCurrentImage('/leandros-angry.png');
        } else if (isSpeaking) {
            // Simple animation loop for speaking could be done here, 
            // but for now we switch to the speaking frame.
            // Ideally we toggle between idle and speaking to simulate mouth movement.
            const interval = setInterval(() => {
                setCurrentImage(prev => prev === '/leandros-speaking.png' ? '/leandros-idle.png' : '/leandros-speaking.png');
            }, 200);
            return () => clearInterval(interval);
        } else {
            setCurrentImage('/leandros-idle.png');
        }
    }, [isSpeaking, heresyLevel]);

    return (
        <div className={`relative w-32 h-32 md:w-48 md:h-48 border-4 border-cyan-800 bg-black overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.2)] ${className}`}>
            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]"></div>

            {/* Avatar Image */}
            <img
                src={currentImage}
                alt="Leandros Avatar"
                className={`w-full h-full object-cover transition-transform duration-100 ${isSpeaking ? 'scale-105' : 'scale-100'} ${heresyLevel > 3 ? 'sepia-[.5] hue-rotate-[-50deg] saturate-200' : ''}`}
            />

            {/* Status LED */}
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#00ff00]' : 'bg-red-900'} z-30`}></div>
        </div>
    );
};

export default LeandrosAvatar;
