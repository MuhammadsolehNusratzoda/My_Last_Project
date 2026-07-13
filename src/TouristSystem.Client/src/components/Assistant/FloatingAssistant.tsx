import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../app/store';
import { useTranslation } from '../../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Trash2, Copy, Check, Mic, Bot, Sparkles, User, Volume2, VolumeX, Settings
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const localDict = {
  en: {
    title: 'AI Travel Assistant',
    subtitle: 'TravelBot • Online',
    placeholder: 'Ask me anything...',
    clearChat: 'Clear conversation',
    copied: 'Copied!',
    voiceNotSupported: 'Speech recognition is not supported in this browser.',
    voiceListening: 'Listening... Speak now!',
    aiGreeting: 'Hello! I am your AI Travel Assistant. How can I help you explore Tajikistan today?',
    suggestedTitle: 'Suggested Questions',
    ttsOn: 'Text-to-speech enabled',
    ttsOff: 'Text-to-speech disabled',
    settingsTitle: 'Voice Settings',
    voiceSelectLabel: 'Select Voice:',
    pitchLabel: 'Pitch (Tone):',
    speedLabel: 'Speed:',
    noTajikVoiceWarning: '[!] Tajik TTS voice is not installed on your system. A fallback voice will be used.',
    prompts: [
      'What are the best places in Dushanbe?',
      'Find me a hotel under $100',
      'Recommend restaurants near Iskanderkul',
      'Plan a 4-day trip in Tajikistan'
    ]
  },
  ru: {
    title: 'ИИ Помощник по Путешествиям',
    subtitle: 'TravelBot • В сети',
    placeholder: 'Спросите меня о чем угодно...',
    clearChat: 'Очистить историю',
    copied: 'Скопировано!',
    voiceNotSupported: 'Распознавание речи не поддерживается в этом браузере.',
    voiceListening: 'Слушаю... Говорите!',
    aiGreeting: 'Привет! Я ваш ИИ-помощник по путешествиям. Как я могу помочь вам спланировать поездку по Таджикистану?',
    suggestedTitle: 'Рекомендуемые вопросы',
    ttsOn: 'Озвучивание включено',
    ttsOff: 'Озвучивание выключено',
    settingsTitle: 'Настройки голоса',
    voiceSelectLabel: 'Выберите голос:',
    pitchLabel: 'Высота (Тон):',
    speedLabel: 'Скорость:',
    noTajikVoiceWarning: '[!] Таджикский голос не установлен в вашей ОС. Будет использован резервный голос.',
    prompts: [
      'Что посмотреть в Душанбе?',
      'Найди отель дешевле $100',
      'Рестораны рядом с Искандеркулем',
      'Составь план поездки на 4 дня'
    ]
  },
  tj: {
    title: 'Ёвари сайёҳии зеҳни сунъӣ',
    subtitle: 'TravelBot • Дар хат',
    placeholder: 'Аз ман дилхоҳ чизро пурсед...',
    clearChat: 'Тоза кардани сӯҳбат',
    copied: 'Нусхабардорӣ шуд!',
    voiceNotSupported: 'Шинохти овоз дар ин браузер дастгирӣ намешавад.',
    voiceListening: 'Дар ҳоли шунидан... Гӯед!',
    aiGreeting: 'Салом! Ман ёвари сайёҳии зеҳни сунъии шумо ҳастам. Имрӯз ба шумо барои омӯхтани Тоҷикистон чӣ кӯмак карда метавонам?',
    suggestedTitle: 'Саволҳои тавсияшаванда',
    ttsOn: 'Овоздиҳӣ фаъол аст',
    ttsOff: 'Овоздиҳӣ хомӯш аст',
    settingsTitle: 'Танзимоти овоз',
    voiceSelectLabel: 'Интихоби овоз:',
    pitchLabel: 'Баландии овоз (Тон):',
    speedLabel: 'Суръат:',
    noTajikVoiceWarning: '[!] Овози тоҷикӣ дар системаи шумо насб нашудааст. Овози алтернативӣ истифода мешавад.',
    prompts: [
      'Ҷойҳои беҳтарин дар Душанбе кадомҳоянд?',
      'Меҳмонхонаи арзонтар аз $100 пайдо кун',
      'Ресторанҳо дар наздикии Искандаркӯл',
      'Нақшаи сафар барои 4 рӯз соз'
    ]
  }
};

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useTranslation();
  const currentLang = (lang === 'ru' || lang === 'tj') ? lang : 'en';
  const labels = localDict[currentLang];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Voice & TTS Settings States
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [pitch, setPitch] = useState<number>(1.15); // default young female pitch (20-25 years old)
  const [rate, setRate] = useState<number>(1.0);     // default speed
  const [settingsOpen, setSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load voices from SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Pre-select best female voice based on current language
  useEffect(() => {
    if (voices.length === 0) return;

    let defaultVoice = null;
    if (lang === 'ru') {
      defaultVoice = voices.find(v => 
        v.lang.startsWith('ru') && 
        (v.name.toLowerCase().includes('irina') || 
         v.name.toLowerCase().includes('elena') || 
         v.name.toLowerCase().includes('ekaterina') || 
         v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('google русский'))
      );
    } else if (lang === 'tj') {
      defaultVoice = voices.find(v => v.lang.startsWith('tg') || v.lang.startsWith('tg-TG'));
    } else {
      defaultVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('zira') || 
         v.name.toLowerCase().includes('samantha') || 
         v.name.toLowerCase().includes('hazel') || 
         v.name.toLowerCase().includes('susan') || 
         v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('google us english') || 
         v.name.toLowerCase().includes('natural'))
      );
    }

    // Generic fallback if language female voice is not found
    if (!defaultVoice) {
      defaultVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('zira') || 
        v.name.toLowerCase().includes('samantha') || 
        v.name.toLowerCase().includes('irina') ||
        v.name.toLowerCase().includes('elena')
      );
    }

    if (defaultVoice) {
      setSelectedVoiceName(defaultVoice.name);
    } else if (voices.length > 0) {
      setSelectedVoiceName(voices[0].name);
    }
  }, [voices, lang]);

  // Global trigger for voice commands from landing page search
  useEffect(() => {
    const handleOpenVoice = () => {
      setIsOpen(true);
      setTimeout(() => {
        handleMicrophoneClick();
      }, 400);
    };
    window.addEventListener('open-ai-assistant-voice', handleOpenVoice);
    return () => window.removeEventListener('open-ai-assistant-voice', handleOpenVoice);
  }, [voices, lang]);

  // Initialize greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: labels.aiGreeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [currentLang, messages.length]);


  // Autoscroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClearConversation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMessages([
      {
        role: 'assistant',
        content: labels.aiGreeting,
        timestamp: new Date()
      }
    ]);
    setConversationId(null);
    setIsLoading(false);
  };

  // Text-To-Speech function using selected voice settings
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop current speech

    // Clean markdown formatting for clean TTS narration
    const cleanText = text
      .replace(/[\*\#\-\•\_]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'tj' ? 'tg-TG' : lang === 'ru' ? 'ru-RU' : 'en-US';

    // Set voice from dropdown selection
    if (selectedVoiceName) {
      const voice = voices.find(v => v.name === selectedVoiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.pitch = pitch;
    utterance.rate = rate;

    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeakEnabled = () => {
    const newState = !speakEnabled;
    setSpeakEnabled(newState);
    if (!newState && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessageText = textToSend.trim();
    setInputValue('');
    setIsLoading(true);

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessageText,
      timestamp: new Date()
    };

    const newAssistantPlaceholder: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage, newAssistantPlaceholder]);

    // Create history structure for backend
    const apiHistory = messages
      .filter(m => m.content !== labels.aiGreeting)
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));

    let completeResponse = '';

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('http://localhost:5010/api/assistant/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMessageText,
          language: lang,
          conversationId: conversationId || undefined,
          userId: user?.id || undefined,
          history: apiHistory
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the assistant server.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6).trim();
              const contentChunk = JSON.parse(jsonStr);
              if (typeof contentChunk === 'string') {
                completeResponse += contentChunk;
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + contentChunk
                    };
                  }
                  return updated;
                });
              }
            } catch (err) {
              console.error('Failed to parse SSE chunk:', err);
            }
          }
        }
      }

      // Read aloud automatically if speaking is enabled
      if (speakEnabled && completeResponse) {
        speakText(completeResponse);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error('Error in chat streaming:', err);
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          updated[updated.length - 1] = {
            ...last,
            content: '[!] Sorry, an error occurred while streaming response. Please try again.'
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMicrophoneClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(labels.voiceNotSupported);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'tj' ? 'tg-TG' : lang === 'ru' ? 'ru-RU' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Mute bot speaking when user talks
      }
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      if (speechToText && speechToText.trim()) {
        handleSendMessage(speechToText); // Automatically send message
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Check if a Tajik TTS voice is available on this system
  const hasTajikVoice = voices.some(v => v.lang.startsWith('tg') || v.lang.startsWith('tg-TG'));

  // Basic Markdown parser for formatting message strings
  const renderFormattedContent = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // 1. Headers
      if (line.startsWith('### ')) {
        return <h4 key={lineIdx} className="text-sm font-bold text-sky-400 mt-2 mb-1">{parseInlineMarkdown(line.substring(4))}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={lineIdx} className="text-md font-bold text-blue-400 mt-3 mb-1">{parseInlineMarkdown(line.substring(3))}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={lineIdx} className="text-lg font-bold text-white mt-4 mb-2">{parseInlineMarkdown(line.substring(2))}</h2>;
      }

      // 2. Bullet list
      if (line.startsWith('• ') || line.startsWith('  • ') || line.startsWith('* ') || line.startsWith('  * ') || line.startsWith('- ') || line.startsWith('  - ')) {
        const cleanLine = line.replace(/^(\s*[•\*\-]\s*)/, '');
        return (
          <ul key={lineIdx} className="list-disc list-inside ml-3 my-0.5 text-slate-350 text-[13px]">
            <li>{parseInlineMarkdown(cleanLine)}</li>
          </ul>
        );
      }

      // 3. Numbered list
      const numListMatch = line.match(/^(\s*\d+\.\s*)(.*)/);
      if (numListMatch) {
        return (
          <ol key={lineIdx} className="list-decimal list-inside ml-3 my-0.5 text-slate-350 text-[13px]">
            <li>{parseInlineMarkdown(numListMatch[2])}</li>
          </ol>
        );
      }

      // 4. Paragraph
      if (line.trim() === '') {
        return <div key={lineIdx} className="h-1.5" />;
      }

      return <p key={lineIdx} className="text-[13px] text-slate-200 leading-relaxed my-0.5">{parseInlineMarkdown(line)}</p>;
    });
  };

  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-sky-355">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="relative">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none border border-white/10"
        title={labels.title}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="h-6 w-6 text-white" />
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-950 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-0 right-0 w-full h-full sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[580px] z-50 sm:rounded-[28px] overflow-hidden flex flex-col bg-slate-950/90 sm:bg-slate-950/85 sm:border border-slate-800/80 backdrop-blur-2xl shadow-2xl transform origin-bottom-right"
          >

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 p-4 border-b border-slate-800/50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center relative">
                  <Bot className="h-5 w-5 text-sky-400" />
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-sky-300 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white leading-tight">{labels.title}</h3>
                  <span className="text-[10px] text-sky-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-ping" />
                    {labels.subtitle}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {/* Speaker Toggle Icon */}
                <button
                  onClick={toggleSpeakEnabled}
                  className={`p-2 rounded-xl border-none bg-transparent transition-colors cursor-pointer ${
                    speakEnabled ? 'text-green-400 hover:text-green-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title={speakEnabled ? labels.ttsOn : labels.ttsOff}
                >
                  {speakEnabled ? <Volume2 className="h-4.5 w-4.5 animate-bounce" /> : <VolumeX className="h-4.5 w-4.5" />}
                </button>
                {/* Settings Panel Toggle */}
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={`p-2 rounded-xl border-none bg-transparent transition-colors cursor-pointer ${
                    settingsOpen ? 'text-blue-400 hover:text-blue-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title={labels.settingsTitle}
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={handleClearConversation}
                  className="p-2 hover:bg-slate-800/60 rounded-xl text-slate-400 hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent"
                  title={labels.clearChat}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-800/60 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Collapsible Settings Area */}
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-900/90 border-b border-slate-800/50 p-4 space-y-3 text-left overflow-hidden text-xs text-slate-350"
                >
                  <h4 className="font-bold text-white mb-2">{labels.settingsTitle}</h4>
                  
                  {/* Tajik voice warning */}
                  {lang === 'tj' && !hasTajikVoice && (
                    <p className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl">
                      {labels.noTajikVoiceWarning}
                    </p>
                  )}

                  {/* Voice Selector */}
                  <div className="space-y-1">
                    <label className="block text-slate-400">{labels.voiceSelectLabel}</label>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => setSelectedVoiceName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none"
                    >
                      {voices.map((voice, idx) => (
                        <option key={idx} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pitch and Speed sliders */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">{labels.pitchLabel} {pitch.toFixed(2)}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">{labels.speedLabel} {rate.toFixed(2)}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-sky-400" />
                    </div>
                  )}
                  
                  <div className="relative group">
                    <div
                      className={`p-3 rounded-2xl text-left ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-900/60 border border-slate-800/50 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'assistant' && msg.content === '' && isLoading ? (
                        <div className="flex items-center space-x-1 py-1 px-2">
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        renderFormattedContent(msg.content)
                      )}
                    </div>

                    {/* Copy and Play action triggers */}
                    {msg.role === 'assistant' && msg.content !== '' && (
                      <div className="absolute right-2 -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 z-10">
                        <button
                          onClick={() => speakText(msg.content)}
                          className="p-1 bg-slate-950 border border-slate-800 rounded-md text-slate-400 hover:text-white cursor-pointer bg-transparent"
                          title="Speak message"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleCopyMessage(msg.content, index)}
                          className="p-1 bg-slate-950 border border-slate-800 rounded-md text-slate-400 hover:text-white cursor-pointer bg-transparent"
                          title="Copy message"
                        >
                          {copiedId === index ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-sky-400" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts (Chips) */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">{labels.suggestedTitle}</span>
                <div className="flex flex-wrap gap-2">
                  {labels.prompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(p)}
                      className="text-xs bg-slate-900 hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/30 text-slate-350 hover:text-white px-3.5 py-1.5 rounded-full transition-all text-left cursor-pointer border-none"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-3 bg-slate-900/40 border-t border-slate-800/50 pb-6 sm:pb-3">

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center space-x-2"
              >
                <div className="flex-grow relative flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={labels.placeholder}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-full pl-4 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 transition-colors"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleMicrophoneClick}
                    className={`absolute right-3.5 p-1 rounded-full cursor-pointer hover:bg-slate-800 transition-colors bg-transparent border-none ${
                      isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'
                    }`}
                    title={isListening ? labels.voiceListening : 'Voice message (Click to speak)'}
                  >
                    <Mic className="h-4.5 w-4.5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-9.5 h-9.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 border-none"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
