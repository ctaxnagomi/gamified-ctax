import React, { useState, useEffect, useRef, Suspense } from 'react';
import { MainMenu, WelcomeScreen, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import {
    Maximize2, Minimize2, Save, Upload, Image as ImageIcon, Code, X,
    Folder, Terminal, Bot, Layout, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
    Play, FileJson, Settings, Server, Cpu, Database, Network, LogOut
} from 'lucide-react';

// Lazy load Excalidraw to reduce initial bundle size
const Excalidraw = React.lazy(() => import("@excalidraw/excalidraw").then(module => ({ default: module.Excalidraw })));

interface CaliDrawProps {
    onMinimize?: () => void;
    isMinimized?: boolean;
    onExit?: () => void; // New prop for exiting to OS
}

const CaliDraw: React.FC<CaliDrawProps> = ({ onMinimize, isMinimized, onExit }) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

    // Panel States
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [showBottomPanel, setShowBottomPanel] = useState(true);
    const [activeBottomTab, setActiveBottomTab] = useState<'TERMINAL' | 'MERMAID' | 'LOGS'>('TERMINAL');

    // AI & CLI States
    const [selectedModel, setSelectedModel] = useState('GEMINI');
    const [cliInput, setCliInput] = useState('');
    const [logs, setLogs] = useState<string[]>(['> System initialized...', '> Ready for input.']);
    const [showConnectionModal, setShowConnectionModal] = useState(false);

    // AI Pipeline States
    const [selectedPreset, setSelectedPreset] = useState('ARCHITECTURE');
    const [customInstruction, setCustomInstruction] = useState('');

    // Mermaid Data
    const [mermaidInput, setMermaidInput] = useState(`graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]`);

    const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

    // CLI Command Handler
    const handleCliCommand = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = cliInput.trim();
            addLog(`$ ${cmd}`);

            if (cmd === '/connect') {
                setShowConnectionModal(true);
            } else if (cmd.startsWith('/model ')) {
                const model = cmd.split(' ')[1].toUpperCase();
                setSelectedModel(model);
                addLog(`Switched to model: ${model}`);
            } else if (cmd === 'help') {
                addLog('Available commands: /connect, /model [name], help, clear');
            } else if (cmd === 'clear') {
                setLogs([]);
            } else {
                addLog(`Unknown command: ${cmd}`);
            }
            setCliInput('');
        }
    };

    // Handle Mermaid Conversion
    const handleMermaidConvert = async () => {
        try {
            addLog("Parsing Mermaid syntax...");
            const { elements } = await parseMermaidToExcalidraw(mermaidInput);

            if (excalidrawAPI) {
                excalidrawAPI.updateScene({
                    elements: [
                        ...excalidrawAPI.getSceneElements(),
                        ...convertToExcalidrawElements(elements)
                    ]
                });
                addLog("Mermaid diagram rendered successfully.");
            }
        } catch (error) {
            console.error("Mermaid conversion failed:", error);
            addLog(`Error: Failed to convert Mermaid syntax.`);
        }
    };

    // Export to JSON
    const handleExportJSON = () => {
        if (!excalidrawAPI) return;
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        const data = JSON.stringify({ elements, appState }, null, 2);

        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "calidraw-export.json";
        link.click();
        addLog("Exported scene to JSON.");
    };

    // AI Preset Handler
    const handlePresetChange = (preset: string) => {
        setSelectedPreset(preset);
        switch (preset) {
            case 'ARCHITECTURE':
                setCustomInstruction('Generate a high-level system architecture diagram with clear separation of concerns. Use strict nodes and edges.');
                break;
            case 'USER_FLOW':
                setCustomInstruction('Create a user flow diagram showing the step-by-step journey. Focus on decision points and user actions.');
                break;
            case 'DB_SCHEMA':
                setCustomInstruction('Design a database schema diagram (ERD) showing tables, columns, and relationships. Use standard notation.');
                break;
            case 'MIND_MAP':
                setCustomInstruction('Generate a mind map exploring related concepts. Use loose associations and a central node.');
                break;
            default:
                setCustomInstruction('');
        }
    };

    if (isMinimized) {
        return null; // Rendered by parent in footer
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#0d0d0d] text-gray-300 font-mono overflow-hidden relative">

            {/* --- TOP BAR (Header) --- */}
            <div className="h-12 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-4 select-none shrink-0 shadow-lg z-30">
                <div className="flex items-center gap-4">
                    {/* Exit Button */}
                    <button
                        onClick={onExit}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md border border-red-500/20 transition-colors"
                        title="Exit to OS"
                    >
                        <LogOut size={14} />
                        <span className="text-xs font-bold">EXIT</span>
                    </button>

                    <div className="w-px h-6 bg-[#333]"></div>

                    <span className="text-sm font-bold text-gray-200 tracking-wide">CaliDraw <span className="text-[#00f0ff]">IDE</span></span>

                    <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/20 font-bold tracking-wider">
                        {selectedModel}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowLeftPanel(!showLeftPanel)}
                        className={`p-2 rounded-md transition-all ${showLeftPanel ? 'bg-[#222] text-[#00f0ff] shadow-inner' : 'text-gray-500 hover:bg-[#222]'}`}
                        title="Toggle File Browser"
                    >
                        <Layout size={18} />
                    </button>
                    <button
                        onClick={() => setShowBottomPanel(!showBottomPanel)}
                        className={`p-2 rounded-md transition-all ${showBottomPanel ? 'bg-[#222] text-[#00f0ff] shadow-inner' : 'text-gray-500 hover:bg-[#222]'}`}
                        title="Toggle Terminal"
                    >
                        <Terminal size={18} />
                    </button>
                    <button
                        onClick={() => setShowRightPanel(!showRightPanel)}
                        className={`p-2 rounded-md transition-all ${showRightPanel ? 'bg-[#222] text-[#00f0ff] shadow-inner' : 'text-gray-500 hover:bg-[#222]'}`}
                        title="Toggle AI Assistant"
                    >
                        <Bot size={18} />
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* ZONE 1: FILE BROWSER (Left) */}
                <div className={`${showLeftPanel ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'} bg-[#111] border-r border-[#333] flex flex-col transition-all duration-300 absolute md:relative z-20 h-full shadow-[5px_0_15px_rgba(0,0,0,0.3)] shrink-0`}>
                    <div className="h-10 bg-[#151515] border-b border-[#333] flex items-center px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Explorer
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 w-64">
                        <div className="text-[10px] font-bold text-gray-600 mb-2 px-1">OPEN EDITORS</div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#1f1f1f] rounded border border-[#333] text-xs text-white mb-6 cursor-pointer hover:border-[#00f0ff]/30 transition-colors group">
                            <FileJson size={14} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                            <span className="group-hover:text-[#00f0ff] transition-colors">untitled_diagram.json</span>
                        </div>

                        <div className="text-[10px] font-bold text-gray-600 mb-2 px-1">PROJECT FILES</div>
                        <div className="flex flex-col gap-1">
                            {['Architecture.draw', 'Database_Schema.draw', 'User_Flow.draw'].map(file => (
                                <div key={file} className="flex items-center gap-2 px-3 py-2 hover:bg-[#1f1f1f] rounded text-xs cursor-pointer text-gray-400 hover:text-white transition-colors group">
                                    <FileJson size={14} className="text-blue-500 group-hover:text-[#00f0ff]" />
                                    <span>{file}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN (Editor + Terminal) */}
                <div className="flex-1 flex flex-col min-w-0 relative bg-[#1e1e1e]">

                    {/* ZONE 2: MAIN EDITOR */}
                    <div className="flex-1 relative bg-[#121212]">
                        <Suspense fallback={
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                                <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-mono tracking-widest animate-pulse">INITIALIZING CORE...</span>
                            </div>
                        }>
                            <Excalidraw
                                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                                theme="dark"
                            >
                                <MainMenu>
                                    <MainMenu.DefaultItems.LoadScene />
                                    <MainMenu.DefaultItems.Export />
                                    <MainMenu.DefaultItems.SaveAsImage />
                                    <MainMenu.DefaultItems.ClearCanvas />
                                    <MainMenu.Separator />
                                    <MainMenu.DefaultItems.ToggleTheme />
                                    <MainMenu.DefaultItems.ChangeCanvasBackground />
                                </MainMenu>
                                <WelcomeScreen>
                                    <WelcomeScreen.Hints.MenuHint />
                                    <WelcomeScreen.Hints.ToolbarHint />
                                    <WelcomeScreen.Center>
                                        <WelcomeScreen.Center.Logo />
                                        <WelcomeScreen.Center.Heading>CaliDraw IDE</WelcomeScreen.Center.Heading>
                                    </WelcomeScreen.Center>
                                </WelcomeScreen>
                            </Excalidraw>
                        </Suspense>
                    </div>

                    {/* ZONE 4: TERMINAL (Bottom) */}
                    <div className={`${showBottomPanel ? 'h-72 translate-y-0' : 'h-0 translate-y-full opacity-0'} bg-[#0a0a0a] border-t border-[#333] flex flex-col transition-all duration-300 absolute bottom-0 w-full md:relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] shrink-0`}>
                        {/* Terminal Tabs */}
                        <div className="flex items-center bg-[#111] border-b border-[#333] shrink-0 h-9">
                            <button
                                onClick={() => setActiveBottomTab('TERMINAL')}
                                className={`h-full px-4 text-[10px] font-bold tracking-wider border-r border-[#333] flex items-center gap-2 transition-colors ${activeBottomTab === 'TERMINAL' ? 'bg-[#0a0a0a] text-[#00f0ff] border-t-2 border-t-[#00f0ff]' : 'text-gray-500 hover:bg-[#1a1a1a]'}`}
                            >
                                <Terminal size={12} /> TERMINAL
                            </button>
                            <button
                                onClick={() => setActiveBottomTab('MERMAID')}
                                className={`h-full px-4 text-[10px] font-bold tracking-wider border-r border-[#333] flex items-center gap-2 transition-colors ${activeBottomTab === 'MERMAID' ? 'bg-[#0a0a0a] text-green-400 border-t-2 border-t-green-400' : 'text-gray-500 hover:bg-[#1a1a1a]'}`}
                            >
                                <Code size={12} /> MERMAID
                            </button>

                            <div className="flex-1"></div>

                            {/* Status Indicators */}
                            <div className="flex items-center gap-4 px-4 text-[10px] text-gray-600 font-mono">
                                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> ONLINE</span>
                                <span>LATENCY: 24ms</span>
                            </div>
                        </div>

                        {/* Terminal Content */}
                        <div className="flex-1 overflow-hidden p-0 relative">
                            {activeBottomTab === 'MERMAID' && (
                                <div className="h-full flex">
                                    <div className="flex-1 relative group bg-[#0a0a0a]">
                                        <textarea
                                            value={mermaidInput}
                                            onChange={(e) => setMermaidInput(e.target.value)}
                                            className="w-full h-full bg-[#0a0a0a] text-green-500 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed"
                                            spellCheck={false}
                                            aria-label="Mermaid Diagram Input"
                                        />
                                        <button
                                            onClick={handleMermaidConvert}
                                            className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all"
                                        >
                                            <Play size={12} /> RENDER DIAGRAM
                                        </button>
                                    </div>
                                </div>
                            )}
                            {activeBottomTab === 'TERMINAL' && (
                                <div className="h-full bg-[#0a0a0a] p-3 overflow-y-auto font-mono text-xs flex flex-col">
                                    <div className="flex-1 space-y-1">
                                        {logs.map((log, i) => (
                                            <div key={i} className="text-gray-400 hover:text-gray-300 transition-colors border-l-2 border-transparent hover:border-[#333] pl-2">{log}</div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 text-[#00f0ff] mt-2 border-t border-[#222] pt-3">
                                        <span className="font-bold animate-pulse">➜</span>
                                        <span className="text-gray-500">~</span>
                                        <input
                                            type="text"
                                            value={cliInput}
                                            onChange={(e) => setCliInput(e.target.value)}
                                            onKeyDown={handleCliCommand}
                                            className="bg-transparent border-none focus:outline-none flex-1 text-gray-200 font-mono"
                                            placeholder="Enter command..."
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ZONE 3: AI ASSISTANT (Right) */}
                <div className={`${showRightPanel ? 'w-80 translate-x-0' : 'w-0 translate-x-full opacity-0'} bg-[#111] border-l border-[#333] flex flex-col transition-all duration-300 absolute right-0 md:relative z-20 h-full shadow-[-5px_0_15px_rgba(0,0,0,0.3)] shrink-0`}>
                    <div className="h-10 bg-[#151515] border-b border-[#333] flex items-center px-4 text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest">
                        AI Copilot
                    </div>
                    <div className="flex-1 p-5 flex flex-col overflow-y-auto w-80">

                        {/* Pipeline Section */}
                        <div className="mb-8">
                            <h3 className="text-[10px] font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <Cpu size={12} /> Generation Pipeline
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 font-bold">PRESET</label>
                                    <div className="relative">
                                        <select
                                            value={selectedPreset}
                                            onChange={(e) => handlePresetChange(e.target.value)}
                                            className="w-full bg-[#1a1a1a] text-xs text-gray-300 border border-[#333] rounded-md px-3 py-2 focus:outline-none focus:border-[#00f0ff] appearance-none cursor-pointer hover:bg-[#222] transition-colors"
                                            aria-label="Select Generation Preset"
                                        >
                                            <option value="ARCHITECTURE">Architecture Diagram</option>
                                            <option value="USER_FLOW">User Flow</option>
                                            <option value="DB_SCHEMA">Database Schema</option>
                                            <option value="MIND_MAP">Mind Map</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 font-bold">INSTRUCTIONS</label>
                                    <textarea
                                        value={customInstruction}
                                        onChange={(e) => setCustomInstruction(e.target.value)}
                                        className="w-full h-32 bg-[#1a1a1a] text-xs text-gray-300 border border-[#333] rounded-md p-3 focus:outline-none focus:border-[#00f0ff] resize-none leading-relaxed"
                                        placeholder="Describe what you want to generate..."
                                    />
                                </div>

                                <button
                                    onClick={() => addLog(`Generating ${selectedPreset} with AI...`)}
                                    className="w-full py-2.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                >
                                    <Bot size={14} /> GENERATE JSON
                                </button>
                            </div>
                        </div>

                        {/* Vision Section */}
                        <div className="border-t border-[#333] pt-6">
                            <h3 className="text-[10px] font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <ImageIcon size={12} /> Vision to JSON
                            </h3>
                            <div className="p-6 border-2 border-dashed border-[#333] rounded-lg bg-[#151515] text-center cursor-pointer hover:bg-[#1a1a1a] hover:border-[#444] transition-all group">
                                <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <Upload size={18} className="text-gray-400 group-hover:text-[#00f0ff]" />
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold">DROP IMAGE HERE</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* STATUS BAR */}
            <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-[10px] text-white select-none shrink-0 z-40">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-bold"><Code size={10} /> master*</span>
                    <span className="opacity-80">|</span>
                    <span className="font-mono">{selectedModel} ACTIVE</span>
                </div>
                <div className="flex items-center gap-4 font-mono opacity-80">
                    <span className="hidden md:inline">Ln 12, Col 45</span>
                    <span className="hidden md:inline">UTF-8</span>
                    <span className="hover:bg-white/20 px-1 rounded cursor-pointer">Prettier</span>
                </div>
            </div>

            {/* Connection Modal */}
            {showConnectionModal && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1e1e1e] w-full max-w-md rounded-lg border border-gray-700 shadow-2xl p-6 relative overflow-hidden">
                        {/* Decorative top bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Network size={20} className="text-[#00f0ff]" />
                            Connect to CLI
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Connection Type</label>
                                <select
                                    className="w-full bg-[#121212] border border-gray-700 rounded p-2.5 text-sm text-white focus:border-[#00f0ff] focus:outline-none transition-colors"
                                    aria-label="Select Connection Type"
                                >
                                    <option>SSH (Secure Shell)</option>
                                    <option>WebSocket API</option>
                                    <option>Supabase Direct</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Host / Endpoint</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#121212] border border-gray-700 rounded p-2.5 text-sm text-white focus:border-[#00f0ff] focus:outline-none transition-colors"
                                    placeholder="user@host:port"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">API Key / Private Key</label>
                                <textarea
                                    className="w-full h-24 bg-[#121212] border border-gray-700 rounded p-2.5 text-sm text-white focus:border-[#00f0ff] focus:outline-none resize-none font-mono transition-colors"
                                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowConnectionModal(false)}
                                className="px-4 py-2 rounded text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={() => {
                                    setShowConnectionModal(false);
                                    addLog("Connecting to remote host... [MOCKED]");
                                    setTimeout(() => addLog("Connection established. Authenticated as 'user'."), 1000);
                                }}
                                className="px-6 py-2 rounded bg-[#00f0ff] hover:bg-[#00c0cc] text-black text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
                            >
                                CONNECT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaliDraw;
