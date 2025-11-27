import React from 'react';
import Card from '../components/ui/Card';
import { MapPin } from 'lucide-react';

interface MapViewProps {
    theme: 'DEFAULT' | 'DOODLE' | 'CONSOLE';
}

const MapView: React.FC<MapViewProps> = ({ theme }) => {
    return (
        <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card title={theme === 'DOODLE' ? 'World Map' : (theme === 'CONSOLE' ? 'Network Topology' : 'Global Map')} theme={theme}>
                <div className={`
                    w-full h-[400px] rounded-lg relative overflow-hidden flex items-center justify-center
                    ${theme === 'CONSOLE' ? 'bg-gray-100 border border-black' : 'bg-[#0a0f1d] border border-gray-800'}
                    ${theme === 'DOODLE' ? 'bg-[#2a2a2a] border-2 border-dashed border-white' : ''}
                `}>
                    {/* Placeholder Map Visual */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `radial-gradient(${theme === 'CONSOLE' ? '#000' : '#3b82f6'} 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}></div>

                    <div className="relative z-10 text-center">
                        <MapPin size={48} className={`mx-auto mb-4 ${theme === 'CONSOLE' ? 'text-black' : 'text-kraken-primary'}`} />
                        <h3 className={`text-xl font-bold ${theme === 'CONSOLE' ? 'text-black' : 'text-white'}`}>
                            Map Unavailable
                        </h3>
                        <p className={`text-sm ${theme === 'CONSOLE' ? 'text-gray-600' : 'text-gray-400'}`}>
                            Geospatial data module is currently offline.
                        </p>
                    </div>

                    {/* Fake Nodes */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`absolute w-3 h-3 rounded-full animate-pulse ${theme === 'CONSOLE' ? 'bg-black' : 'bg-kraken-success'}`}
                            style={{
                                top: `${Math.random() * 80 + 10}%`,
                                left: `${Math.random() * 80 + 10}%`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        ></div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default MapView;
