import React from 'react';
import { Facebook, Twitter, Instagram, Play } from 'lucide-react';

interface StarfieldProps {
    onStart?: () => void;
}

const Starfield: React.FC<StarfieldProps> = ({ onStart }) => {
    return (
        <div className="fixed inset-0 z-0 bg-black overflow-hidden perspective-1000">
            {/* Stars Layers */}
            <div className="absolute inset-0 z-0">
                <div id='stars' className="w-[1px] h-[1px] bg-transparent shadow-[0_0_1px_#FFF] animate-star-slow"></div>
                <div id='stars2' className="w-[2px] h-[2px] bg-transparent shadow-[0_0_2px_#FFF] animate-star-medium"></div>
                <div id='stars3' className="w-[3px] h-[3px] bg-transparent shadow-[0_0_3px_#FFF] animate-star-fast"></div>
            </div>

            {/* Title */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 mix-blend-screen pointer-events-none">
                <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-900 tracking-tighter opacity-20 blur-sm animate-pulse">KRACKED DEV</h1>
            </div>

            {/* 3D Social Icons */}
            <ul className="social-3d-container pointer-events-auto">
                <li className="social-3d-item">
                    <a href="#" className="social-3d-link" onClick={(e) => e.preventDefault()}>
                        <Facebook className="icon" />
                        <span>- Facebook</span>
                    </a>
                </li>
                <li className="social-3d-item">
                    <a href="https://x.com/i/communities/1983062242292822298" target="_blank" rel="noopener noreferrer" className="social-3d-link">
                        <Twitter className="icon" />
                        <span>- Twitter</span>
                    </a>
                </li>
                <li className="social-3d-item">
                    <a href="#" onClick={(e) => { e.preventDefault(); onStart?.(); }} className="social-3d-link">
                        <Play className="icon" />
                        <span>- Start</span>
                    </a>
                </li>
                <li className="social-3d-item">
                    <a href="#" className="social-3d-link" onClick={(e) => e.preventDefault()}>
                        <Instagram className="icon" />
                        <span>- Instagram</span>
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default React.memo(Starfield);
