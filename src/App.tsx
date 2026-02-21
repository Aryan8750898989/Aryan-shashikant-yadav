/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Camera as CameraIcon, 
  Volume2, 
  Info, 
  Sun,
  Moon
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  generateAIResponse, 
  identifyObject, 
  generateSpeech,
  ChatMessage, 
  TOP_QUESTIONS 
} from './services/geminiService';
import { RobotAvatar } from './components/RobotAvatar';
import { CameraModal } from './components/CameraModal';
import { Logo } from './components/Logo';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isAutoRead, setIsAutoRead] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [apiQuotaExceeded, setApiQuotaExceeded] = useState(false);
  const [ttsQuotaExceeded, setTtsQuotaExceeded] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('hiltaxion-theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hiltaxion-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await generateAIResponse(text, messages);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Trigger greeting animation if response looks like a greeting
      const lowerResponse = response.toLowerCase();
      if (lowerResponse.includes("hello") || lowerResponse.includes("hi") || lowerResponse.includes("hey") || lowerResponse.includes("greetings")) {
        setIsGreeting(true);
        setTimeout(() => setIsGreeting(false), 3000);
      }
      
      if (isAutoRead) {
        handleTTS(response);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === "QUOTA_EXCEEDED") {
        setApiQuotaExceeded(true);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: "⚠️ **Quota Exceeded**: I've reached my limit for now. Please try again in a few minutes or check your Gemini API quota.",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
        setTimeout(() => setApiQuotaExceeded(false), 10000);
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: "⚠️ **Connection Error**: I'm having trouble connecting to my brain right now. Please check your internet or try again in a moment.",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleTTS = async (text: string) => {
    setIsSpeaking(true);
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.play().catch(err => {
          console.warn("Audio playback failed, falling back to browser TTS:", err);
          setIsSpeaking(false);
          handleBrowserFallback(text);
        });
      } else {
        // If generateSpeech returns null (non-quota error), use fallback
        handleBrowserFallback(text);
      }
    } catch (error: any) {
      if (error.message === "QUOTA_EXCEEDED") {
        setTtsQuotaExceeded(true);
        setTimeout(() => setTtsQuotaExceeded(false), 5000);
      } else {
        console.error("TTS Error:", error);
      }
      // Always fallback to browser TTS on any Gemini TTS error
      handleBrowserFallback(text);
    }
  };

  const handleBrowserFallback = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    // Prefer "Google US English" or similar if available, otherwise default
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.pitch = 1.1; // Slightly higher for robot feel
    utterance.rate = 1.0;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleCapture = async (base64: string) => {
    setShowCamera(false);
    setIsThinking(true);
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: "I've captured an image. Can you identify it?",
      timestamp: Date.now(),
      type: 'image',
      imageUrl: `data:image/jpeg;base64,${base64}`
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await identifyObject(base64);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
      if (isAutoRead) {
        handleTTS(response);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === "QUOTA_EXCEEDED") {
        setApiQuotaExceeded(true);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: "⚠️ **Quota Exceeded**: I couldn't process the image because the API quota has been reached.",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
        setTimeout(() => setApiQuotaExceeded(false), 10000);
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: "⚠️ **Image Error**: I couldn't process that image. Please try capturing it again.",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className={`flex flex-col h-screen max-w-4xl mx-auto border-x shadow-2xl overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
    }`}>
      {/* Header */}
      <header className={`p-6 border-b flex items-center justify-between backdrop-blur-md sticky top-0 z-40 transition-colors ${
        isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/80 border-zinc-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-zinc-200">
            <Logo className="w-9 h-9" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Hiltaxion Ai</h1>
            <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>AI Assistant</p>
          </div>
        </div>
        <nav className="flex gap-2 items-center">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'}`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsAutoRead(!isAutoRead)}
            className={`p-2 rounded-lg transition-all ${isAutoRead ? (isDarkMode ? 'text-violet-400 bg-violet-500/10' : 'text-violet-600 bg-violet-500/10') : 'text-zinc-500 hover:bg-zinc-800'}`}
            title={isAutoRead ? "Auto-read On" : "Auto-read Off"}
          >
            <Volume2 size={20} className={isAutoRead ? "animate-pulse" : ""} />
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8" ref={scrollRef}>
        <AnimatePresence>
          {(apiQuotaExceeded || ttsQuotaExceeded) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2"
            >
              <Info size={14} />
              {apiQuotaExceeded ? "Gemini API Quota Exceeded. Please wait." : "TTS Quota Exceeded. Using browser fallback."}
            </motion.div>
          )}
        </AnimatePresence>
        
        {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <RobotAvatar isThinking={isThinking} isSpeaking={isSpeaking} isGreeting={isGreeting} />
                <div className="space-y-2">
                  <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Hello, I'm Hiltaxion Ai</h2>
                  <p className={`${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} max-w-xs`}>Your friendly robot assistant. How can I help you today?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                  {TOP_QUESTIONS.slice(0, 6).map((q, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(q)}
                      className={`text-left p-4 rounded-xl border transition-all text-sm group ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-800 text-zinc-300' 
                          : 'bg-white border-zinc-200 hover:border-violet-500/50 hover:bg-zinc-50 text-zinc-700 shadow-sm'
                      }`}
                    >
                      <span className="text-violet-500 mr-2 opacity-50 group-hover:opacity-100">✦</span>
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-none' 
                      : (isDarkMode 
                          ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none' 
                          : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-none')
                  }`}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Captured" className="rounded-lg mb-3 w-full max-h-64 object-cover" />
                    )}
                    <div className={`markdown-body ${isDarkMode ? 'dark' : ''}`}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                    <div className="flex items-center justify-between mt-2 opacity-50 text-[10px] uppercase tracking-wider">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.role === 'assistant' && (
                        <button onClick={() => handleTTS(msg.content)} className={`transition-colors ${isDarkMode ? 'hover:text-violet-400' : 'hover:text-violet-600'}`}>
                          <Volume2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className={`border rounded-2xl rounded-tl-none p-4 flex items-center gap-3 ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                  }`}>
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                    </div>
                    <span className={`text-xs font-medium uppercase tracking-widest ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Hiltaxion Ai is thinking...</span>
                  </div>
                </div>
              )}
            </div>
      </main>

      {/* Input Area */}
      <footer className={`p-6 border-t backdrop-blur-md transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-zinc-950/80' : 'border-zinc-200 bg-white/80'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCamera(true)}
            className={`p-3 rounded-xl transition-all ${
              isDarkMode ? 'text-zinc-400 hover:text-violet-400 hover:bg-zinc-900' : 'text-zinc-500 hover:text-violet-600 hover:bg-zinc-100'
            }`}
          >
            <CameraIcon size={24} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask Hiltaxion Ai anything..."}
              className={`w-full border rounded-2xl px-5 py-4 focus:outline-none focus:border-violet-500 transition-all pr-12 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}
            />
            <button 
              onClick={() => handleSend()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors ${
                isDarkMode ? 'text-violet-500 hover:text-violet-400' : 'text-violet-600 hover:text-violet-700'
              }`}
            >
              <Send size={20} />
            </button>
          </div>

          <button 
            onClick={toggleListening}
            className={`p-4 rounded-2xl transition-all shadow-lg ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-violet-600 text-white hover:scale-105 shadow-violet-500/20'
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>
      </footer>

      {showCamera && <CameraModal onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
    </div>
  );
}
