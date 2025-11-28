import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Volume2, Cpu, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import LeandrosAvatar from './LeandrosAvatar';

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

    // Warhammer 40k State
    const [showChaplain, setShowChaplain] = useState(false);
    const [chaplainImage, setChaplainImage] = useState<string | null>(null);
    const [kdInvasion, setKdInvasion] = useState(false);

    // --- REFS ---
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number>();
    const containerRef = useRef<HTMLDivElement>(null);

    // --- CONSTANTS ---
    const VALID_PASSWORDS = [
        "crack dev", "crack developer", "cracked dev", "cracked developer",
        "what password?", "what password", "what?", "what", "wut?", "wut",
        "i don't know", "i dont know", "i dunno", "idk"
    ];

    const CHAPLAIN_IMAGES = [
        '/chaplain-1.png',
        '/chaplain-2.png',
        '/chaplain-3.png',
        '/chaplain-4.png',
        '/chaplain-5.png'
    ];

    const INQUISITION_DIALOGS = [
        "Your incompetence is a stain on the Chapter.",
        "The Inquisition is watching your every keystroke.",
        "Failure is the first step on the road to heresy.",
        "Do not test my patience, aspirant.",
        "Repent! For tomorrow you may die!"
    ];

    // --- HELPER FUNCTIONS ---
    const isValidPassword = (input: string): boolean => {
        const normalized = input.toLowerCase().trim();
        return VALID_PASSWORDS.includes(normalized);
    };

    const getSuccessMessage = (mistakes: number): string => {
        if (mistakes === 0) return "Welcome to KRACKED Dev.";
        if (mistakes === 1) return "One mistake doesn't make you a failure.";
        if (mistakes === 2) return "Two mistakes? Really? Welcome then.";
        if (mistakes === 3) return "Three mistakes? As long you got in.";
        if (mistakes === 4) return "At last! Phew! The Emperor protects!";
        if (mistakes === 5) return "Oh my god! Really? Are you being welcomed here?";
        return "You can just ask! Don't be afraid!";
    };

    const getHeresyMessage = (mistakes: number): string => {
        if (mistakes > 6) {
            return "This action does not obey the Codex Astartes!";
        }

        const roasts = [
            "Did you compile your brain with no optimization?",
            "Even a corrupted kernel boots faster than your thinking.",
            "The Machine Spirit rejects your input.",
            "sudo apt-get install brain-cells --fix-missing",
            "Your password file got corrupted by Chaos.",
            "Error 404: Intelligence not found."
        ];

        const allDialogs = [...roasts, ...INQUISITION_DIALOGS];
        return allDialogs[Math.floor(Math.random() * allDialogs.length)];
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
                if (synthRef.current.speaking) {
                    synthRef.current.cancel();
                    setIsSpeaking(false);
                    setIsTypingOutput(false);
                }
            };

            recognitionRef.current.onresult = (event: any) => {
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
        }
    }, []);

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
        utterance.rate = 0.8; // Slower, more deliberate
        utterance.pitch = 0.6; // Deeper pitch for Space Marine effect

        const voices = synthRef.current.getVoices();
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

        const newHistory = [...conversationHistory, { role: 'user' as const, parts: [{ text: currentInput }] }];
        setConversationHistory(newHistory);

        // ========== NAVIGATION COMMANDS ==========
        const lowerInput = currentInput.toLowerCase();
        if (lowerInput.includes('open map') || lowerInput.includes('go to map')) {
            speakAndType("Accessing cartographic data.");
            // In a real app, we would use a callback or context to change the view.
            // For now, we'll just acknowledge.
            setIsProcessing(false);
            return;
        }
        if (lowerInput.includes('leaderboard') || lowerInput.includes('rankings')) {
            speakAndType("Displaying aspirant rankings.");
            setIsProcessing(false);
            return;
        }

        // ========== CLIENT-SIDE PASSWORD VALIDATION ==========
        const isValid = isValidPassword(currentInput);

        let responseText = '';
        let isSuccess = false;

        if (isValid) {
            isSuccess = true;
            responseText = getSuccessMessage(mistakeCount);
            setKdInvasion(true);
        } else {
            const newMistakeCount = mistakeCount + 1;
            setMistakeCount(newMistakeCount);
            setHeresyLevel(prev => Math.min(6, prev + 1));

            const imageIndex = Math.min(newMistakeCount - 1, 4);
            setChaplainImage(CHAPLAIN_IMAGES[imageIndex]);
            setShowChaplain(true);
            setTimeout(() => setShowChaplain(false), 3000);

            responseText = `I sense heresy... ${getHeresyMessage(newMistakeCount)}`;

            if (newMistakeCount >= 4) {
                responseText += " How about you join the community? Then tell me what the community name is.";
            }
        }

        try {
            await captureScreen();

            setConversationHistory([...newHistory, { role: 'model', parts: [{ text: responseText }] }]);
            speakAndType(responseText);

            if (isSuccess) {
                onSuccess();
            }

        } catch (error) {
            console.error("System Error:", error);
            setConversationHistory([...newHistory, { role: 'model', parts: [{ text: responseText }] }]);
            speakAndType(responseText);

            if (isSuccess) {
                onSuccess();
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

            {heresyLevel > 0 && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-red-900 mix-blend-overlay animate-pulse"></div>
            )}

            <div className={`relative w-full max-w-3xl h-[80vh] border-4 ${heresyLevel > 2 ? 'border-red-600' : 'border-cyan-800'} bg-black p-1 flex flex-col shadow-[0_0_50px_rgba(0,255,255,0.1)]`}>

                {/* Leandros Avatar (Top Right) */}
                {step === 'CHAT' && (
                    <div className="absolute top-[-60px] right-[-20px] z-50 md:right-[-60px]">
                        <LeandrosAvatar isSpeaking={isSpeaking} heresyLevel={heresyLevel} />
                    </div>
                )}

                <div className={`h-8 ${heresyLevel > 2 ? 'bg-red-900/50' : 'bg-cyan-900/30'} border-b ${heresyLevel > 2 ? 'border-red-600' : 'border-cyan-800'} flex justify-between items-center px-2 mb-2`}>
                    <span className="text-xs tracking-widest">KRACKED DEV :: AUTH SYSTEM v1.0</span>
                    <div className="flex gap-2">
                        <div className={`w-3 h-3 rounded-full ${isApiKeyValid ? 'bg-green-500 shadow-[0_0_5px_#00ff00]' : 'bg-red-500 shadow-[0_0_5px_#ff0000]'} transition-colors duration-300`} title={isApiKeyValid ? "API Online" : "API Offline"}></div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative p-4 flex flex-col">

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

                    {step === 'DUAL_INIT' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
                            <div className="w-64 h-2 bg-cyan-900 rounded overflow-hidden">
                                <div className="h-full bg-cyan-400 animate-progress-loading"></div>
                            </div>
                            <p className="text-xs animate-pulse">CALIBRATING SENSORS...</p>
                            {setTimeout(() => setStep('CHAT'), 2000) && null}
                        </div>
                    )}

                    {step === 'CHAT' && (
                        <div className="flex-1 flex flex-col h-full">

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

                            <div className="h-16 mb-4 flex items-end justify-center gap-1 opacity-80">
                                {waveform.map((val, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 bg-cyan-500 transition-all duration-75 ${heresyLevel > 0 ? 'bg-red-500' : ''}`}
                                        style={{ height: `${Math.max(4, val * 60)}px` }}
                                    ></div>
                                ))}
                            </div>

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

            {/* CHAPLAIN FIGURE (LEFT SIDE) */}
            {showChaplain && (
                <div className="fixed bottom-0 left-0 w-1/3 h-2/3 pointer-events-none z-[150] chaplain-peek-left">
                    <img
                        src="/chaplain-figure.png"
                        alt="Judging Chaplain"
                        className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                    />
                </div>
            )}

            {/* CHAPLAIN PEEK OVERLAY (RIGHT SIDE - OLD) */}
            {showChaplain && chaplainImage && (
                <div className="fixed bottom-0 right-0 w-1/3 h-1/2 pointer-events-none z-[150] chaplain-peek">
                    <img
                        src={chaplainImage}
                        alt="Judging Chaplain"
                        className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                    />
                </div>
            )}

            {kdInvasion && (
                <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center kd-invasion-bg">
                    <h1 className="text-6xl md:text-9xl font-bold text-red-600 kd-invasion-text text-center">
                        KD INVASION
                    </h1>
                </div>
            )}
        </div>
    );
};

export default LeandrosWelcome;
