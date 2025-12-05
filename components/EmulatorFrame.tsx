import React, { useRef, useEffect } from 'react';

interface EmulatorFrameProps {
    romUrl: string;
    gameName?: string;
}

const EmulatorFrame: React.FC<EmulatorFrameProps> = ({ romUrl, gameName }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Construct the emulator URL
    // We assume the emulator assets are served at /emulator/index.html
    const emulatorSrc = `/emulator/index.html?rom=${encodeURIComponent(romUrl)}`;

    return (
        <div className="w-full h-full bg-black relative border border-cyan-900/50 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {/* Header / Title Bar specifically for the emulator frame provided by our app (optional) */}
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 flex items-center justify-between px-4 z-10 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-xs font-mono text-gray-500 uppercase">{gameName || "Unknown Game"}</span>
                <span className="text-[10px] text-gray-700 font-mono">EMULATORJS v4.3</span>
            </div>

            <iframe
                ref={iframeRef}
                src={emulatorSrc}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; gamepad; microphone"
                title="Emulator"
            />
        </div>
    );
};

export default EmulatorFrame;
