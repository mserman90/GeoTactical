import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Asset, Sector, TelemetryEvent } from '../types';
import { queryTacticalAI } from '../services/aiService';
import { soundManager } from '../utils/audio';

interface TacticalAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  sectors: Sector[];
  events: TelemetryEvent[];
  regionName: string;
  onTriggerAction: (assetId: string, actionName: string) => void;
  onTriggerSectorIrrigation: (sectorId: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ares';
  text: string;
  timestamp: string;
  recommendedAction?: {
    type: 'irrigate' | 'rth' | 'ndvi' | 'inspect';
    targetId: string;
    description: string;
  };
}

export default function TacticalAiModal({
  isOpen,
  onClose,
  assets,
  sectors,
  events,
  regionName,
  onTriggerAction,
  onTriggerSectorIrrigation,
}: TacticalAiModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ares',
      text: `TACTICAL AI LINK ESTABLISHED. Callsign: ARES-AGRI. Ready to provide real-time autonomous fleet telemetry analysis and agronomic hazard diagnostics for ${regionName}.`,
      timestamp: new Date().toTimeString().substring(0, 8),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    soundManager.playClick();
    const now = new Date().toTimeString().substring(0, 8);
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await queryTacticalAI(prompt, {
        assets,
        sectors,
        events,
        regionName,
      });

      const aresMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ares',
        text: response.message,
        timestamp: new Date().toTimeString().substring(0, 8),
        recommendedAction: response.recommendedAction,
      };

      soundManager.playTargetAcquired();
      setMessages((prev) => [...prev, aresMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'ares',
          text: 'COMMUNICATION ERROR: Unable to process telemetry prompt.',
          timestamp: new Date().toTimeString().substring(0, 8),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = (action: NonNullable<Message['recommendedAction']>) => {
    soundManager.playAlert();
    if (action.type === 'irrigate') {
      onTriggerSectorIrrigation(action.targetId);
    } else if (action.type === 'rth') {
      onTriggerAction(action.targetId, 'RTH');
    }
  };

  const quickPrompts = [
    'Assess Critical Anomalies',
    'Evaluate Soil Moisture & Irrigation',
    'Fleet Deployment Status',
    'Weather Front Impact',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-[620px] bg-[#080d12] border border-[#00ff88]/50 rounded-[2px] shadow-[0_0_30px_rgba(0,255,136,0.3)] flex flex-col h-[520px] font-mono overflow-hidden">
        {/* Header */}
        <div className="h-10 px-3 bg-[#0a141b] border-b border-[#00ff88]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[2px] bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-[#00ff88]" />
            </div>
            <div>
              <span className="text-[#00ff88] font-black text-[11px] tracking-widest">
                ARES-AGRI // TACTICAL AI COPILOT
              </span>
              <span className="text-[#00e5ff] text-[8.5px] ml-2 hidden sm:inline font-bold">
                ● FREE & KEYLESS AUTONOMOUS INTELLIGENCE
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="text-[#777] hover:text-[#ff0033] p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-2 bg-[#060a0e] border-b border-[#14232c] flex items-center gap-1.5 overflow-x-auto text-[8.5px]">
          <Sparkles className="w-3 h-3 text-[#00e5ff] shrink-0" />
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-2 py-1 bg-[#0c161d] hover:bg-[#00ff88]/15 border border-[#1b313e] hover:border-[#00ff88]/40 text-[#aaa] hover:text-[#00ff88] rounded-[2px] whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-[10px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-[2px] border ${
                m.sender === 'user'
                  ? 'bg-[#0f151c] border-[#1e2e3a] ml-8 text-right'
                  : 'bg-[#061210] border-[#00ff88]/30 mr-8 text-left text-[#b8f5d0]'
              }`}
            >
              <div className="flex items-center justify-between text-[8px] text-[#667] mb-1 font-bold">
                <span>{m.sender === 'user' ? 'OPERATOR CONSOLE' : 'ARES-AGRI SYSTEM'}</span>
                <span>{m.timestamp}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

              {/* Action Recommendation Card */}
              {m.recommendedAction && (
                <div className="mt-2.5 p-2 bg-[#0d2218] border border-[#00ff88]/50 rounded-[2px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[9px] text-[#00ff88]">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#ff8800] shrink-0" />
                    <span>{m.recommendedAction.description}</span>
                  </div>
                  <button
                    onClick={() => handleExecuteAction(m.recommendedAction!)}
                    className="px-2 py-1 bg-[#00ff88] text-black font-black text-[9px] rounded-[2px] hover:bg-[#00ff88]/90 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>EXECUTE</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="p-2 bg-[#061210] border border-[#00ff88]/30 rounded-[2px] text-[9.5px] text-[#00ff88] flex items-center gap-2 animate-pulse mr-8">
              <Bot className="w-3.5 h-3.5" />
              <span>Analyzing live telemetry array through neural tactical model...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Terminal */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-2 bg-[#060a0e] border-t border-[#14232c] flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <span className="absolute left-2.5 text-[#00ff88] font-black text-[10px]">
              &gt;
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER TACTICAL COMMAND OR QUERY..."
              className="w-full bg-[#0b1218] border border-[#1b313e] rounded-[2px] pl-6 pr-3 py-1.5 text-[10px] text-white placeholder-[#556] outline-none focus:border-[#00ff88]/60 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3 py-1.5 bg-[#00ff88]/20 border border-[#00ff88]/60 text-[#00ff88] hover:bg-[#00ff88] hover:text-black font-black rounded-[2px] text-[10px] transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <span>TRANSMIT</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
