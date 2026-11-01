import { useState } from 'react';
import { Activity, ShieldAlert, RefreshCw, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { EarthquakeEvent } from '../../types';
import { soundManager } from '../../utils/audio';

interface EarthquakeTelemetryHudProps {
  showEarthquakes: boolean;
  earthquakes: EarthquakeEvent[];
  selectedEarthquake: EarthquakeEvent | null;
  onSelectEarthquake: (quake: EarthquakeEvent) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function EarthquakeTelemetryHud({
  showEarthquakes,
  earthquakes,
  selectedEarthquake,
  onSelectEarthquake,
  onRefresh,
  isLoading = false,
}: EarthquakeTelemetryHudProps) {
  const [minimized, setMinimized] = useState<boolean>(false);
  const [minMagFilter, setMinMagFilter] = useState<number>(0);

  if (!showEarthquakes) return null;

  const filteredQuakes = earthquakes.filter((q) => q.magnitude >= minMagFilter);
  const maxMag = earthquakes.reduce((max, q) => Math.max(max, q.magnitude), 0);
  const latestQuake = earthquakes[0];

  return (
    <div className="absolute top-[180px] left-3 z-10 font-mono select-none w-[240px] bg-[#0c0a0e]/95 border border-[#ff8800]/40 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#140e14] border-b border-[#ff8800]/30 text-[10px]">
        <div className="flex items-center gap-1.5 text-[#ff8800] font-bold tracking-wider">
          <Activity className="w-3.5 h-3.5 text-[#ff8800] animate-pulse" />
          <span>AFAD SEISMIC MONITOR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff8800] animate-ping" />
          <button
            onClick={() => {
              soundManager.playClick();
              onRefresh();
            }}
            disabled={isLoading}
            className={`p-0.5 text-[#888] hover:text-[#ff8800] transition-colors ${
              isLoading ? 'animate-spin text-[#ff8800]' : ''
            }`}
            title="Refresh Live AFAD Feed"
          >
            <RefreshCw className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setMinimized(!minimized);
            }}
            className="text-[#777] hover:text-[#ff8800] text-[9px] px-0.5 transition-colors"
            title={minimized ? 'Expand HUD' : 'Collapse HUD'}
          >
            {minimized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Minimized Pill */}
      {minimized && (
        <div
          onClick={() => setMinimized(false)}
          className="px-2.5 py-1 text-[8.5px] text-[#aaa] flex items-center justify-between cursor-pointer hover:bg-[#1a1212]"
        >
          <span>{earthquakes.length} QUAKES LOGGED</span>
          <span className="text-[#ff8800] font-bold">PEAK M{maxMag.toFixed(1)}</span>
        </div>
      )}

      {/* Expanded Body */}
      {!minimized && (
        <div className="p-2 space-y-2">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-1 text-center font-mono">
            <div className="bg-[#140f0c] p-1 rounded-[2px] border border-[#2a1a12]">
              <div className="text-[7.5px] text-[#777] tracking-wider">EVENTS</div>
              <div className="text-[11px] font-bold text-[#ff8800]">{earthquakes.length}</div>
            </div>
            <div className="bg-[#140f0c] p-1 rounded-[2px] border border-[#2a1a12]">
              <div className="text-[7.5px] text-[#777] tracking-wider">PEAK MAG</div>
              <div
                className={`text-[11px] font-bold ${
                  maxMag >= 4.5 ? 'text-[#ff0033]' : maxMag >= 3.0 ? 'text-[#ff8800]' : 'text-[#00ff88]'
                }`}
              >
                M{maxMag.toFixed(1)}
              </div>
            </div>
            <div className="bg-[#140f0c] p-1 rounded-[2px] border border-[#2a1a12]">
              <div className="text-[7.5px] text-[#777] tracking-wider">SHALLOWEST</div>
              <div className="text-[11px] font-bold text-[#00d4ff]">
                {earthquakes.length > 0 ? `${Math.min(...earthquakes.map((q) => q.depth))}km` : '--'}
              </div>
            </div>
          </div>

          {/* Magnitude Filter Pills */}
          <div className="flex items-center justify-between text-[8px] tracking-wider pt-0.5">
            <span className="text-[#666]">THRESHOLD:</span>
            <div className="flex gap-1">
              {[0, 2.0, 3.0].map((threshold) => (
                <button
                  key={threshold}
                  onClick={() => {
                    soundManager.playClick();
                    setMinMagFilter(threshold);
                  }}
                  className={`px-1.5 py-0.5 rounded-[2px] border transition-colors ${
                    minMagFilter === threshold
                      ? 'bg-[#ff8800]/25 border-[#ff8800] text-[#ff8800] font-bold'
                      : 'bg-[#120e0c] border-[#221812] text-[#777] hover:text-[#bbb]'
                  }`}
                >
                  {threshold === 0 ? 'ALL' : `M${threshold}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Tremors Stream */}
          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-thin">
            {filteredQuakes.slice(0, 5).map((q) => {
              const isSelected = selectedEarthquake?.id === q.id;
              const isHeavy = q.magnitude >= 4.0;
              const isModerate = q.magnitude >= 2.5 && q.magnitude < 4.0;

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    soundManager.playTargetAcquired();
                    onSelectEarthquake(q);
                  }}
                  className={`p-1.5 rounded-[2px] border cursor-pointer transition-all text-[8.5px] ${
                    isSelected
                      ? 'bg-[#2a1a10] border-[#ff8800] shadow-[0_0_8px_rgba(255,136,0,0.4)]'
                      : 'bg-[#0e0a0a] border-[#1e1515] hover:border-[#3a2525] hover:bg-[#161010]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold font-mono px-1 py-0.2 rounded-[2px] text-[8px] ${
                        isHeavy
                          ? 'bg-[#ff0033]/20 border border-[#ff0033]/50 text-[#ff0033]'
                          : isModerate
                          ? 'bg-[#ff8800]/20 border border-[#ff8800]/50 text-[#ff8800]'
                          : 'bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88]'
                      }`}
                    >
                      M{q.magnitude.toFixed(1)}
                    </span>
                    <span className="text-[7.5px] text-[#666] tracking-tight">{q.dateFormatted || 'Recently'}</span>
                  </div>
                  <div className="text-[#ccc] truncate font-sans text-[8.5px] mt-0.5">{q.location}</div>
                  <div className="flex items-center justify-between text-[7px] text-[#555] mt-0.5 font-mono">
                    <span>DEPTH: {q.depth}km</span>
                    <span>{q.provider}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Status */}
          <div className="pt-1 border-t border-[#1a1212] flex items-center justify-between text-[7.5px] text-[#555]">
            <span className="flex items-center gap-1 text-[#ff8800]/80">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              AFAD FEED CONNECTED
            </span>
            <span>ZERO-KEY CORS</span>
          </div>
        </div>
      )}
    </div>
  );
}
