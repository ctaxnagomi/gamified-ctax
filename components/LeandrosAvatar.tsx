import React from 'react';

interface LeandrosAvatarProps {
    isSpeaking: boolean;
    heresyLevel: number;
}

const LeandrosAvatar: React.FC<LeandrosAvatarProps> = ({ isSpeaking, heresyLevel }) => {
    // Angry State
    if (heresyLevel > 3) {
        return (
            <div className="w-32 h-32 md:w-48 md:h-48 relative animate-pulse">
                <img
                    src="/leandros-angry.png"
                    alt="Leandros Angry"
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]"
                />
            </div>
        );
    }

    // Normal State (Idle + Speaking Overlay)
    return (
        <div className="w-32 h-32 md:w-48 md:h-48 relative">
            {/* Idle Base */}
            <img
                src="/leandros-idle.png"
                alt="Leandros Idle"
                className="w-full h-full object-contain absolute top-0 left-0 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
            />

            {/* Speaking Overlay (Mouth Animation) */}
            <img
                src="/leandros-speaking.png"
                alt="Leandros Speaking"
                className={`w-full h-full object-contain absolute top-0 left-0 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] ${isSpeaking ? 'mouth-anim' : 'opacity-0'}`}
            />
        </div>
    );
};

export default LeandrosAvatar;
