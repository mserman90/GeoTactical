import { Crosshair } from 'lucide-react';

interface TacticalHudOverlayProps {
  showRadarSweep: boolean;
  showGridHUD: boolean;
  cursorCoords: { lat: number; lng: number } | null;
  pitch: number;
  bearing: number;
}

export default function TacticalHudOverlay({
  showRadarSweep,
  showGridHUD,
  cursorCoords,
  pitch,
  bearing,
}: TacticalHudOverlayProps) {
  return (
    <>
      {/* Rotating Radar Sweep Layer */}
      {showRadarSweep && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-60">
          <div className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-[#00ff88]/20 relative">
            {/* Concentric rings */}
            <div className="absolute inset-[15%] rounded-full border border-[#00ff88]/15" />
            <div className="absolute inset-[30%] rounded-full border border-[#00ff88]/10" />
            <div className="absolute inset-[45%] rounded-full border border-[#00ff88]/10" />

            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#00ff88]/15" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[#00ff88]/15" />

            {/* Sweep beam */}
            <div className="w-full h-full rounded-full animate-radar-sweep bg-gradient-to-br from-[#00ff88]/20 via-[#00ff88]/5 to-transparent" />
          </div>
        </div>
      )}

      {/* Tactical HUD Reticle Overlay */}
      {showGridHUD && (
        <div className="absolute inset-0 pointer-events-none border border-[#00ff88]/20 p-3 select-none flex flex-col justify-between">
          {/* Top Corners */}
          <div className="flex justify-between items-start">
            <div className="w-4 h-4 border-t-2 border-l-2 border-[#00ff88]" />
            <div className="text-[9px] font-mono text-[#00ff88] bg-[#0a0a0a]/90 px-2 py-0.5 border border-[#00ff88]/30">
              RADAR ACQUISITION: 14.2 GHz • S-BAND PULSE
            </div>
            <div className="w-4 h-4 border-t-2 border-r-2 border-[#00ff88]" />
          </div>

          {/* Center Crosshairs */}
          <div className="self-center flex items-center justify-center">
            <div className="w-8 h-8 border border-[#00ff88]/30 rounded-full flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-[#00ff88]/60" />
            </div>
          </div>

          {/* Bottom Corners */}
          <div className="flex justify-between items-end">
            <div className="w-4 h-4 border-b-2 border-l-2 border-[#00ff88]" />
            {cursorCoords && (
              <div className="text-[10px] font-mono text-[#00ff88] bg-[#0a0a0a]/90 px-2.5 py-1 border border-[#00ff88]/40 shadow-[0_0_8px_#00ff88]">
                TARGET LAT: {cursorCoords.lat}° N &nbsp;|&nbsp; LNG: {cursorCoords.lng}° E &nbsp;|&nbsp; PITCH: {pitch}° &nbsp;|&nbsp; BRG: {bearing}°
              </div>
            )}
            <div className="w-4 h-4 border-b-2 border-r-2 border-[#00ff88]" />
          </div>
        </div>
      )}
    </>
  );
}
