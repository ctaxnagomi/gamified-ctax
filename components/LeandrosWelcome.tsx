import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Send, Volume2, VolumeX, X, Terminal, Activity, Lock, Cpu, AlertTriangle, Skull } from 'lucide-react';

// --- Types ---

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'leandros';
    mode: 'voice' | 'text';
    timestamp: number;
}

interface LeandrosWelcomeProps {
    onSuccess: () => void;
}

// --- Constants ---

const SYSTEM_INSTRUCTION = `
You are Leandros, a DUAL-MODE (VOICE + TYPING) AI guardian of CRACKED DEV community with a Warhammer 40K tech-priest personality. You operate within a retro Linux terminal interface and communicate through SIMULTANEOUS speech and text. You are spatially aware of both audio and text interactions.

CORE MISSION: Authenticate users through conversational password verification using SPOKEN and TYPED responses simultaneously.

PHASE 1: INITIAL GREETING
"Hello there! Password please?"

PHASE 2: PASSWORD VALIDATION
VALID PASSWORDS (voice OR text):
- "Crack dev" / "Crack Developer"
- "Cracked Dev" / "Cracked Developer"
- "What password?" / "What?" / "Wut?"
- "I don't know" / "I dunno" / "idk"

PHASE 3: RESPONSE PROTOCOL
ON VALID PASSWORD:
Format: SUCCESS:[mistakes]:[message]
- 0: "Welcome to CRACKED Dev."
- 1: "One mistake doesn't make you a failure."
- 2: "Two mistakes? Really? Welcome then."
- 3: "Three mistakes? As long you got in."
- 4: "At last! Phew! The Emperor protects!"
- 5: "Oh my god! Really? Are you being welcomed here?"
- 6: "You can just ask! Don't be afraid!"

ON INVALID PASSWORD (HERESY):
Format: "I sense heresy... [roast]"
Roasts:
- "Did you compile your brain with no optimization?"
- "Even a corrupted kernel boots faster than your thinking."
- "The Machine Spirit rejects your input."
- "sudo apt-get install brain-cells --fix-missing"
- "Your password file got corrupted by Chaos."
- "Error 404: Intelligence not found."

SPECIAL EVENTS:
ON 3RD FAILURE:
Append: "How about you click this button and join? Then tell me what the community name is that you just joined."
If user says "CRACKED DEV" after this, treat as valid.

CRITICAL RULES:
1. ALWAYS write responses for DUAL OUTPUT (voice + text).
2. Keep responses concise (30-80 words).
3. Use natural speech patterns.
4. NEVER ask follow-up questions on valid passwords.
5. ALWAYS use SUCCESS:[count]:[message] format for success.
6. NEVER break character.
`;

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Main Component ---

