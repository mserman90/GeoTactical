import { useState } from 'react';
import { 
  Activity, 
  Battery, 
  Signal, 
  Wind, 
  Droplet, 
  Sun, 
  Send, 
  RefreshCw, 
  Download, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Compass, 
  Maximize2, 
  X,
  Gauge,
  Play
} from 'lucide-react';
import { Asset, Sector, TelemetryEvent, EventSeverity } from '../types';
import { soundManager } from '../utils/audio';

interface RightSidebarProps {
  selectedAsset: Asset | null;
  selectedSector: Sector | null;
  onClearSelection: () => void;
  events: TelemetryEvent[];
  onTriggerAction: (assetId: string, actionName: string) => void;
  onTriggerSectorIrrigation: (sectorId: string) => void;
  onClearLogs: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function RightSidebar({
  selectedAsset,
  selectedSector,
  onClearSelection,
  events,
  onTriggerAction,
  onTriggerSectorIrrigation,
  isOpen,
  onToggleOpen,
}: RightSidebarProps) {
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | 'all'>('all');
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
    if (severityFilter === 'all') return true;
    return e.severity === severityFilter;
  });

  const handleAction = (assetId: string, actionName: string) => {
    soundManager.playAlert();
    setIsExecuting(actionName);
    setTimeout(() => {
      onTriggerAction(assetId, actionName);
      setIsExecuting(null);
    }, 600);
  };

  const handleIrrigate = (sectorId: string) => {
    soundManager.playAlert();
    setIsExecuting(`irrigate-${sectorId}`);
    setTimeout(() => {
      onTriggerSectorIrrigation(sectorId);
      setIsExecuting(null);
    }, 600);
  };

  const exportLogs = () => {
    soundManager.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telemetry-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed bottom-10 right-3 z-30 lg:hidden px-3 py-2 bg-[#0e0e0e] border border-[#00ff88] text-[#00ff88] font-mono text-[11px] rounded-[2px] shadow-[0_0_10px_rgba(0,255,136,0.3)] flex items-center gap-2"
      >
        <Activity className="w-3.5 h-3.5" />
        <span>OPEN TELEMETRY</span>
      </button>
    );
  }

  return (
    <aside className="w-full lg:w-[400px] bg-[#080808] border-l border-[#1a1a1a] flex flex-col shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-none z-10 select-none">
      {/* Top Header of Right Panel */}
      <div className="h-9 px-3 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00ff88]" />
          <span className="text-white font-mono text-[10px] tracking-widest font-bold">
            {selectedAsset ? `TARGET INSPECTION: ${selectedAsset.callsign}` : selectedSector ? `SECTOR ANALYTICS: ${selectedSector.id}` : 'TACTICAL TELEMETRY STREAM'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(selectedAsset || selectedSector) && (
            <button
              onClick={() => { soundManager.playClick(); onClearSelection(); }}
              className="text-[#666] hover:text-[#ff8800] text-[10px] font-mono flex items-center gap-0.5"
            >
              <X className="w-3 h-3" />
              <span>CLEAR</span>
            </button>
          )}
          <button
            onClick={onToggleOpen}
            className="text-[#666] hover:text-white p-1"
            title="Toggle Panel"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Selected Asset Details or Selected Sector */}
      {selectedAsset ? (
        <div className="p-3 border-b border-[#1a1a1a] bg-[#0c0c0c]/80">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-mono font-black text-white tracking-wider">
                  {selectedAsset.callsign}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-[2px] uppercase border ${
                  selectedAsset.status === 'active' ? 'bg-[#00ff88]/20 border-[#00ff88]/40 text-[#00ff88]' :
                  selectedAsset.status === 'warning' ? 'bg-[#ff8800]/20 border-[#ff8800]/40 text-[#ff8800]' :
                  'bg-[#222] border-[#333] text-[#aaa]'
                }`}>
                  {selectedAsset.status}
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#888] mt-0.5">
                {selectedAsset.name} • {selectedAsset.mission}
              </div>
            </div>

            <div className="text-right font-mono text-[9px] text-[#777]">
              <div>LAT: {selectedAsset.lat.toFixed(4)}°</div>
              <div>LNG: {selectedAsset.lng.toFixed(4)}°</div>
            </div>
          </div>

          {/* Quick Real-Time Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3 font-mono">
            {/* Speed & Heading */}
            <div className="p-2 rounded-[2px] bg-[#111] border border-[#222]">
              <div className="flex items-center justify-between text-[9px] text-[#777]">
                <span>VELOCITY</span>
                <Wind className="w-3 h-3 text-[#ff8800]" />
              </div>
              <div className="text-[14px] font-bold text-white mt-1">
                {selectedAsset.speedKmh} <span className="text-[9px] font-normal text-[#888]">km/h</span>
              </div>
              <div className="text-[8.5px] text-[#666] flex items-center gap-1 mt-0.5">
                <Compass className="w-2.5 h-2.5" /> {selectedAsset.headingDeg}° HDG
              </div>
            </div>

            {/* Altitude & Elevation */}
            <div className="p-2 rounded-[2px] bg-[#111] border border-[#222]">
              <div className="flex items-center justify-between text-[9px] text-[#777]">
                <span>ALTITUDE</span>
                <Gauge className="w-3 h-3 text-[#00e5ff]" />
              </div>
              <div className="text-[14px] font-bold text-white mt-1">
                {selectedAsset.altitudeMeters} <span className="text-[9px] font-normal text-[#888]">m</span>
              </div>
              <div className="text-[8.5px] text-[#666] mt-0.5">
                {selectedAsset.altitudeMeters > 0 ? 'AGL AERIAL' : 'SURFACE GROUND'}
              </div>
            </div>

            {/* Battery & Signal */}
            <div className="p-2 rounded-[2px] bg-[#111] border border-[#222]">
              <div className="flex items-center justify-between text-[9px] text-[#777]">
                <span>PWR & LINK</span>
                <Signal className="w-3 h-3 text-[#00ff88]" />
              </div>
              <div className="text-[14px] font-bold text-white mt-1 flex items-center justify-between">
                <span>{selectedAsset.batteryPct}%</span>
                <span className="text-[10px] text-[#00ff88]">{selectedAsset.signalPct}% SIG</span>
              </div>
              <div className="w-full bg-[#222] h-1 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full ${selectedAsset.batteryPct > 40 ? 'bg-[#00ff88]' : 'bg-[#ff0033]'}`}
                  style={{ width: `${selectedAsset.batteryPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Environmental telemetry if sensor or drone */}
          <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[9px]">
            <div className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#0e0e0e] border border-[#1f1f1f]">
              <span className="text-[#888] flex items-center gap-1">
                <Sun className="w-3 h-3 text-[#ffcc00]" /> CORE TEMP
              </span>
              <span className="text-[#e6e6e6] font-bold">{selectedAsset.temperatureC}°C</span>
            </div>

            {selectedAsset.soilMoisturePct !== undefined ? (
              <div className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#0e0e0e] border border-[#1f1f1f]">
                <span className="text-[#888] flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-[#00e5ff]" /> SOIL MOISTURE
                </span>
                <span className="text-[#00e5ff] font-bold">{selectedAsset.soilMoisturePct}%</span>
              </div>
            ) : selectedAsset.ndviIndex !== undefined ? (
              <div className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#0e0e0e] border border-[#1f1f1f]">
                <span className="text-[#888] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#00ff88]" /> NDVI HEALTH
                </span>
                <span className="text-[#00ff88] font-bold">{selectedAsset.ndviIndex} / 1.0</span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#0e0e0e] border border-[#1f1f1f]">
                <span className="text-[#888]">RTK GNSS MODE</span>
                <span className="text-[#00ff88] font-bold">L1/L2 RTK FIXED</span>
              </div>
            )}
          </div>

          {/* Action Commands Panel */}
          <div className="mt-3 pt-2.5 border-t border-[#1a1a1a]">
            <div className="text-[9px] font-mono tracking-wider text-[#666] mb-1.5">
              TACTICAL FLIGHT & MOTOR COMMANDS
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {selectedAsset.type === 'drone' ? (
                <>
                  <button
                    disabled={isExecuting !== null}
                    onClick={() => handleAction(selectedAsset.id, 'RTH')}
                    className="py-1.5 px-2 bg-[#1a1205] border border-[#ff8800]/40 text-[#ff8800] hover:bg-[#ff8800]/20 rounded-[2px] font-mono text-[9px] font-bold tracking-wider text-center transition-colors disabled:opacity-50"
                  >
                    {isExecuting === 'RTH' ? 'TRANSMITTING...' : 'DISPATCH RTH (RETURN)'}
                  </button>
                  <button
                    disabled={isExecuting !== null}
                    onClick={() => handleAction(selectedAsset.id, 'NDVI_SCAN')}
                    className="py-1.5 px-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 rounded-[2px] font-mono text-[9px] font-bold tracking-wider text-center transition-colors disabled:opacity-50"
                  >
                    {isExecuting === 'NDVI_SCAN' ? 'SCANNING...' : 'TRIGGER NDVI SWEEP'}
                  </button>
                </>
              ) : selectedAsset.type === 'irrigation_node' ? (
                <>
                  <button
                    disabled={isExecuting !== null}
                    onClick={() => handleAction(selectedAsset.id, 'PULSE_IRRIGATION')}
                    className="py-1.5 px-2 bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff] hover:bg-[#00e5ff]/20 rounded-[2px] font-mono text-[9px] font-bold tracking-wider text-center transition-colors disabled:opacity-50"
                  >
                    {isExecuting === 'PULSE_IRRIGATION' ? 'OPENING...' : 'OPEN MAIN VALVE (4.0 BAR)'}
                  </button>
                  <button
                    disabled={isExecuting !== null}
                    onClick={() => handleAction(selectedAsset.id, 'FLUSH_CYCLE')}
                    className="py-1.5 px-2 bg-[#1a1205] border border-[#ff8800]/40 text-[#ff8800] hover:bg-[#ff8800]/20 rounded-[2px] font-mono text-[9px] font-bold tracking-wider text-center transition-colors disabled:opacity-50"
                  >
                    {isExecuting === 'FLUSH_CYCLE' ? 'FLUSHING...' : 'DRAIN & BACKWASH'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled={isExecuting !== null}
                    onClick={() => handleAction(selectedAsset.id, 'CALIBRATE_RTK')}
                    className="py-1.5 px-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 rounded-[2px] font-mono text-[9px] font-bold tracking-wider text-center transition-colors disabled:opacity-50"
                  >
                    {isExecuting === 'CALIBRATE_RTK' ? 'SYNCING...' : 'CALIBRATE RTK BEACON'}
                  </button>
                  <button
                    disabled={isExecuting !== null}
                    onClick={() => handleAction(selectedAsset.id, 'PING_PROBES')}
                    className="py-1.5 px-2 bg-[#111] border border-[#333] text-[#ccc] hover:border-[#00ff88] rounded-[2px] font-mono text-[9px] font-bold tracking-wider text-center transition-colors disabled:opacity-50"
                  >
                    {isExecuting === 'PING_PROBES' ? 'POLLING...' : 'POLL TELEMETRY PROBES'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : selectedSector ? (
        <div className="p-3 border-b border-[#1a1a1a] bg-[#0c0c0c]/80">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[13px] font-mono font-black text-[#00ff88] tracking-wider">
                {selectedSector.id} • {selectedSector.name}
              </div>
              <div className="text-[10px] font-mono text-[#aaa] mt-0.5">
                {selectedSector.crop}
              </div>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-[2px] uppercase font-bold ${
              selectedSector.alertLevel === 'critical' ? 'bg-[#ff0033]/20 text-[#ff0033] border border-[#ff0033]/40' :
              selectedSector.alertLevel === 'moderate' ? 'bg-[#ff8800]/20 text-[#ff8800] border border-[#ff8800]/40' :
              'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40'
            }`}>
              {selectedSector.alertLevel}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 font-mono">
            <div className="p-2 rounded-[2px] bg-[#111] border border-[#222]">
              <div className="text-[9px] text-[#777]">PARCEL AREA</div>
              <div className="text-[14px] font-bold text-white mt-0.5">{selectedSector.areaHa} <span className="text-[9px] text-[#888]">ha</span></div>
            </div>

            <div className="p-2 rounded-[2px] bg-[#111] border border-[#222]">
              <div className="text-[9px] text-[#777]">NDVI CANOPY</div>
              <div className="text-[14px] font-bold text-[#00ff88] mt-0.5">{selectedSector.ndviHealth}</div>
            </div>

            <div className="p-2 rounded-[2px] bg-[#111] border border-[#222]">
              <div className="text-[9px] text-[#777]">SOIL MOISTURE</div>
              <div className={`text-[14px] font-bold mt-0.5 ${selectedSector.soilMoisturePct < 25 ? 'text-[#ff0033]' : 'text-[#00e5ff]'}`}>
                {selectedSector.soilMoisturePct}%
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#1a1a1a]">
            <button
              disabled={isExecuting !== null}
              onClick={() => handleIrrigate(selectedSector.id)}
              className="w-full py-2 bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/20 rounded-[2px] font-mono text-[10px] font-bold tracking-widest text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>{isExecuting === `irrigate-${selectedSector.id}` ? 'STARTING IRRIGATION...' : 'SCHEDULE DRIP IRRIGATION FOR SECTOR'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Live Log & Incident Feed */}
      <div className="p-2 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a]">
        <span className="text-[9px] font-mono tracking-widest text-[#888]">
          LOG EVENTS & ANOMALIES
        </span>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1 font-mono text-[8px]">
          {(['all', 'alert', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => { soundManager.playClick(); setSeverityFilter(sev); }}
              className={`px-1.5 py-0.5 rounded-[2px] uppercase border transition-colors ${
                severityFilter === sev
                  ? 'bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88]'
                  : 'bg-[#111] border-[#222] text-[#666] hover:text-[#bbb]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Event List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredEvents.map((evt) => {
          return (
            <div
              key={evt.id}
              className={`p-2 rounded-[2px] border text-[9.5px] font-mono transition-colors ${
                evt.severity === 'alert'
                  ? 'bg-[#1f0909] border-[#ff0033]/50 text-[#ff7788]'
                  : evt.severity === 'warning'
                  ? 'bg-[#1a1205] border-[#ff8800]/40 text-[#ffcc88]'
                  : evt.severity === 'success'
                  ? 'bg-[#06150c] border-[#00ff88]/30 text-[#88ffcc]'
                  : 'bg-[#0e0e0e] border-[#1a1a1a] text-[#aaa]'
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[8.5px]">
                <div className="flex items-center gap-1.5">
                  {evt.severity === 'alert' && <AlertTriangle className="w-3 h-3 text-[#ff0033]" />}
                  {evt.severity === 'warning' && <AlertTriangle className="w-3 h-3 text-[#ff8800]" />}
                  {evt.severity === 'success' && <CheckCircle2 className="w-3 h-3 text-[#00ff88]" />}
                  {evt.severity === 'info' && <Info className="w-3 h-3 text-[#55aaff]" />}
                  <span className="font-bold text-white">{evt.assetName}</span>
                </div>
                <span className="text-[#666]">{evt.timestamp}</span>
              </div>
              <p className="leading-[1.4] text-[#ccc]">
                {evt.message}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Log Actions */}
      <div className="p-2 border-t border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between">
        <span className="text-[8px] font-mono text-[#555]">
          AUTO-INGEST BUFFER: {events.length} EVENTS
        </span>
        <button
          onClick={exportLogs}
          className="flex items-center gap-1 px-2 py-1 rounded-[2px] bg-[#111] border border-[#222] text-[#888] hover:text-[#00ff88] hover:border-[#00ff88]/40 text-[9px] font-mono transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>EXPORT LOG</span>
        </button>
      </div>
    </aside>
  );
}
