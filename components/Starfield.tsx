import React, { useMemo } from 'react';

const Starfield: React.FC = () => {
    const generateBoxShadow = (n: number) => {
        let value = `${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
        for (let i = 2; i <= n; i++) {
            value += `, ${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
        }
        return value;
    };

    const shadowsSmall = useMemo(() => generateBoxShadow(700), []);
    const shadowsMedium = useMemo(() => generateBoxShadow(200), []);
    const shadowsBig = useMemo(() => generateBoxShadow(100), []);

    return (
        <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_bottom,#1B2735_0%,#090A0F_100%)] z-0 pointer-events-none">
            <div className="w-[1px] h-[1px] bg-transparent animate-star-slow absolute" style={{ boxShadow: shadowsSmall }}>
                <div className="absolute top-[2000px] w-[1px] h-[1px] bg-transparent" style={{ boxShadow: shadowsSmall }}></div>
            </div>
            <div className="w-[2px] h-[2px] bg-transparent animate-star-medium absolute" style={{ boxShadow: shadowsMedium }}>
                <div className="absolute top-[2000px] w-[2px] h-[2px] bg-transparent" style={{ boxShadow: shadowsMedium }}></div>
            </div>
            <div className="w-[3px] h-[3px] bg-transparent animate-star-fast absolute" style={{ boxShadow: shadowsBig }}>
                <div className="absolute top-[2000px] w-[3px] h-[3px] bg-transparent" style={{ boxShadow: shadowsBig }}></div>
            </div>

            <div className="absolute top-1/2 left-0 right-0 -mt-[60px] text-center pointer-events-none z-10">
                <h1 className="font-sans font-light text-[50px] tracking-[10px] text-white">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-[#38495a]">KRACKED</span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-[#38495a]">DEV</span>
                </h1>
            </div>
        </div>
    );
};

export default Starfield;
