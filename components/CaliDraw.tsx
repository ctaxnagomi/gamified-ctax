import React, { useState, useRef, Suspense } from 'react';
import { MainMenu, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import {
    Save, Upload, Image as ImageIcon, Code, X,
    Folder, Terminal, Bot, Layout, ChevronDown,
    Play, FileJson, Settings, Server, Cpu, Network, LogOut,
    PanelLeftClose, PanelRightClose, PanelBottomClose, Workflow
} from 'lucide-react';

// Lazy load Excalidraw
const Excalidraw = React.lazy(() => import("@excalidraw/excalidraw").then(module => ({ default: module.Excalidraw })));

interface CaliDrawProps {
    onMinimize?: () => void;
    isMinimized?: boolean;
    onExit?: () => void;
}

const CaliDraw: React.FC<CaliDrawProps> = ({ onMinimize, isMinimized, onExit }) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

    // Compact Panel States
    const [showLeftPanel, setShowLeftPanel] = useState(false); // Default closed for max canvas
    const [showRightPanel, setShowRightPanel] = useState(false); // Default closed
    const [showBottomPanel, setShowBottomPanel] = useState(false); // Default closed
    const [activeBottomTab, setActiveBottomTab] = useState<'TERMINAL' | 'MERMAID'>('TERMINAL');

    // AI & CLI States
    const [selectedModel, setSelectedModel] = useState('GEMINI');
    const [cliInput, setCliInput] = useState('');
    const [logs, setLogs] = useState<string[]>(['> Ready.']);

    // AI Pipeline States
    const [selectedPreset, setSelectedPreset] = useState('PIPELINE');
    const [customInstruction, setCustomInstruction] = useState('Generate a workflow pipeline diagram.');

    // Mermaid Data
    const [mermaidInput, setMermaidInput] = useState(`graph LR
    A[Trigger] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Action A]
    C -->|No| E[Action B]
    D --> F[End]
    E --> F`);

    const addLog = (msg: string) => setLogs(prev => [...prev.slice(-20), `> ${msg}`]); // Keep last 20

    // CLI Command Handler
    const handleCliCommand = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = cliInput.trim().toLowerCase();
            const rawCmd = cliInput.trim();
            if (!rawCmd) return;
            addLog(`$ ${rawCmd}`);

            if (cmd === 'help') {
                addLog('Commands: status, generate, export, scene, clear');
            } else if (cmd === 'clear') {
                setLogs(['> Cleared.']);
            } else if (cmd === 'status') {
                addLog(`MODEL: ${selectedModel} | PRESET: ${selectedPreset}`);
            } else if (cmd === 'generate') {
                addLog(`Generating ${selectedPreset}...`);
                setTimeout(() => addLog('[OK] Generated.'), 500);
            } else if (cmd === 'export') {
                handleExportJSON();
            } else if (cmd === 'scene') {
                const elements = excalidrawAPI?.getSceneElements() || [];
                addLog(`Elements: ${elements.length}`);
            } else {
                addLog(`[ERR] Unknown: ${rawCmd}`);
            }
            setCliInput('');
        }
    };

    // Handle Mermaid Conversion
    const handleMermaidConvert = async () => {
        try {
            addLog("Parsing Mermaid...");
            const { elements } = await parseMermaidToExcalidraw(mermaidInput);
            if (excalidrawAPI) {
                excalidrawAPI.updateScene({
                    elements: [
                        ...excalidrawAPI.getSceneElements(),
                        ...convertToExcalidrawElements(elements)
                    ]
                });
                addLog("[OK] Diagram rendered.");
            }
        } catch (error) {
            addLog(`[ERR] Mermaid parse failed.`);
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
        link.download = "pipeline-export.json";
        link.click();
        addLog("Exported to JSON.");
    };

    // Preset Handlers
    const PRESETS = [
        { id: 'PIPELINE', label: 'Workflow Pipeline', instruction: 'Generate a workflow automation pipeline with nodes and connections.' },
        { id: 'ARCHITECTURE', label: 'System Architecture', instruction: 'Generate a system architecture diagram.' },
        { id: 'USER_FLOW', label: 'User Flow', instruction: 'Create a user journey flow diagram.' },
        { id: 'DB_SCHEMA', label: 'Database Schema', instruction: 'Design an ERD diagram.' },
    ];

    const handlePresetChange = (presetId: string) => {
        setSelectedPreset(presetId);
        const preset = PRESETS.find(p => p.id === presetId);
        if (preset) setCustomInstruction(preset.instruction);
    };

    if (isMinimized) return null;

    return (
        <div className="w-full h-full flex flex-col bg-[#0d0d0d] text-gray-300 font-mono overflow-hidden">

            {/* --- TOP BAR (Compact) --- */}
            <div className="h-10 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-3 select-none shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onExit}
                        className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/20 transition-colors"
                        title="Exit"
                    >
                        <LogOut size={12} />
                        <span className="text-[10px] font-bold hidden sm:inline">EXIT</span>
                    </button>

                    <div className="w-px h-5 bg-[#333]" />

                    <div className="flex items-center gap-2">
                        <Workflow size={16} className="text-[#00f0ff]" />
                        <span className="text-xs font-bold text-gray-200">Pipeline <span className="text-[#00f0ff]">IDE</span></span>
                    </div>

                    <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-1.5 py-0.5 rounded border border-[#00f0ff]/20 font-bold">
                        {selectedModel}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowLeftPanel(!showLeftPanel)}
                        className={`p-1.5 rounded transition-all ${showLeftPanel ? 'bg-[#222] text-[#00f0ff]' : 'text-gray-500 hover:bg-[#222]'}`}
                        title="Files"
                    >
                        <PanelLeftClose size={14} />
                    </button>
                    <button
                        onClick={() => setShowBottomPanel(!showBottomPanel)}
                        className={`p-1.5 rounded transition-all ${showBottomPanel ? 'bg-[#222] text-[#00f0ff]' : 'text-gray-500 hover:bg-[#222]'}`}
                        title="Terminal"
                    >
                        <PanelBottomClose size={14} />
                    </button>
                    <button
                        onClick={() => setShowRightPanel(!showRightPanel)}
                        className={`p-1.5 rounded transition-all ${showRightPanel ? 'bg-[#222] text-[#00f0ff]' : 'text-gray-500 hover:bg-[#222]'}`}
                        title="AI Assistant"
                    >
                        <PanelRightClose size={14} />
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT PANEL (Files) - Compact */}
                {showLeftPanel && (
                    <div className="w-48 bg-[#111] border-r border-[#333] flex flex-col shrink-0 z-20">
                        <div className="h-8 bg-[#151515] border-b border-[#333] flex items-center px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Files
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 text-xs">
                            {['pipeline_main.json', 'api_flow.json', 'db_schema.json'].map(file => (
                                <div key={file} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#1f1f1f] rounded cursor-pointer text-gray-400 hover:text-white transition-colors">
                                    <FileJson size={12} className="text-blue-400" />
                                    <span className="truncate">{file}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CENTER (Canvas) */}
                <div className="flex-1 flex flex-col min-w-0 relative">

                    {/* CANVAS */}
                    <div className="flex-1 relative bg-[#121212]">
                        <Suspense fallback={
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                                <div className="w-6 h-6 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-mono">Loading...</span>
                            </div>
                        }>
                            <Excalidraw
                                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                                theme="dark"
                                UIOptions={{
                                    canvasActions: {
                                        loadScene: true,
                                        export: { saveFileToDisk: true },
                                        clearCanvas: true,
                                    }
                                }}
                            >
                                <MainMenu>
                                    <MainMenu.DefaultItems.LoadScene />
                                    <MainMenu.DefaultItems.Export />
                                    <MainMenu.DefaultItems.ClearCanvas />
                                </MainMenu>
                            </Excalidraw>
                        </Suspense>
                    </div>

                    {/* BOTTOM PANEL (Terminal/Mermaid) - Compact */}
                    {showBottomPanel && (
                        <div className="h-36 bg-[#0a0a0a] border-t border-[#333] flex flex-col shrink-0 z-10">
                            {/* Tabs */}
                            <div className="flex items-center bg-[#111] border-b border-[#333] h-7 shrink-0">
                                <button
                                    onClick={() => setActiveBottomTab('TERMINAL')}
                                    className={`h-full px-3 text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-colors ${activeBottomTab === 'TERMINAL' ? 'bg-[#0a0a0a] text-[#00f0ff] border-t border-t-[#00f0ff]' : 'text-gray-500 hover:bg-[#1a1a1a]'}`}
                                >
                                    <Terminal size={10} /> TERMINAL
                                </button>
                                <button
                                    onClick={() => setActiveBottomTab('MERMAID')}
                                    className={`h-full px-3 text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-colors ${activeBottomTab === 'MERMAID' ? 'bg-[#0a0a0a] text-green-400 border-t border-t-green-400' : 'text-gray-500 hover:bg-[#1a1a1a]'}`}
                                >
                                    <Code size={10} /> MERMAID
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-hidden">
                                {activeBottomTab === 'TERMINAL' && (
                                    <div className="h-full p-2 flex flex-col text-[11px]">
                                        <div className="flex-1 overflow-y-auto space-y-0.5 text-gray-400 font-mono">
                                            {logs.map((log, i) => <div key={i}>{log}</div>)}
                                        </div>
                                        <div className="flex items-center gap-1 text-[#00f0ff] border-t border-[#222] pt-1.5 mt-1">
                                            <span className="font-bold">$</span>
                                            <input
                                                type="text"
                                                value={cliInput}
                                                onChange={(e) => setCliInput(e.target.value)}
                                                onKeyDown={handleCliCommand}
                                                className="bg-transparent border-none focus:outline-none flex-1 text-gray-200 font-mono"
                                                placeholder="help"
                                            />
                                        </div>
                                    </div>
                                )}
                                {activeBottomTab === 'MERMAID' && (
                                    <div className="h-full flex">
                                        <textarea
                                            value={mermaidInput}
                                            onChange={(e) => setMermaidInput(e.target.value)}
                                            className="flex-1 bg-[#0a0a0a] text-green-400 font-mono text-[11px] p-2 resize-none focus:outline-none"
                                            spellCheck={false}
                                            aria-label="Mermaid Input"
                                        />
                                        <button
                                            onClick={handleMermaidConvert}
                                            className="w-20 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold flex items-center justify-center gap-1"
                                        >
                                            <Play size={10} /> RUN
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL (AI) - Compact */}
                {showRightPanel && (
                    <div className="w-56 bg-[#111] border-l border-[#333] flex flex-col shrink-0 z-20">
                        <div className="h-8 bg-[#151515] border-b border-[#333] flex items-center px-3 text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider">
                            AI Copilot
                        </div>
                        <div className="flex-1 p-3 flex flex-col overflow-y-auto text-xs gap-3">

                            {/* Preset */}
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold mb-1 block">PRESET</label>
                                <select
                                    value={selectedPreset}
                                    onChange={(e) => handlePresetChange(e.target.value)}
                                    className="w-full bg-[#1a1a1a] text-[11px] text-gray-300 border border-[#333] rounded px-2 py-1.5 focus:outline-none focus:border-[#00f0ff]"
                                    aria-label="Select Preset"
                                >
                                    {PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>

                            {/* Instructions */}
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold mb-1 block">INSTRUCTIONS</label>
                                <textarea
                                    value={customInstruction}
                                    onChange={(e) => setCustomInstruction(e.target.value)}
                                    className="w-full h-20 bg-[#1a1a1a] text-[11px] text-gray-300 border border-[#333] rounded p-2 focus:outline-none focus:border-[#00f0ff] resize-none"
                                    placeholder="Describe..."
                                />
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={() => addLog(`Generating ${selectedPreset}...`)}
                                className="w-full py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 rounded text-[10px] font-bold flex items-center justify-center gap-1.5"
                            >
                                <Bot size={12} /> GENERATE
                            </button>

                            {/* Image Upload */}
                            <div className="border-t border-[#333] pt-3 mt-auto">
                                <label className="text-[10px] text-gray-500 font-bold mb-1 block">VISION INPUT</label>
                                <div className="p-3 border border-dashed border-[#333] rounded bg-[#151515] text-center cursor-pointer hover:border-[#00f0ff]/50 transition-colors">
                                    <Upload size={14} className="mx-auto mb-1 text-gray-400" />
                                    <span className="text-[10px] text-gray-500">Drop image</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* STATUS BAR (Minimal) */}
            <div className="h-5 bg-[#007acc] flex items-center justify-between px-3 text-[10px] text-white select-none shrink-0 z-40">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Workflow size={10} /> Pipeline Mode</span>
                    <span className="opacity-60">|</span>
                    <span>{selectedModel}</span>
                </div>
                <span className="opacity-60 hidden sm:inline">Ready</span>
            </div>
        </div>
    );
};

export default CaliDraw;
