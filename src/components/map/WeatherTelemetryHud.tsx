import { useState } from 'react';
import { CloudRain, Wind, Compass } from 'lucide-react';
import { WeatherLayerMode } from '../../types';
import { soundManager } from '../../utils/audio';

interface WeatherTelemetryHudProps {
  showWeatherLayer: boolean;
  weatherLayerMode: WeatherLayerMode;
  onSetWeatherMode: (mode: WeatherLayerMode) => void;
  weatherStats: {
    maxPrecip: number;
    avgWindSpeed: number;
    stormHeading: number;
  };
}

export default function WeatherTelemetryHud({
  showWeatherLayer,
  weatherLayerMode,
  onSetWeatherMode,
  weatherStats,
}: WeatherTelemetryHudProps) {
  const [minimized, setMinimized] = useState<boolean>(false);

  if (!showWeatherLayer) return null;

  return (
    <div className="absolute top-3 left-3 z-10 font-mono select-none w-[240px] bg-[#0a0f14]/95 border border-[#00e5ff]/40 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0e1720] border-b border-[#00e5ff]/30 text-[10px]">
        <div className="flex items-center gap-1.5 text-[#00e5ff] font-bold tracking-wider">
          {weatherLayerMode === 'precipitation' ? (
            <CloudRain className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
          ) : (
            <Wind className="w-3.5 h-3.5 text-[#ff8800] animate-pulse" />
          )}
          <span>RADAR METEOROLOGY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-[#777] hover:text-[#00e5ff] text-[9px] px-1 transition-colors"
            title="Toggle Minimized"
          >
            {minimized ? '+' : '—'}
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="p-2 space-y-2">
          {/* Layer Mode Selector */}
          <div className="grid grid-cols-2 gap-1 bg-[#06090c] p-0.5 rounded-[2px] border border-[#162530]">
            <button
              onClick={() => {
                soundManager.playClick();
                onSetWeatherMode('precipitation');
              }}
              className={`py-1 text-[8px] font-bold tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center gap-1 ${
                weatherLayerMode === 'precipitation'
                  ? 'bg-[#00e5ff] text-black font-black shadow-[0_0_8px_#00e5ff]'
                  : 'text-[#888] hover:text-[#eee]'
              }`}
            >
              <CloudRain className="w-2.5 h-2.5" /> PRECIPITATION
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onSetWeatherMode('wind');
              }}
              className={`py-1 text-[8px] font-bold tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center gap-1 ${
                weatherLayerMode === 'wind'
                  ? 'bg-[#ff8800] text-black font-black shadow-[0_0_8px_#ff8800]'
                  : 'text-[#888] hover:text-[#eee]'
              }`}
            >
              <Wind className="w-2.5 h-2.5" /> WIND SPEED
            </button>
          </div>

          {/* Heatmap Color Scale Ramp */}
          <div className="space-y-1">
            <div className="flex justify-between text-[7.5px] text-[#7a8a99] uppercase tracking-wider">
              <span>{weatherLayerMode === 'precipitation' ? 'DOPPLER (mm/h)' : 'VELOCITY (km/h)'}</span>
              <span className="text-[#00e5ff]">HEATMAP</span>
            </div>

            {/* Gradient Bar */}
            <div className="h-2 w-full rounded-[1px] border border-white/10 overflow-hidden relative">
              {weatherLayerMode === 'precipitation' ? (
                <div className="h-full w-full bg-gradient-to-r from-transparent via-[#00a0ff] via-[#00ff88] via-[#ffe600] via-[#ff8200] to-[#ff003c]" />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-transparent via-[#1432a0] via-[#00e5ff] via-[#b4ff00] via-[#ff8c00] to-[#ff00c8]" />
              )}
            </div>

            {/* Ticks */}
            <div className="flex justify-between text-[7.5px] text-[#888] font-mono">
              {weatherLayerMode === 'precipitation' ? (
                <>
                  <span>0</span>
                  <span>5</span>
                  <span>15</span>
                  <span>30</span>
                  <span>45+</span>
                </>
              ) : (
                <>
                  <span>10</span>
                  <span>25</span>
                  <span>45</span>
                  <span>60</span>
                  <span>75+</span>
                </>
              )}
            </div>
          </div>

          {/* Live Telemetry Grid */}
          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[#162530] text-[8px]">
            <div className="bg-[#080d12] p-1 rounded-[2px] border border-[#162530]">
              <div className="text-[#667] text-[7px] uppercase">
                {weatherLayerMode === 'precipitation' ? 'PEAK CELL' : 'PEAK GUST'}
              </div>
              <div className="text-[#00e5ff] font-bold text-[9.5px] mt-0.5">
                {weatherLayerMode === 'precipitation'
                  ? `${weatherStats.maxPrecip} mm/h`
                  : `${Math.round(weatherStats.avgWindSpeed * 1.5)} km/h`}
              </div>
            </div>

            <div className="bg-[#080d12] p-1 rounded-[2px] border border-[#162530]">
              <div className="text-[#667] text-[7px] uppercase">WIND HEADING</div>
              <div className="text-[#ff8800] font-bold text-[9.5px] mt-0.5 flex items-center gap-1">
                <Compass className="w-2.5 h-2.5" style={{ transform: `rotate(${weatherStats.stormHeading}deg)` }} />
                <span>{weatherStats.stormHeading}° SW</span>
              </div>
            </div>

            <div className="bg-[#080d12] p-1 rounded-[2px] border border-[#162530]">
              <div className="text-[#667] text-[7px] uppercase">AVG SPEED</div>
              <div className="text-[#e0e0e0] font-bold text-[9.5px] mt-0.5">
                {weatherStats.avgWindSpeed} km/h
              </div>
            </div>

            <div className="bg-[#080d12] p-1 rounded-[2px] border border-[#162530]">
              <div className="text-[#667] text-[7px] uppercase">CELL STATUS</div>
              <div className="text-[#00ff88] font-bold text-[9.5px] mt-0.5">
                {weatherStats.maxPrecip > 30 ? 'FRONT ACTIVE' : 'STEADY'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