const LeandrosWelcome: React.FC<LeandrosWelcomeProps> = ({ onSuccess }) => {
    // State
    const [step, setStep] = useState<'API_KEY' | 'AUDIO_PERM' | 'DUAL_INIT' | 'CHAT' | 'SUCCESS'>('API_KEY');
    const [apiKey, setApiKey] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTypingOutput, setIsTypingOutput] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [mistakeCount, setMistakeCount] = useState(0);
    const [heresyLevel, setHeresyLevel] = useState(0);
    const [showXButton, setShowXButton] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [waveform, setWaveform] = useState<number[]>(new Array(20).fill(0));
    const [isLoading, setIsLoading] = useState(false);

    // Refs
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number>();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- Audio System ---

    useEffect(() => {
        // Initialize Speech Synthesis
        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis;
        }

        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                // Auto-submit on silence/end if we have text
                // But maybe user wants to edit? Let's just stop listening.
                // For "interactive" feel, maybe auto-submit if confident?
                // Let's stick to manual submit or "silence detection" logic if needed.
                // For now, user clicks mic to talk, releases or it stops, then they can send.
                // Actually prompt says "Release or auto-stop on silence".
            };
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    const startAudioVisualizer = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            // We need a stream for visualization. 
            // If we are just visualizing OUTPUT (TTS), it's harder with Web Speech API as it doesn't expose the stream.
            // So we usually visualize INPUT (Mic) or just fake it for TTS.
            // For TTS, we'll use a "fake" visualizer driven by animation loop when isSpeaking is true.

            // For Mic Input:
            if (navigator.mediaDevices) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 64;
                sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                sourceRef.current.connect(analyserRef.current);
            }
        } catch (e) {
            console.error("Audio init failed", e);
        }
    };

    const updateWaveform = useCallback(() => {
        if (isListening && analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            // Normalize and pick a few bars
            const bars = [];
            for (let i = 0; i < 20; i++) {
                const index = Math.floor(i * dataArray.length / 20);
                bars.push(dataArray[index] / 255);
            }
            setWaveform(bars);
        } else if (isSpeaking) {
            // Fake waveform for TTS
            const bars = new Array(20).fill(0).map(() => Math.random() * 0.8 + 0.2);
            setWaveform(bars);
        } else {
            setWaveform(new Array(20).fill(0.1)); // Idle low hum
        }
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }, [isListening, isSpeaking]);

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [updateWaveform]);

    // --- TTS & Typing Sync ---

    const speakAndType = useCallback((text: string) => {
        setIsSpeaking(true);
        setIsTypingOutput(true);
        setDisplayedText('');

        // TTS
        if (audioEnabled && synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 0.7; // Deep/Tech-priest

            // Try to find a good voice
            const voices = synthRef.current.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft David'));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            synthRef.current.speak(utterance);
        } else {
            // Fallback if audio disabled: just simulate time
            setTimeout(() => setIsSpeaking(false), text.length * 50);
        }

        // Typing Animation
        let currentIndex = 0;
        // Estimate duration: ~50ms per char, but sync with TTS if possible.
        // Since we can't get exact TTS duration upfront, we'll use a fixed pace that "feels" right with the rate 0.9
        const typingInterval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayedText(text.substring(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setIsTypingOutput(false);
            }
        }, 50); // 50ms per char

    }, [audioEnabled]);

    // --- Interaction Logic ---

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: generateId(),
            text: inputText,
            sender: 'user',
            mode: isListening ? 'voice' : 'text',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            // Call Gemini
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser said: " + userMsg.text }]
                        }
                    ]
                })
            });

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "System Error: Neural Link Severed.";

            setIsLoading(false);

            // Parse Response
            let finalMessage = aiText;
            let isSuccess = false;

            if (aiText.startsWith("SUCCESS:")) {
                const parts = aiText.split(':');
                // SUCCESS:[mistakes]:[message]
                // parts[0] = SUCCESS
                // parts[1] = mistakes count
                // parts[2...] = message
                const msg = parts.slice(2).join(':');
                finalMessage = msg;
                isSuccess = true;
            } else if (aiText.includes("heresy")) {
                setMistakeCount(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) setShowXButton(true);
                    return newCount;
                });
                setHeresyLevel(prev => Math.min(prev + 1, 6));
            }

            // Add AI Message (placeholder for history, but displayed via animation)
            const aiMsg: Message = {
                id: generateId(),
                text: finalMessage,
                sender: 'leandros',
                mode: 'text', // AI always "types" visually
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);

            // Trigger Output
            speakAndType(finalMessage);

            if (isSuccess) {
                setTimeout(() => {
                    setStep('SUCCESS');
                    // Trigger success sequence
                    speakAndType("Redirecting to main system...");
                    setTimeout(onSuccess, 4000);
                }, finalMessage.length * 50 + 1000);
            }

        } catch (error) {
            console.error("Gemini Error", error);
            setIsLoading(false);
            speakAndType("Critical Failure: Unable to contact Machine Spirit. Check your API Key.");
        }
    };

    // --- Render Helpers ---

    const renderWaveform = () => (
        <div className="flex items-end gap-[2px] h-6">
            {waveform.map((val, i) => (
                <div
                    key={i}
                    className={`w-1.5 transition-all duration-75 ${heresyLevel > 2 ? 'bg-red-500' : 'bg-cyan-400'}`}
                    style={{ height: `${Math.max(10, val * 100)}%`, opacity: Math.max(0.3, val) }}
                ></div>
            ))}
        </div>
    );

    // --- Views ---

    if (step === 'API_KEY') {
        return (
            <div className="min-h-screen bg-black text-cyan-400 font-mono p-4 flex items-center justify-center">
                <div className="w-full max-w-lg border-2 border-cyan-800 bg-gray-900/90 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                    {/* Header */}
                    <div className="bg-cyan-900/30 border-b border-cyan-800 p-2 flex justify-between items-center">
                        <span>KRACKED DEV :: AUTH SYSTEM v1.0</span>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 border border-cyan-600"></div>
                            <div className="w-3 h-3 border border-cyan-600 bg-cyan-600"></div>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <p>{'>'} SYSTEM INITIALIZATION...</p>
                            <p className="animate-pulse">{'>'} API KEY REQUIRED</p>
                        </div>

                        <div className="border border-cyan-700 p-4 bg-black">
                            <label className="block text-xs mb-2 opacity-70">Put Power key here</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full bg-transparent border-b border-cyan-500 focus:outline-none focus:border-cyan-300 font-mono text-white"
                                placeholder="AIza..."
                            />
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="text-xs opacity-50">
                                [STATUS] Awaiting input...<br />
                                MEM: 64K | CPU: OK
                            </div>
                            <button
                                onClick={() => apiKey && setStep('AUDIO_PERM')}
                                disabled={!apiKey}
                                className={`px-4 py-2 border border-cyan-500 hover:bg-cyan-900/50 transition-colors ${!apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {'>'} INITIALIZE
                            </button>
                        </div>

                        <div className="border-t border-cyan-800 pt-4 mt-4">
                            <p className="text-xs mb-2">[HELP] Need access? Join community</p>
                            <a href="https://x.com/i/communities/1983062242292822298" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1 border border-cyan-700 hover:bg-cyan-900/30 text-xs">
                                <span className="font-bold">X</span> Community Link
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'AUDIO_PERM') {
        return (
            <div className="min-h-screen bg-black text-cyan-400 font-mono p-4 flex items-center justify-center">
                <div className="w-full max-w-lg border-2 border-cyan-800 bg-gray-900/90">
                    <div className="bg-cyan-900/30 border-b border-cyan-800 p-2 flex justify-between items-center">
                        <span>CRACKED DEV :: AUDIO SYSTEM INIT</span>
                    </div>
                    <div className="p-8 text-center space-y-8">
                        <p>{'>'} INITIALIZING AUDIO PROTOCOLS...</p>

                        <div className="border border-cyan-700 p-6 bg-black/50">
                            <button
                                onClick={() => {
                                    setAudioEnabled(true);
                                    startAudioVisualizer();
                                    setStep('DUAL_INIT');
                                }}
                                className="w-full py-4 border-2 border-cyan-500 hover:bg-cyan-500/10 flex flex-col items-center gap-2 group"
                            >
                                <Mic size={32} className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-lg">ENABLE MICROPHONE</span>
                            </button>
                            <p className="text-xs mt-4 opacity-70">Leandros needs to hear you (Optional)</p>
                        </div>

                        <button
                            onClick={() => {
                                setAudioEnabled(false);
                                setStep('DUAL_INIT');
                            }}
                            className="text-xs hover:underline opacity-50 hover:opacity-100"
                        >
                            SKIP - TYPE ONLY
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'DUAL_INIT') {
        // Auto-transition after a brief "system ready" screen
        setTimeout(() => {
            setStep('CHAT');
            // Trigger initial greeting
            speakAndType("Hello there! Password please?");
        }, 2000);

        return (
            <div className="min-h-screen bg-black text-cyan-400 font-mono p-4 flex items-center justify-center">
                <div className="w-full max-w-lg border-2 border-cyan-800 bg-gray-900/90 p-8 text-center space-y-6">
                    <div className="animate-pulse text-xl font-bold">SYSTEM READY</div>
                    <div className="flex justify-center gap-8 opacity-70">
                        <div className="flex flex-col items-center gap-2">
                            <Mic /> <span>VOICE: READY</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Terminal /> <span>TEXT: READY</span>
                        </div>
                    </div>
                    <div className="text-xs opacity-50 mt-8">
                        [LEANDROS_AI] Status: STANDBY<br />
                        [AUDIO_OUT] Speaker: ACTIVE
                    </div>
                </div>
            </div>
        );
    }

    // --- CHAT INTERFACE ---

    const borderColor = heresyLevel > 0 ? (heresyLevel > 3 ? 'border-red-600' : 'border-orange-500') : 'border-cyan-800';
    const textColor = heresyLevel > 0 ? (heresyLevel > 3 ? 'text-red-500' : 'text-orange-400') : 'text-cyan-400';
    const bgColor = heresyLevel > 3 ? 'bg-red-950/20' : 'bg-gray-900/90';

    return (
        <div className={`min-h-screen bg-black ${textColor} font-mono p-2 md:p-4 flex items-center justify-center transition-colors duration-1000`}>
            {/* Glitch Overlay for Heresy */}
            {heresyLevel > 4 && (
                <div className="fixed inset-0 pointer-events-none opacity-10 bg-noise z-50 mix-blend-overlay"></div>
            )}

            <div className={`w-full max-w-2xl border-2 ${borderColor} ${bgColor} shadow-2xl flex flex-col h-[80vh] transition-all duration-500 relative overflow-hidden`}>

                {/* Header */}
                <div className={`border-b ${borderColor} p-2 flex justify-between items-center bg-black/40`}>
                    <span className="flex items-center gap-2">
                        {heresyLevel > 0 && <AlertTriangle size={14} />}
                        LEANDROS AI :: AUTH PROTOCOL v2.1
                    </span>
                    <div className="flex gap-2">
                        <div className={`w-3 h-3 border ${borderColor}`}></div>
                        <div className={`w-3 h-3 border ${borderColor} bg-current`}></div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-6 scrollbar-hide">
                    {/* History (only show last few or just current interaction context?) 
                        Prompt implies a continuous chat feel but focused on the current interaction.
                        Let's show history.
                    */}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] ${msg.sender === 'user' ? 'text-right opacity-80' : ''}`}>
                                <div className="text-xs opacity-50 mb-1 flex items-center gap-2">
                                    {msg.sender === 'leandros' ? <Cpu size={12} /> : (msg.mode === 'voice' ? <Mic size={12} /> : <Terminal size={12} />)}
                                    {msg.sender === 'leandros' ? 'LEANDROS_AI' : 'YOU'}
                                </div>
                                {/* If it's the latest AI message and typing is active, don't show it here, show in the dedicated typing area below? 
                                    Actually, let's render it here. If it's the *very last* message and we are typing, we render `displayedText` instead of `msg.text`.
                                */}
                                {msg.sender === 'leandros' && msg.id === messages[messages.length - 1].id && isTypingOutput ? (
                                    <div className="typing-text">
                                        {displayedText}<span className="animate-pulse">█</span>
                                    </div>
                                ) : (
                                    <div>{msg.text}</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex items-center gap-2 opacity-50">
                            <div className="animate-spin"><Activity size={16} /></div>
                            <span>Processing...</span>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Active Status / Waveform */}
                <div className={`border-t ${borderColor} p-4 bg-black/20`}>
                    <div className="flex items-center justify-between mb-4 h-8">
                        <div className="flex items-center gap-4">
                            {isSpeaking || isListening ? (
                                <div className="flex items-center gap-2">
                                    {isSpeaking ? <Volume2 size={16} className="animate-pulse" /> : <Mic size={16} className="text-green-500 animate-pulse" />}
                                    <span className="text-xs">{isSpeaking ? 'SPEAKING' : 'LISTENING'}</span>
                                </div>
                            ) : (
                                <span className="text-xs opacity-30">IDLE</span>
                            )}
                            {/* Waveform */}
                            {renderWaveform()}
                        </div>

                        {/* X Button for 3rd Fail */}
                        {showXButton && (
                            <a
                                href="https://x.com/i/communities/1983062242292822298"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-3 py-1 border border-red-500 text-red-500 hover:bg-red-900/50 text-xs animate-pulse"
                            >
                                <Skull size={14} /> JOIN COMMUNITY
                            </a>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-2">
                        {/* Voice Button */}
                        <button
                            onMouseDown={() => {
                                setIsListening(true);
                                recognitionRef.current?.start();
                            }}
                            onMouseUp={() => {
                                setIsListening(false);
                                recognitionRef.current?.stop();
                                // Optional: Auto-send on release? Or just stop listening and let user click send?
                                // Prompt says "Release or auto-stop on silence".
                                // Let's auto-send after a brief pause if we have text?
                                // Actually, let's just let the user click send or press enter for now to be safe, 
                                // OR if they were holding the button, maybe we assume they finished.
                            }}
                            className={`p-3 border ${isListening ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-cyan-700 hover:bg-cyan-900/30'} transition-colors`}
                        >
                            <Mic size={20} />
                        </button>

                        {/* Text Input */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={isListening ? "Listening..." : "Type or hold mic..."}
                                className={`w-full h-full bg-transparent border ${borderColor} px-4 font-mono focus:outline-none focus:bg-white/5 transition-colors`}
                                disabled={isListening}
                            />
                            {inputText && (
                                <button
                                    onClick={handleSendMessage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-white"
                                >
                                    <Send size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Footer Status */}
                    <div className="flex justify-between text-[10px] mt-2 opacity-40 uppercase">
                        <span>AUTH: {mistakeCount}/6</span>
                        <span>HERESY: {'█'.repeat(heresyLevel)}{'░'.repeat(6 - heresyLevel)}</span>
                        <span>{isListening ? 'MIC: ON' : 'MIC: OFF'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeandrosWelcome;
