
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Mic, MicOff, Globe, ArrowLeft, RefreshCw, StopCircle, Video, VideoOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { interactWithEnglishTutor } from '../services/geminiService';
import { ChatMessage } from '../types';

// Web Speech API Types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const EnglishTutor: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [nativeLanguage, setNativeLanguage] = useState('Spanish');
    const [error, setError] = useState('');
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    
    // Refs to track state inside event listeners and async callbacks
    const recognitionRef = useRef<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const messagesRef = useRef<ChatMessage[]>([]);
    const isListeningRef = useRef(false); // Valid source of truth for recognition status
    
    const synth = window.speechSynthesis;

    // Sync messages state to ref for access in callbacks
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // 1. Initialize Camera
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                if (cameraEnabled) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } else {
                    if (videoRef.current && videoRef.current.srcObject) {
                        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                        tracks.forEach(t => t.stop());
                        videoRef.current.srcObject = null;
                    }
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Camera access denied or unavailable.");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraEnabled]);

    // 2. Load Voices for TTS
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = synth.getVoices();
            setVoices(availableVoices);
        };
        
        loadVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
    }, [synth]);

    // 3. Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false; 
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                isListeningRef.current = true;
                setError('');
            };

            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                handleUserMessage(text);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech error", event.error);
                setIsListening(false);
                isListeningRef.current = false;

                if (event.error === 'not-allowed') {
                    setError("Microphone access denied. Please allow permissions.");
                } else if (event.error === 'no-speech') {
                    // Ignore no-speech errors, just reset state
                    setError(''); 
                } else if (event.error === 'network') {
                    setError("Network error. Please check your internet connection.");
                } else {
                    setError("Could not hear you. Please try again.");
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                isListeningRef.current = false;
            };

            recognitionRef.current = recognition;
        } else {
            setError("Your browser does not support speech recognition.");
        }

        // Initial Greeting
        const greeting = "Hi there! I'm your English tutor. What topic shall we practice today?";
        setMessages([{ id: 'init', role: 'model', text: greeting, timestamp: new Date() }]);
        
        // Slight delay to allow voices to load
        setTimeout(() => speak(greeting), 1000);

        return () => {
            if (recognitionRef.current) {
                // Try to abort cleanly
                try { recognitionRef.current.abort(); } catch(e) {}
            }
            synth.cancel();
        };
    }, []); 

    const speak = (text: string) => {
        if (synth.speaking) synth.cancel();
        
        // Remove emojis or markdown for cleaner speech
        const cleanText = text.replace(/[*#]/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 1.0; 
        utterance.pitch = 1.05; 
        
        const preferredVoice = 
            voices.find(v => v.name.includes('Google US English')) || 
            voices.find(v => v.name.includes('Zira')) || 
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0];

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synth.speak(utterance);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListeningRef.current) {
            recognitionRef.current.stop();
        } else {
            setError('');
            setTranscript('');
            synth.cancel(); // Stop speaking if interrupt
            setIsSpeaking(false);
            
            try {
                recognitionRef.current.start();
            } catch (e: any) {
                console.error("Start error:", e);
                // Handle 'already started' error gracefully
                if (e.message && e.message.includes('already started')) {
                    setIsListening(true);
                    isListeningRef.current = true;
                }
            }
        }
    };

    const handleUserMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            timestamp: new Date()
        };
        
        // Use ref to get latest history
        const updatedMessages = [...messagesRef.current, userMsg];
        setMessages(updatedMessages);

        // Get AI Response
        const response = await interactWithEnglishTutor(updatedMessages, text, nativeLanguage);
        
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: response,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMsg]);
        speak(response);
    };

    return (
        <Layout>
            <div className="h-[calc(100vh-8rem)] flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <Link to="/job-prep/communication" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft size={16} /> End Session
                    </Link>
                    <div className="flex items-center gap-4">
                         <button 
                            onClick={() => setCameraEnabled(!cameraEnabled)}
                            className={`p-2 rounded-full ${cameraEnabled ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-500'}`}
                            title={cameraEnabled ? "Turn Camera Off" : "Turn Camera On"}
                         >
                            {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                         </button>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                            <Globe size={14} className="text-brand-600" />
                            <select 
                                value={nativeLanguage}
                                onChange={(e) => setNativeLanguage(e.target.value)}
                                className="text-sm border-none bg-transparent font-medium text-gray-700 focus:outline-none cursor-pointer"
                            >
                                <option value="Spanish">Native: Spanish</option>
                                <option value="Hindi">Native: Hindi</option>
                                <option value="French">Native: French</option>
                                <option value="German">Native: German</option>
                                <option value="Chinese">Native: Chinese</option>
                                <option value="Arabic">Native: Arabic</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-xl border border-white/50 overflow-hidden relative flex flex-col backdrop-blur-sm">
                    
                    {/* Main Avatar Area */}
                    <div className="flex-1 flex flex-col items-center justify-center relative p-6">
                        
                        {/* Avatar Visuals */}
                        <div className="relative mb-8">
                            {/* Outer Glows */}
                            <div className={`absolute -inset-4 bg-blue-500/20 rounded-full blur-xl transition-all duration-500 ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
                            <div className={`absolute -inset-8 bg-purple-500/20 rounded-full blur-2xl transition-all duration-700 ${isSpeaking ? 'scale-125 opacity-80' : 'scale-90 opacity-30'}`}></div>

                            {/* Avatar Image */}
                            <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white z-10">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=${isSpeaking ? 'smile' : 'default'}&eyebrows=default`} 
                                    alt="AI Tutor" 
                                    className={`w-full h-full object-cover transition-transform duration-300 ${isSpeaking ? 'scale-105' : 'scale-100'}`} 
                                />
                            </div>

                            {/* Speaking Indicator Badge */}
                            <div className={`absolute bottom-2 right-2 z-20 bg-white rounded-full p-2 shadow-lg transition-all duration-300 ${isSpeaking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="flex gap-1">
                                    <span className="w-1 h-3 bg-brand-500 rounded-full animate-[bounce_1s_infinite]"></span>
                                    <span className="w-1 h-3 bg-brand-500 rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
                                    <span className="w-1 h-3 bg-brand-500 rounded-full animate-[bounce_1s_infinite_0.4s]"></span>
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="text-center h-12">
                            {isListening ? (
                                <p className="text-xl font-bold text-gray-800 animate-pulse flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    Listening...
                                </p>
                            ) : isSpeaking ? (
                                <p className="text-xl font-bold text-blue-600">AI is speaking...</p>
                            ) : (
                                <p className="text-gray-500 font-medium">Tap the mic to start speaking</p>
                            )}
                            {error && <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 px-3 py-1 rounded-full inline-block border border-red-100">{error}</p>}
                        </div>

                        {/* Last User Message (Subtitles) */}
                        {transcript && (
                            <div className="mt-4 px-6 py-3 bg-white/80 backdrop-blur rounded-2xl border border-white/50 shadow-sm max-w-lg text-center">
                                <p className="text-gray-700 font-medium">"{transcript}"</p>
                            </div>
                        )}
                    </div>

                    {/* Student Camera Feed (Picture-in-Picture) */}
                    <div className="absolute top-6 right-6 w-32 md:w-48 aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-30 transition-all hover:scale-105">
                         {cameraEnabled ? (
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover transform -scale-x-100" 
                            />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <VideoOff className="text-gray-500" />
                            </div>
                         )}
                         <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-md">
                            YOU
                         </div>
                    </div>

                    {/* Chat History Overlay (Bottom Left) */}
                    <div className="absolute bottom-28 left-6 w-80 max-h-64 overflow-y-auto space-y-3 pr-2 hidden md:block scrollbar-hide">
                         {[...messages].reverse().slice(0, 3).map((msg) => (
                             <div key={msg.id} className={`p-3 rounded-xl text-sm shadow-sm backdrop-blur-md border border-white/50 ${
                                 msg.role === 'user' ? 'bg-white/90 text-gray-800 ml-auto' : 'bg-blue-600/90 text-white'
                             }`}>
                                 {msg.text}
                             </div>
                         ))}
                    </div>

                    {/* Controls Bar */}
                    <div className="h-24 bg-white border-t border-gray-100 flex items-center justify-center gap-8 relative z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                         <button 
                            onClick={() => synth.cancel()} 
                            className="p-4 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Stop Speaking"
                        >
                            <StopCircle size={24} />
                         </button>

                         <button 
                            onClick={toggleListening}
                            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 border-4 border-white ${
                                isListening 
                                ? 'bg-red-500 text-white shadow-red-200 scale-110 ring-4 ring-red-100' 
                                : 'bg-brand-600 text-white shadow-brand-200 hover:bg-brand-700'
                            }`}
                        >
                            {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                        </button>

                         <button 
                             onClick={() => {
                                 const lastAiMsg = [...messages].reverse().find(m => m.role === 'model');
                                 if (lastAiMsg) speak(lastAiMsg.text);
                             }}
                             className="p-4 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                             title="Replay Last Message"
                         >
                            <RefreshCw size={24} />
                         </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
