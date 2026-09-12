import { Play, Pause, Wifi, Shield, Database, Radio } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BottomBarProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  activeAssetCount: number;
  sectorCount: number;
}

export default function BottomBar({
  isSimulating,
  onToggleSimulation,
  activeAssetCount,
  sectorCount,
}: BottomBarProps) {
  return (
    <footer className="h-[28px] bg-[#060606] border-t border-[#1a1a1a] flex items-center justify-between px-3 shrink-0 select-none z-20 text-[9px] font-mono text-[#777]">
      {/* Left side telemetry indicators */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { soundManager.playClick(); onToggleSimulation(); }}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border transition-colors ${
            isSimulating
              ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]'
              : 'bg-[#ff8800]/10 border-[#ff8800]/40 text-[#ff8800]'
          }`}
          title={isSimulating ? 'Pause Live Telemetry Loop' : 'Resume Telemetry Stream'}
        >
          {isSimulating ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
          <span className="font-bold">{isSimulating ? 'FEED LIVE' : 'FEED PAUSED'}</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[#444]">SYS:</span>
          <span className="text-[#00ff88]">NOMINAL</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <Wifi className="w-2.5 h-2.5 text-[#00ff88]" />
          <span>LATENCY: 22ms</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5">
          <Radio className="w-2.5 h-2.5 text-[#ff8800]" />
          <span>GNSS: 28 SATS (RTK FIXED)</span>
        </div>
      </div>

      {/* Right side diagnostics */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Database className="w-2.5 h-2.5 text-[#888]" />
          <span>PARCELS: {sectorCount}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Shield className="w-2.5 h-2.5 text-[#00ff88]" />
          <span className="text-[#00ff88]">{activeAssetCount} TARGETS EN ROUTE</span>
        </div>

        <div className="text-[#555] hidden sm:inline">
          AES-256 GCM SECURED
        </div>
      </div>
    </footer>
  );
}
