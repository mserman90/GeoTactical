import { Plus, Minus, Compass, Crosshair, Navigation } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface MapControlsProps {
  zoom: number;
  pitch: number;
  bearing: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetBearing: () => void;
  onToggle3D: () => void;
  isChaseCam?: boolean;
  onToggleChaseCam?: () => void;
  canChaseCam?: boolean;
  isPlanningRoute?: boolean;
  onTogglePlanningRoute?: () => void;
  canPlanRoute?: boolean;
}

export default function MapControls({
  zoom,
  pitch,
  bearing,
  onZoomIn,
  onZoomOut,
  onResetBearing,
  onToggle3D,
  isChaseCam = false,
  onToggleChaseCam,
  canChaseCam = false,
  isPlanningRoute = false,
  onTogglePlanningRoute,
  canPlanRoute = false,
}: MapControlsProps) {
  return (
    <>
      {/* Map Control Buttons in top-right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 font-mono select-none">
        <button
          onClick={onZoomIn}
          className="w-8 h-8 rounded-[2px] bg-[#0a0a0a]/90 border border-[#222] text-[#e6e6e6] hover:text-[#00ff88] hover:border-[#00ff88]/50 flex items-center justify-center transition-colors shadow-md"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          className="w-8 h-8 rounded-[2px] bg-[#0a0a0a]/90 border border-[#222] text-[#e6e6e6] hover:text-[#00ff88] hover:border-[#00ff88]/50 flex items-center justify-center transition-colors shadow-md"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={onResetBearing}
          className="w-8 h-8 rounded-[2px] bg-[#0a0a0a]/90 border border-[#222] text-[#e6e6e6] hover:text-[#00ff88] hover:border-[#00ff88]/50 flex items-center justify-center transition-colors shadow-md"
          title="Reset North Heading"
        >
          <Compass className="w-4 h-4" style={{ transform: `rotate(${-bearing}deg)` }} />
        </button>

        <button
          onClick={onToggle3D}
          className={`w-8 h-8 rounded-[2px] border text-[9px] font-bold flex items-center justify-center transition-colors shadow-md ${
            pitch > 10
              ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88]'
              : 'bg-[#0a0a0a]/90 border-[#222] text-[#888] hover:text-[#ccc]'
          }`}
          title="Toggle 3D Pitch View"
        >
          3D
        </button>

        {/* Chase Cam Lock Button */}
        {canChaseCam && onToggleChaseCam && (
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleChaseCam();
            }}
            className={`w-8 h-8 rounded-[2px] border flex items-center justify-center transition-colors shadow-md ${
              isChaseCam
                ? 'bg-[#ff8800]/20 border-[#ff8800] text-[#ff8800] shadow-[0_0_8px_#ff8800]'
                : 'bg-[#0a0a0a]/90 border-[#222] text-[#888] hover:text-[#ff8800]'
            }`}
            title={isChaseCam ? 'Unlock Chase Cam' : 'Lock Chase Cam on Target'}
          >
            <Crosshair className={`w-4 h-4 ${isChaseCam ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Flight Waypoint Planner Button */}
        {canPlanRoute && onTogglePlanningRoute && (
          <button
            onClick={() => {
              soundManager.playClick();
              onTogglePlanningRoute();
            }}
            className={`w-8 h-8 rounded-[2px] border flex items-center justify-center transition-colors shadow-md ${
              isPlanningRoute
                ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88] shadow-[0_0_8px_#00ff88]'
                : 'bg-[#0a0a0a]/90 border-[#222] text-[#888] hover:text-[#00ff88]'
            }`}
            title="Open Mission Flight Path Planner"
          >
            <Navigation className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Coordinates HUD in bottom-left */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#0a0a0a]/90 border border-[#1a1a1a] rounded-[2px] px-2 py-1 font-mono text-[9px] text-[#888] flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
          <span className="text-[#00ff88] font-bold">WGS-84</span>
        </span>
        {isChaseCam && (
          <span className="text-[#ff8800] font-bold animate-pulse">CHASE LOCK</span>
        )}
        <span>Z: {zoom}</span>
        <span>BRG: {bearing}°</span>
        <span>PITCH: {pitch}°</span>
      </div>
    </>
  );
}
