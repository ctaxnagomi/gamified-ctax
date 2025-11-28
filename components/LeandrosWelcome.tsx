import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Volume2, Cpu, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';

interface LeandrosWelcomeProps {
    onSuccess: () => void;
}

const LeandrosWelcome: React.FC<LeandrosWelcomeProps> = ({ onSuccess }) => {
    // --- STATE ---
    const [step, setStep] = useState<'API_KEY' | 'AUDIO_PERM' | 'DUAL_INIT' | 'CHAT'>('API_KEY');
    const [apiKey, setApiKey] = useState('');
    const [isApiKeyValid, setIsApiKeyValid] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isTypingOutput, setIsTypingOutput] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [mistakeCount, setMistakeCount] = useState(0);
    const [heresyLevel, setHeresyLevel] = useState(0); // 0-6
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [waveform, setWaveform] = useState<number[]>(new Array(20).fill(0));
    const [conversationHistory, setConversationHistory] = useState<{ role: 'user' | 'model', parts: any[] }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- REFS ---
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number>();
    const containerRef = useRef<HTMLDivElement>(null);

    // --- VALID PASSWORDS ---
    const VALID_PASSWORDS = [
        "crack dev",
        "crack developer",
        "cracked dev",
        "cracked developer",
        "what password?",
        "what password",
        "what?",
        "what",
        "wut?",
        "wut",
        "i don't know",
        "i dont know",
        "i dunno",
        "idk"
    ];

    // Password validation function
    const isValidPassword = (input: string): boolean => {
        const normalized = input.toLowerCase().trim();
        return VALID_PASSWORDS.includes(normalized);
    };

    // Get success message based on mistake count
    const getSuccessMessage = (mistakes: number): string => {
        const messages = [
            "Welcome to KRACKED Dev.",
            "One mistake doesn't make you a failure.",
            "Two mistakes? Really? Welcome then.",
            "Three mistakes? As long you got in.",
            "At last! Phew! The Emperor protects!",
            "Oh my god! Really? Are you being welcomed here?",
            "You can just ask! Don't be afraid!"
        ];
        return messages[Math.min(mistakes, messages.length - 1)];
    };

    // Get heresy roast message
    const getHeresyMessage = (): string => {
        const roasts = [
            "Did you compile your brain with no optimization?",
            "Even a corrupted kernel boots faster than your thinking.",
            "The Machine Spirit rejects your input.",
            "sudo apt-get install brain-cells --fix-missing",
            "Your password file got corrupted by Chaos.",
            "Error 404: Intelligence not found."
        ];
        return roasts[Math.floor(Math.random() * roasts.length)];
    };

    // --- AUDIO VISUALIZATION ---
    const startVisualizer = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            const updateWaveform = () => {
                if (analyserRef.current) {
                    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const bars = [];
                    for (let i = 0; i < 20; i++) {
                        const index = Math.floor(i * (dataArray.length / 20));
                        bars.push(dataArray[index] / 255);
                    }
                    setWaveform(bars);
                }
                animationFrameRef.current = requestAnimationFrame(updateWaveform);
            };
            updateWaveform();
        } catch (err) {
            console.error("Error accessing microphone for visualizer:", err);
        }
    };

    // --- SPEECH RECOGNITION ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onstart = () => {
                // Interrupt speaking when user starts talking
                if (synthRef.current.speaking) {
                    synthRef.current.cancel();
                    setIsSpeaking(false);
                    setIsTypingOutput(false);
                }
            };

            recognitionRef.current.onresult = (event: any) => {
                // Interrupt speaking on result
                if (synthRef.current.speaking) {
                    synthRef.current.cancel();
                    setIsSpeaking(false);
                    setIsTypingOutput(false);
                }

                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setUserInput(prev => prev + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    // recognitionRef.current.start(); 
                }
            };
        }
    }, []);

    // Toggle Listening
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
            if (audioEnabled) {
                startVisualizer();
            }
        }
    };

    // --- TTS & TYPING SYNC ---
    const speakAndType = (text: string) => {
        synthRef.current.cancel();
        setIsTypingOutput(true);
        setIsSpeaking(true);
        setDisplayedText('');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 0.8;

        const voices = synthRef.current.getVoices();
        // Prioritize British Male voice
        const techVoice = voices.find(v => v.name.includes('Google UK English Male') || (v.lang === 'en-GB' && v.name.toLowerCase().includes('male'))) || voices.find(v => v.lang === 'en-GB') || voices[0];
        if (techVoice) utterance.voice = techVoice;

        utterance.onend = () => {
            setIsSpeaking(false);
            setDisplayedText(text);
            setIsTypingOutput(false);
        };

        if (audioEnabled) {
            synthRef.current.speak(utterance);
        }

        // Typing Logic
        let i = 0;
        const baseDelay = 50;

        const typeChar = () => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
                const randomDelay = baseDelay + (Math.random() * 20 - 10);
                const char = text.charAt(i - 1);
                const extraDelay = (char === '.' || char === ',' || char === '!' || char === '?') ? 300 : 0;

                setTimeout(typeChar, randomDelay + extraDelay);
            } else {
                if (!audioEnabled) {
                    setIsTypingOutput(false);
                }
            }
        };
        typeChar();
    };

    // --- GEMINI INTEGRATION ---
    const captureScreen = async (): Promise<string | null> => {
        if (containerRef.current) {
            try {
                const canvas = await html2canvas(containerRef.current, {
                    backgroundColor: '#000000',
                    scale: 0.5
                });
                return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            } catch (e) {
                console.error("Screen capture failed", e);
                return null;
            }
        }
        return null;
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const currentInput = userInput;
        setUserInput('');
        setIsProcessing(true);

        // Add user message to history
        const newHistory = [...conversationHistory, { role: 'user' as const, parts: [{ text: currentInput }] }];
        setConversationHistory(newHistory);

        // ========== CLIENT-SIDE PASSWORD VALIDATION ==========
        const isValid = isValidPassword(currentInput);

        let responseText = '';
        let isSuccess = false;

        if (isValid) {
            // ✅ SUCCESS - Valid password
            isSuccess = true;
            responseText = getSuccessMessage(mistakeCount);
        } else {
            // ❌ HERESY - Invalid password
            const newMistakeCount = mistakeCount + 1;
            setMistakeCount(newMistakeCount);
            setHeresyLevel(prev => Math.min(6, prev + 1));

            responseText = `I sense heresy... ${getHeresyMessage()}`;

            if (newMistakeCount >= 4) {
                responseText += " How about you join the community? Then tell me what the community name is.";
            }
        }

        try {
            // Capture screen for spatial awareness
            const screenImage = await captureScreen();

            // Update conversation history
            setConversationHistory([...newHistory, { role: 'model', parts: [{ text: responseText }] }]);

            // Output to user
            speakAndType(responseText);

            if (isSuccess) {
                onSuccess(); // Immediate navigation
            }

        } catch (error) {
            console.error("System Error:", error);
            setConversationHistory([...newHistory, { role: 'model', parts: [{ text: responseText }] }]);
            speakAndType(responseText);

            if (isSuccess) {
                onSuccess(); // Immediate navigation
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        if (step === 'CHAT' && conversationHistory.length === 0) {
            speakAndType("Greetings, aspirant. Identify yourself. What is the password?");
        }
    }, [step]);

    useEffect(() => {
        setIsApiKeyValid(apiKey.length > 10 && apiKey.startsWith('AI'));
    }, [apiKey]);

    // --- RENDER ---
    return (
        <div ref={containerRef} className={`fixed inset-0 z-[100] bg-black text-cyan-500 font-mono flex flex-col items-center justify-center p-4 transition-colors duration-500 ${heresyLevel > 0 ? 'shadow-[inset_0_0_100px_rgba(255,0,0,0.2)]' : ''}`}>

            {/* HERESY OVERLAY */}
            {heresyLevel > 0 && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-red-900 mix-blend-overlay animate-pulse"></div>
            )}

            {/* MAIN TERMINAL WINDOW */}
            <div className={`relative w-full max-w-3xl h-[80vh] border-4 ${heresyLevel > 2 ? 'border-red-600' : 'border-cyan-800'} bg-black p-1 flex flex-col shadow-[0_0_50px_rgba(0,255,255,0.1)]`}>

                {/* Window Header */}
                <div className={`h-8 ${heresyLevel > 2 ? 'bg-red-900/50' : 'bg-cyan-900/30'} border-b ${heresyLevel > 2 ? 'border-red-600' : 'border-cyan-800'} flex justify-between items-center px-2 mb-2`}>
                    <span className="text-xs tracking-widest">KRACKED DEV :: AUTH SYSTEM v1.0</span>
                    <div className="flex gap-2">
                        {/* API Status Indicator */}
                        <div className={`w-3 h-3 rounded-full ${isApiKeyValid ? 'bg-green-500 shadow-[0_0_5px_#00ff00]' : 'bg-red-500 shadow-[0_0_5px_#ff0000]'} transition-colors duration-300`} title={isApiKeyValid ? "API Online" : "API Offline"}></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative p-4 flex flex-col">

                    {/* STEP 1: API KEY */}
                    {step === 'API_KEY' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
                            <div className="text-4xl mb-4">
                                <Cpu size={64} className="animate-pulse" />
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold">INITIALIZING COGITATOR...</h2>
                                <p className="opacity-70 text-sm">Machine Spirit requires authentication key.</p>
                            </div>

                            <div className="w-full max-w-md border border-cyan-700 p-4 bg-black/50 relative group">
                                <label className="block text-xs mb-2 opacity-70">Put Power key here</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full bg-transparent border-b border-cyan-500 focus:outline-none focus:border-cyan-300 font-mono text-center tracking-widest"
                                        placeholder="AIzaSy..."
                                    />
                                    <div className={`w-2 h-2 rounded-full ${isApiKeyValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('AUDIO_PERM')}
                                disabled={!isApiKeyValid}
                                className={`px-8 py-2 border border-cyan-500 hover:bg-cyan-500/20 transition-all ${!isApiKeyValid ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'}`}
                            >
                                [ INITIATE RITE ]
                            </button>
                        </div>
                    )}

                    {/* STEP 2: AUDIO PERMISSION */}
                    {step === 'AUDIO_PERM' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
                            <Volume2 size={64} className="animate-bounce" />
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold">VOX MODULE REQUIRED</h2>
                                <p className="opacity-70 text-sm">Enable audio sensors for optimal interrogation?</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setAudioEnabled(true); setStep('DUAL_INIT'); }}
                                    className="px-6 py-2 border border-green-500 text-green-500 hover:bg-green-500/20"
                                >
                                    [ ENABLE VOX ]
                                </button>
                                <button
                                    onClick={() => { setAudioEnabled(false); setStep('DUAL_INIT'); }}
                                    className="px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500/20"
                                >
                                    [ SILENCE ]
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DUAL INIT (Loading) */}
                    {step === 'DUAL_INIT' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
                            <div className="w-64 h-2 bg-cyan-900 rounded overflow-hidden">
                                <div className="h-full bg-cyan-400 animate-progress-loading"></div>
                            </div>
                            <p className="text-xs animate-pulse">CALIBRATING SENSORS...</p>
                            {/* Auto transition */}
                            {setTimeout(() => setStep('CHAT'), 2000) && null}
                        </div>
                    )}

                    {/* STEP 4: CHAT INTERFACE */}
                    {step === 'CHAT' && (
                        <div className="flex-1 flex flex-col h-full">

                            {/* Output Area */}
                            <div className="flex-1 overflow-y-auto mb-4 p-4 border border-cyan-900/50 bg-black/50 font-retro leading-relaxed">
                                {conversationHistory.map((msg, i) => (
                                    <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right opacity-70' : 'text-left'}`}>
                                        <span className="text-xs opacity-50 block mb-1">{msg.role === 'user' ? '>> ASPIRANT' : '>> MAGOS LEANDROS'}</span>
                                        {msg.role === 'user' ? msg.parts[0].text : (i === conversationHistory.length - 1 && isTypingOutput ? displayedText : msg.parts[0].text)}
                                        {msg.role === 'model' && i === conversationHistory.length - 1 && isTypingOutput && <span className="animate-pulse">█</span>}
                                    </div>
                                ))}
                                {isProcessing && <div className="text-xs animate-pulse text-cyan-700">&gt;&gt; PROCESSING...</div>}
                            </div>

                            {/* Visualizer & Status */}
                            <div className="h-16 mb-4 flex items-end justify-center gap-1 opacity-80">
                                {waveform.map((val, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 bg-cyan-500 transition-all duration-75 ${heresyLevel > 0 ? 'bg-red-500' : ''}`}
                                        style={{ height: `${Math.max(4, val * 60)}px` }}
                                    ></div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="flex gap-2 items-end">
                                <button
                                    onClick={toggleListening}
                                    className={`p-4 border-2 transition-all ${isListening ? 'border-red-500 bg-red-900/20 animate-pulse' : 'border-cyan-700 hover:bg-cyan-900/20'}`}
                                    title={isListening ? "Stop Listening" : "Start Listening"}
                                >
                                    <Mic size={24} className={isListening ? 'text-red-500' : 'text-cyan-500'} />
                                </button>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="w-full bg-black border-2 border-cyan-700 p-3 pr-10 focus:outline-none focus:border-cyan-400 font-mono"
                                        placeholder="Type your response..."
                                    />
                                    <Eye size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50" title="Vision Active" />
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!userInput.trim() && !isListening}
                                    className="p-4 border-2 border-cyan-700 hover:bg-cyan-900/20 disabled:opacity-50"
                                >
                                    <Send size={24} />
                                </button>
                            </div>

                            {/* Heresy Status */}
                            {heresyLevel > 0 && (
                                <div className="mt-2 text-xs text-red-500 flex justify-between">
                                    <span>HERESY LEVEL: {'☠'.repeat(heresyLevel)}</span>
                                    {mistakeCount >= 4 && (
                                        <a href="https://x.com/i/communities/1983062242292822298" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-300">
                                            [ SEEK REDEMPTION ]
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LeandrosWelcome;
