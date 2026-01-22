
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Mic, MicOff, Globe, ArrowLeft, Video, VideoOff, Power, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGeminiClient } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';

// --- Helper Functions for Audio/Video Encoding & Decoding ---
function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  const uint8 = new Uint8Array(int16.buffer);
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const base64Data = btoa(binary);
  
  return {
    data: base64Data,
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const EnglishTutor: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [nativeLanguage, setNativeLanguage] = useState('Spanish');
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [error, setError] = useState('');
    const [audioLevel, setAudioLevel] = useState(0);

    // Refs for Media & Processing
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const videoIntervalRef = useRef<number | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    // Clean up on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    const connect = async () => {
        try {
            setError('');
            const ai = getGeminiClient();
            
            // 1. Initialize Audio Contexts
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) {
                setError("Your browser does not support Audio Context.");
                return;
            }
            const inputCtx = new AudioContext({ sampleRate: 16000 });
            const outputCtx = new AudioContext({ sampleRate: 24000 });
            audioContextRef.current = outputCtx;

            // 2. Establish Live Session
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, 
                    },
                    systemInstruction: `You are a friendly, patient, and professional English Tutor. 
                    The student's native language is ${nativeLanguage}. 
                    Correct their grammar gently. 
                    If you see video input, comment on what you see to make the conversation engaging.
                    Keep responses concise and conversational.`,
                },
                callbacks: {
                    onopen: async () => {
                        console.log("Session Opened");
                        setIsConnected(true);
                        
                        // Setup Audio Input Stream
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const source = inputCtx.createMediaStreamSource(stream);
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            
                            // Visualizer math
                            let sum = 0;
                            for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                            setAudioLevel(Math.sqrt(sum / inputData.length) * 100);

                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(processor);
                        processor.connect(inputCtx.destination);
                        
                        inputSourceRef.current = source;
                        processorRef.current = processor;

                        // Setup Video Input Loop
                        if (cameraEnabled) {
                           startVideoLoop(sessionPromise);
                        }
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            // Decode and Schedule Audio
                            const outputCtx = audioContextRef.current;
                            if (!outputCtx) return;

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                outputCtx,
                                24000,
                                1
                            );

                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (msg.serverContent?.interrupted) {
                            sourcesRef.current.forEach(source => source.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        console.log("Session Closed");
                        setIsConnected(false);
                    },
                    onerror: (err) => {
                        console.error("Session Error", err);
                        setError("Connection lost. Please reconnect.");
                        disconnect();
                    }
                }
            });

            sessionPromiseRef.current = sessionPromise;

        } catch (e: any) {
            console.error("Connection failed", e);
            setError("Failed to connect to AI service. Check permissions and internet.");
            setIsConnected(false);
        }
    };

    const startVideoLoop = (sessionPromise: Promise<any>) => {
        if (!videoRef.current) return;
        
        // Ensure video is playing
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        });

        const ctx = canvasRef.current.getContext('2d');
        const videoEl = videoRef.current;

        videoIntervalRef.current = window.setInterval(() => {
            if (videoEl.readyState === 4 && ctx) {
                canvasRef.current.width = videoEl.videoWidth / 2; // Downscale for bandwidth
                canvasRef.current.height = videoEl.videoHeight / 2;
                ctx.drawImage(videoEl, 0, 0, canvasRef.current.width, canvasRef.current.height);
                
                canvasRef.current.toBlob(async (blob) => {
                    if (blob) {
                        const base64Data = await blobToBase64(blob);
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: { data: base64Data, mimeType: 'image/jpeg' }
                            });
                        });
                    }
                }, 'image/jpeg', 0.6);
            }
        }, 1000); // Send frame every 1 second
    };

    const disconnect = () => {
        // Stop Audio
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (inputSourceRef.current) {
            inputSourceRef.current.disconnect();
            inputSourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        
        // Stop Video
        if (videoIntervalRef.current) {
            clearInterval(videoIntervalRef.current);
            videoIntervalRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }

        setIsConnected(false);
        sourcesRef.current.forEach(s => s.stop());
        sourcesRef.current.clear();
    };

    const toggleCamera = () => {
        setCameraEnabled(!cameraEnabled);
        if (cameraEnabled) {
            // Turning off
            if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                videoRef.current.srcObject = null;
            }
        } else {
            // Turning on (if already connected)
            if (isConnected && sessionPromiseRef.current) {
               startVideoLoop(sessionPromiseRef.current);
            }
        }
    };

    return (
        <Layout>
            <div className="h-[calc(100vh-8rem)] flex flex-col">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <Link to="/job-prep" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft size={16} /> Exit Session
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                            <Globe size={14} className="text-brand-600" />
                            <select 
                                value={nativeLanguage}
                                onChange={(e) => setNativeLanguage(e.target.value)}
                                disabled={isConnected}
                                className="text-sm border-none bg-transparent font-medium text-gray-700 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="Spanish">Spanish</option>
                                <option value="Hindi">Hindi</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Chinese">Chinese</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl shadow-xl border border-white/10 overflow-hidden relative flex flex-col items-center justify-center p-6 text-white">
                    
                    {/* Connection Status / Start Screen */}
                    {!isConnected && (
                        <div className="text-center space-y-8 z-20 max-w-md">
                             <div className="w-24 h-24 bg-brand-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.3)] animate-pulse">
                                <Mic size={40} className="text-white" />
                             </div>
                             <div>
                                 <h2 className="text-3xl font-bold mb-2">Ready to Speak?</h2>
                                 <p className="text-indigo-200">Connect to Gemini Live for a real-time conversation practice. I can hear and see you.</p>
                             </div>
                             
                             {error && (
                                <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm">
                                    {error}
                                </div>
                             )}

                             <button 
                                onClick={connect}
                                className="w-full py-4 bg-white text-brand-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Power size={20} />
                                Start Live Session
                            </button>
                        </div>
                    )}

                    {/* Active Session View */}
                    {isConnected && (
                        <div className="w-full h-full flex flex-col relative z-20">
                            
                            {/* Gemini Avatar / Visualizer */}
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-indigo-500/30 rounded-full blur-xl animate-pulse"></div>
                                    <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Kore&backgroundColor=b6e3f4`} 
                                        alt="AI Tutor" 
                                        className="w-48 h-48 rounded-full border-4 border-white/20 shadow-2xl relative z-10"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-green-500 border-4 border-slate-900 w-8 h-8 rounded-full z-20 flex items-center justify-center">
                                        <Activity size={16} className="text-white" />
                                    </div>
                                </div>
                                <div className="mt-8 text-center">
                                    <h3 className="text-2xl font-bold text-white">AI Tutor (Live)</h3>
                                    <p className="text-indigo-300 text-sm animate-pulse">Listening & Watching...</p>
                                </div>
                            </div>

                            {/* User Self View (PIP) */}
                            <div className="absolute top-0 right-0 w-32 md:w-48 aspect-[3/4] bg-black/50 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                                {cameraEnabled ? (
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className="w-full h-full object-cover transform -scale-x-100" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <VideoOff />
                                    </div>
                                )}
                                
                                {/* Audio Level Visualizer overlay */}
                                <div className="absolute bottom-2 left-2 flex gap-0.5 items-end h-4">
                                    {[1,2,3,4].map(i => (
                                        <div 
                                            key={i} 
                                            className="w-1 bg-green-500 rounded-full transition-all duration-75"
                                            style={{ height: `${Math.min(100, audioLevel * (i/2))}%` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="mt-auto pt-6 flex justify-center gap-4">
                                <button 
                                    onClick={toggleCamera}
                                    className={`p-4 rounded-full transition-all ${cameraEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}
                                >
                                    {cameraEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                                </button>
                                <button 
                                    onClick={disconnect}
                                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg shadow-red-900/20 transition-all flex items-center gap-2"
                                >
                                    <Power size={20} />
                                    End Session
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
