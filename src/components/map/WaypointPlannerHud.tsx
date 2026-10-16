import { Navigation, Check, X, Trash2, MapPin } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface WaypointPlannerHudProps {
  isActive: boolean;
  targetCallsign: string;
  waypoints: [number, number][];
  onClear: () => void;
  onCancel: () => void;
  onDeploy: () => void;
}

export function calculateDistanceKm(points: [number, number][]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [lng1, lat1] = points[i];
    const [lng2, lat2] = points[i + 1];
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return parseFloat(total.toFixed(2));
}

export default function WaypointPlannerHud({
  isActive,
  targetCallsign,
  waypoints,
  onClear,
  onCancel,
  onDeploy,
}: WaypointPlannerHudProps) {
  if (!isActive) return null;

  const totalDistance = calculateDistanceKm(waypoints);
  // Estimate flight time assuming ~35 km/h cruise speed
  const estMinutes = Math.round((totalDistance / 35) * 60);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 font-mono select-none w-[90%] max-w-[460px] bg-[#0c1015]/95 border-2 border-[#00ff88] rounded-[2px] shadow-[0_0_25px_rgba(0,255,136,0.4)] p-3 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#00ff88]/30 text-[11px]">
        <div className="flex items-center gap-2 text-[#00ff88] font-black tracking-widest">
          <Navigation className="w-4 h-4 animate-spin" />
          <span>TACTICAL ROUTE PLANNER</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 bg-[#00ff88]/20 border border-[#00ff88]/40 rounded text-[#00ff88] font-bold">
          TARGET: {targetCallsign}
        </span>
      </div>

      {/* Info & Metrics */}
      <div className="grid grid-cols-3 gap-2 my-2.5 text-[9px]">
        <div className="p-1.5 bg-[#06080a] border border-[#1a252f] rounded-[2px]">
          <span className="text-[#667] text-[7.5px] uppercase block">WAYPOINTS</span>
          <span className="text-white font-bold text-[12px]">{waypoints.length}</span>
        </div>
        <div className="p-1.5 bg-[#06080a] border border-[#1a252f] rounded-[2px]">
          <span className="text-[#667] text-[7.5px] uppercase block">TOTAL DISTANCE</span>
          <span className="text-[#00e5ff] font-bold text-[12px]">{totalDistance} km</span>
        </div>
        <div className="p-1.5 bg-[#06080a] border border-[#1a252f] rounded-[2px]">
          <span className="text-[#667] text-[7.5px] uppercase block">EST. FLIGHT TIME</span>
          <span className="text-[#ff8800] font-bold text-[12px]">~{estMinutes} min</span>
        </div>
      </div>

      {/* Guidance note */}
      <div className="text-[9px] text-[#888] flex items-center gap-1.5 mb-3 bg-[#080c10] p-1.5 border border-[#141e25] rounded-[2px]">
        <MapPin className="w-3 h-3 text-[#00ff88] shrink-0" />
        <span>Click anywhere on the map canvas to place sequential waypoints.</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 text-[9px] font-bold">
        <button
          onClick={() => {
            soundManager.playClick();
            onCancel();
          }}
          className="flex-1 py-1.5 px-2 bg-[#1a1205] border border-[#ff8800]/40 text-[#ff8800] hover:bg-[#ff8800]/20 rounded-[2px] transition-colors flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" /> CANCEL
        </button>

        <button
          disabled={waypoints.length === 0}
          onClick={() => {
            soundManager.playClick();
            onClear();
          }}
          className="py-1.5 px-3 bg-[#111] border border-[#333] text-[#aaa] hover:text-white rounded-[2px] transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> CLEAR
        </button>

        <button
          disabled={waypoints.length < 2}
          onClick={() => {
            soundManager.playTargetAcquired();
            onDeploy();
          }}
          className="flex-1 py-1.5 px-2 bg-[#00ff88] text-black font-black hover:bg-[#00ff88]/90 rounded-[2px] shadow-[0_0_12px_#00ff88] transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
        >
          <Check className="w-3.5 h-3.5" /> DEPLOY TO DRONE
        </button>
      </div>
    </div>
  );
}
