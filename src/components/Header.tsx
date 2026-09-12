import { useState, useEffect } from 'react';
import { 
  Radio, 
  Satellite, 
  Layers, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Maximize, 
  ShieldAlert, 
  Activity,
  Cpu
} from 'lucide-react';
import { MapStyleMode } from '../types';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  mapStyle: MapStyleMode;
  onStyleChange: (style: MapStyleMode) => void;
  activeAssetCount: number;
  alertCount: number;
  onResetView: () => void;
}

export default function Header({
  mapStyle,
  onStyleChange,
  activeAssetCount,
  alertCount,
  onResetView,
}: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setTimeStr(iso);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
    if (next) soundManager.playClick();
  };

  const toggleFullscreen = () => {
    soundManager.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-[52px] bg-[#080808] border-b border-[#1a1a1a] flex items-center justify-between px-3 md:px-4 shrink-0 select-none z-20">
      {/* Left title & status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-6 h-6 rounded bg-[#00ff88]/10 border border-[#00ff88]/40">
            <Radio className="w-3.5 h-3.5 text-[#00ff88] animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-mono font-black text-[13px] tracking-[0.18em] leading-none">
                GEOTACTICAL
              </span>
              <span className="text-[#00ff88] font-mono text-[10px] tracking-widest px-1 py-0.2 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-[2px]">
                OPS-CONSOLE
              </span>
            </div>
            <span className="text-[#666] font-mono text-[9px] tracking-widest hidden md:inline">
              AUTONOMOUS AGRI-TELEMETRY & SENSOR GRID
            </span>
          </div>
        </div>

        {/* Status Pills */}
        <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 border-l border-[#1a1a1a]">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#0e0e0e] border border-[#222]">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
            <span className="text-[#aaa] font-mono text-[10px] tracking-widest">NODES:</span>
            <span className="text-[#00ff88] font-mono font-bold text-[10px]">{activeAssetCount} ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#0e0e0e] border border-[#222]">
            <Cpu className="w-3 h-3 text-[#ff8800]" />
            <span className="text-[#aaa] font-mono text-[10px] tracking-widest">RTK:</span>
            <span className="text-[#ff8800] font-mono font-bold text-[10px]">±1.2cm FIX</span>
          </div>

          {alertCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#ff0033]/10 border border-[#ff0033]/40 animate-pulse">
              <ShieldAlert className="w-3 h-3 text-[#ff0033]" />
              <span className="text-[#ff0033] font-mono font-bold text-[10px]">{alertCount} ANOMALIES</span>
            </div>
          )}
        </div>
      </div>

      {/* Center live clock */}
      <div className="hidden sm:flex items-center gap-2 font-mono text-[#888] text-[11px] bg-[#0e0e0e] px-3 py-1 border border-[#1a1a1a] rounded-[2px]">
        <Activity className="w-3 h-3 text-[#00ff88]" />
        <span className="text-[#e6e6e6] tracking-wider">{timeStr}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Style selector pills */}
        <div className="flex items-center bg-[#0e0e0e] p-0.5 border border-[#222] rounded-[2px]">
          <button
            onClick={() => { soundManager.playClick(); onStyleChange('tactical_dark'); }}
            className={`px-2 py-1 text-[10px] font-mono tracking-wider rounded-[2px] transition-colors flex items-center gap-1 ${
              mapStyle === 'tactical_dark'
                ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40 shadow-[0_0_8px_#00ff88]'
                : 'text-[#888] hover:text-[#ccc]'
            }`}
            title="Tactical Dark Vector Map"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden md:inline">TACTICAL</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(); onStyleChange('satellite_recon'); }}
            className={`px-2 py-1 text-[10px] font-mono tracking-wider rounded-[2px] transition-colors flex items-center gap-1 ${
              mapStyle === 'satellite_recon'
                ? 'bg-[#ff8800]/20 text-[#ff8800] border border-[#ff8800]/50 shadow-[0_0_10px_rgba(255,136,0,0.4)]'
                : 'text-[#888] hover:text-[#ccc]'
            }`}
            title="Satellite Recon Aerial Imagery"
          >
            <Satellite className="w-3 h-3" />
            <span className="hidden md:inline">SATELLITE</span>
          </button>
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 rounded-[2px] border transition-colors ${
            soundEnabled 
              ? 'bg-[#0e0e0e] border-[#333] text-[#00ff88] hover:border-[#00ff88]' 
              : 'bg-[#0e0e0e] border-[#222] text-[#555] hover:text-[#888]'
          }`}
          title={soundEnabled ? 'Mute Sound Effects' : 'Enable Tactical Audio'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Reset View */}
        <button
          onClick={() => { soundManager.playClick(); onResetView(); }}
          className="p-1.5 rounded-[2px] bg-[#0e0e0e] border border-[#222] text-[#888] hover:text-[#00ff88] hover:border-[#00ff88]/40 transition-colors"
          title="Reset Camera & Centering"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-[2px] bg-[#0e0e0e] border border-[#222] text-[#888] hover:text-white hover:border-[#333] transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
