import React from 'react';
import { Facebook, Twitter, Instagram, Play } from 'lucide-react';


interface StarfieldProps {
    onStart?: () => void;
}

const Starfield: React.FC<StarfieldProps> = ({ onStart }) => {
    const [isTitleFocused, setIsTitleFocused] = React.useState(false);

    const toggleFocus = () => {
        setIsTitleFocused(!isTitleFocused);
    };

    return (
        <div
            className="fixed inset-0 z-0 bg-black overflow-hidden perspective-1000 cursor-pointer"
            onClick={toggleFocus}
        >
            {/* Stars Layers */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div id='stars' className="w-[1px] h-[1px] bg-transparent shadow-[0_0_1px_#FFF] animate-star-slow"></div>
                <div id='stars2' className="w-[2px] h-[2px] bg-transparent shadow-[0_0_2px_#FFF] animate-star-medium"></div>
                <div id='stars3' className="w-[3px] h-[3px] bg-transparent shadow-[0_0_3px_#FFF] animate-star-fast"></div>
            </div>

            {/* Title (Layer 3 by default, Layer 2 when focused) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mix-blend-screen pointer-events-none transition-all duration-500 ${isTitleFocused ? 'z-30 blur-none opacity-100 scale-110' : 'z-10 blur-sm opacity-50 scale-90'}`}>
                <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-900 tracking-tighter animate-pulse">KRACKED DEV</h1>
            </div>

            {/* 3D Social Icons (Layer 2 by default, Layer 3 when focused) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${!isTitleFocused ? 'z-30 blur-none opacity-100 scale-100' : 'z-10 blur-sm opacity-50 scale-90'}`}>
                <ul className="social-3d-container pointer-events-auto">
                    <li className="social-3d-item">
                        <a href="#" className="social-3d-link" onClick={(e) => e.preventDefault()}>
                            <Facebook className="icon" />
                            <span> - Facebook</span>
                        </a>
                    </li>
                    <li className="social-3d-item">
                        <a href="https://x.com/i/communities/1983062242292822298" target="_blank" rel="noopener noreferrer" className="social-3d-link">
                            <Twitter className="icon" />
                            <span> - Twitter</span>
                        </a>
                    </li>
                    <li className="social-3d-item">
                        <a href="#" onClick={(e) => { e.preventDefault(); onStart?.(); }} className="social-3d-link">
                            <Play className="icon" />
                            <span> - Start</span>
                        </a>
                    </li>
                    <li className="social-3d-item">
                        <a href="#" className="social-3d-link" onClick={(e) => e.preventDefault()}>
                            <Instagram className="icon" />
                            <span> - Instagram</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default React.memo(Starfield);
