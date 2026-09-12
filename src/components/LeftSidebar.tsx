import { useState } from 'react';
import { 
  Search, 
  Plane, 
  Tractor, 
  Radio, 
  Droplets, 
  ShieldCheck, 
  Crosshair, 
  ChevronDown, 
  ChevronRight,
  Eye,
  EyeOff,
  BatteryCharging,
  Battery,
  MapPin,
  Compass,
  CloudRain,
  Wind
} from 'lucide-react';
import { Asset, FilterSettings, PresetLocation, Sector, WeatherLayerMode } from '../types';
import { soundManager } from '../utils/audio';

interface LeftSidebarProps {
  assets: Asset[];
  sectors: Sector[];
  selectedAssetId: string | null;
  selectedSectorId: string | null;
  onSelectAsset: (asset: Asset) => void;
  onSelectSector: (sector: Sector) => void;
  filters: FilterSettings;
  onToggleFilter: <K extends keyof FilterSettings>(key: K) => void;
  onSetWeatherMode: (mode: WeatherLayerMode) => void;
  presetLocations: PresetLocation[];
  currentPresetId: string;
  onSelectPreset: (preset: PresetLocation) => void;
}

export default function LeftSidebar({
  assets,
  sectors,
  selectedAssetId,
  selectedSectorId,
  onSelectAsset,
  onSelectSector,
  filters,
  onToggleFilter,
  onSetWeatherMode,
  presetLocations,
  currentPresetId,
  onSelectPreset
}: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'air' | 'ground' | 'sensor'>('all');
  const [sectorsOpen, setSectorsOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(true);
  const [presetsOpen, setPresetsOpen] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.mission.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'air') return asset.type === 'drone';
    if (activeTab === 'ground') return asset.type === 'tractor';
    if (activeTab === 'sensor') return asset.type === 'sensor_cluster' || asset.type === 'sentinel' || asset.type === 'irrigation_node';
    return true;
  });

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'drone':
        return <Plane className="w-3.5 h-3.5 text-[#00ff88]" />;
      case 'tractor':
        return <Tractor className="w-3.5 h-3.5 text-[#ff8800]" />;
      case 'irrigation_node':
        return <Droplets className="w-3.5 h-3.5 text-[#00e5ff]" />;
      case 'sentinel':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#e0e0e0]" />;
      case 'sensor_cluster':
      default:
        return <Radio className="w-3.5 h-3.5 text-[#ffcc00]" />;
    }
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'active':
        return 'bg-[#00ff88] text-[#00ff88]';
      case 'online':
        return 'bg-[#00e5ff] text-[#00e5ff]';
      case 'warning':
        return 'bg-[#ff8800] text-[#ff8800]';
      case 'standby':
        return 'bg-[#888] text-[#888]';
      case 'offline':
      default:
        return 'bg-[#ff0033] text-[#ff0033]';
    }
  };

  return (
    <aside className="w-full lg:w-[220px] bg-[#060606] border-r border-[#1a1a1a] flex flex-col shrink-0 overflow-y-auto max-h-[340px] lg:max-h-none z-10 select-none">
      {/* Search Bar */}
      <div className="p-2 border-b border-[#1a1a1a]">
        <div className="relative flex items-center">
          <Search className="w-3 h-3 text-[#555] absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER TARGETS..."
            className="w-full bg-[#0e0e0e] border border-[#222] rounded-[2px] pl-6 pr-2 py-1 text-[10px] font-mono text-[#e6e6e6] placeholder-[#444] focus:border-[#00ff88]/50 outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="grid grid-cols-4 gap-1 mt-1.5 font-mono text-[8px] tracking-wider">
          {(['all', 'air', 'ground', 'sensor'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { soundManager.playClick(); setActiveTab(tab); }}
              className={`py-0.5 text-center uppercase rounded-[2px] border transition-colors ${
                activeTab === tab
                  ? 'bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88]'
                  : 'bg-[#0e0e0e] border-[#1f1f1f] text-[#666] hover:text-[#aaa]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Target Units List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-[#555] px-1 mb-1">
          <span>TRACKED NODES ({filteredAssets.length})</span>
          <span className="text-[#00ff88] animate-pulse">● LIVE</span>
        </div>

        {filteredAssets.map((asset) => {
          const isSelected = selectedAssetId === asset.id;
          return (
            <div
              key={asset.id}
              onClick={() => {
                soundManager.playTargetAcquired();
                onSelectAsset(asset);
              }}
              className={`p-2 rounded-[2px] border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#151009] border-[#ff8800] shadow-[0_0_8px_rgba(255,136,0,0.3)]'
                  : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] hover:bg-[#111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded bg-[#111] border border-[#222]">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-mono font-bold text-white truncate leading-tight">
                      {asset.callsign}
                    </div>
                    <div className="text-[9px] font-mono text-[#777] truncate">
                      {asset.name}
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex flex-col items-end shrink-0 pl-1">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(asset.status).split(' ')[0]}`} />
                    <span className="text-[8px] font-mono font-bold tracking-wider uppercase text-[#aaa]">
                      {asset.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-mono text-[#666] mt-0.5">
                    {asset.batteryPct > 90 ? (
                      <BatteryCharging className="w-2.5 h-2.5 text-[#00ff88]" />
                    ) : (
                      <Battery className="w-2.5 h-2.5 text-[#aaa]" />
                    )}
                    <span>{asset.batteryPct}%</span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 pt-1.5 border-t border-[#ff8800]/30 flex items-center justify-between text-[8px] font-mono text-[#ff8800]">
                  <span className="flex items-center gap-1">
                    <Crosshair className="w-2.5 h-2.5 animate-spin" /> TARGET LOCKED
                  </span>
                  <span>{asset.speedKmh > 0 ? `${asset.speedKmh} km/h` : 'STATIONARY'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sectors Collapsible */}
      <div className="border-t border-[#1a1a1a] p-2">
        <button
          onClick={() => { soundManager.playClick(); setSectorsOpen(!sectorsOpen); }}
          className="w-full flex items-center justify-between text-[9.5px] font-mono text-[#888] hover:text-[#ccc] py-0.5"
        >
          <span className="flex items-center gap-1 tracking-wider">
            <MapPin className="w-3 h-3 text-[#00ff88]" /> AGRI-SECTORS ({sectors.length})
          </span>
          {sectorsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {sectorsOpen && (
          <div className="mt-1 space-y-1">
            {sectors.map((sector) => {
              const isSelected = selectedSectorId === sector.id;
              return (
                <div
                  key={sector.id}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectSector(sector);
                  }}
                  className={`px-2 py-1 rounded-[2px] border text-[9px] font-mono cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]'
                      : 'bg-[#0e0e0e] border-[#1a1a1a] text-[#aaa] hover:border-[#333]'
                  }`}
                >
                  <span className="truncate pr-1">{sector.id} - {sector.crop.split(' ')[0]}</span>
                  <span className={`text-[8px] px-1 rounded-[2px] shrink-0 ${
                    sector.alertLevel === 'critical' ? 'bg-[#ff0033]/20 text-[#ff0033]' :
                    sector.alertLevel === 'moderate' ? 'bg-[#ff8800]/20 text-[#ff8800]' :
                    'bg-[#00ff88]/20 text-[#00ff88]'
                  }`}>
                    {sector.soilMoisturePct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Layer Visibility Toggles */}
      <div className="border-t border-[#1a1a1a] p-2">
        <button
          onClick={() => { soundManager.playClick(); setLayersOpen(!layersOpen); }}
          className="w-full flex items-center justify-between text-[9.5px] font-mono text-[#888] hover:text-[#ccc] py-0.5"
        >
          <span className="flex items-center gap-1 tracking-wider">
            <Compass className="w-3 h-3 text-[#ff8800]" /> HUD & LAYERS
          </span>
          {layersOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {layersOpen && (
          <div className="mt-1.5 space-y-1 text-[9px] font-mono">
            <div className="space-y-1 pt-1 border-t border-[#1f1f1f]/80">
              <button
                onClick={() => { soundManager.playClick(); onToggleFilter('showWeatherLayer'); }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] border transition-colors ${
                  filters.showWeatherLayer
                    ? 'bg-[#00e5ff]/15 border-[#00e5ff]/50 text-[#00e5ff]'
                    : 'bg-[#0e0e0e] border-[#1f1f1f] text-[#bbb] hover:border-[#333]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3 h-3 text-[#00e5ff]" />
                  <span className="font-bold">WEATHER HEATMAP</span>
                </span>
                {filters.showWeatherLayer ? <Eye className="w-3 h-3 text-[#00e5ff]" /> : <EyeOff className="w-3 h-3 text-[#555]" />}
              </button>

              {filters.showWeatherLayer && (
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#090d10] border border-[#00e5ff]/30 rounded-[2px]">
                  <button
                    onClick={() => { soundManager.playClick(); onSetWeatherMode('precipitation'); }}
                    className={`py-1 px-1 text-[8px] tracking-wider rounded-[2px] font-bold uppercase transition-colors flex items-center justify-center gap-1 ${
                      filters.weatherLayerMode === 'precipitation'
                        ? 'bg-[#00e5ff] text-black font-black'
                        : 'text-[#888] hover:text-[#eee] bg-[#111]'
                    }`}
                  >
                    <CloudRain className="w-2.5 h-2.5" /> RAIN DOPPLER
                  </button>
                  <button
                    onClick={() => { soundManager.playClick(); onSetWeatherMode('wind'); }}
                    className={`py-1 px-1 text-[8px] tracking-wider rounded-[2px] font-bold uppercase transition-colors flex items-center justify-center gap-1 ${
                      filters.weatherLayerMode === 'wind'
                        ? 'bg-[#ff8800] text-black font-black'
                        : 'text-[#888] hover:text-[#eee] bg-[#111]'
                    }`}
                  >
                    <Wind className="w-2.5 h-2.5" /> WIND SPEED
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => { soundManager.playClick(); onToggleFilter('showRadarSweep'); }}
              className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] bg-[#0e0e0e] border border-[#1f1f1f] text-[#bbb] hover:border-[#333]"
            >
              <span>RADAR SWEEP BEAM</span>
              {filters.showRadarSweep ? <Eye className="w-3 h-3 text-[#00ff88]" /> : <EyeOff className="w-3 h-3 text-[#555]" />}
            </button>

            <button
              onClick={() => { soundManager.playClick(); onToggleFilter('showSectors'); }}
              className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] bg-[#0e0e0e] border border-[#1f1f1f] text-[#bbb] hover:border-[#333]"
            >
              <span>FIELD BOUNDARIES</span>
              {filters.showSectors ? <Eye className="w-3 h-3 text-[#00ff88]" /> : <EyeOff className="w-3 h-3 text-[#555]" />}
            </button>

            <button
              onClick={() => { soundManager.playClick(); onToggleFilter('showFlightPaths'); }}
              className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] bg-[#0e0e0e] border border-[#1f1f1f] text-[#bbb] hover:border-[#333]"
            >
              <span>DRONE FLIGHT TRAILS</span>
              {filters.showFlightPaths ? <Eye className="w-3 h-3 text-[#00ff88]" /> : <EyeOff className="w-3 h-3 text-[#555]" />}
            </button>

            <button
              onClick={() => { soundManager.playClick(); onToggleFilter('showGridHUD'); }}
              className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] bg-[#0e0e0e] border border-[#1f1f1f] text-[#bbb] hover:border-[#333]"
            >
              <span>TACTICAL HUD RETICLE</span>
              {filters.showGridHUD ? <Eye className="w-3 h-3 text-[#00ff88]" /> : <EyeOff className="w-3 h-3 text-[#555]" />}
            </button>
          </div>
        )}
      </div>

      {/* Region Presets */}
      <div className="border-t border-[#1a1a1a] p-2">
        <button
          onClick={() => { soundManager.playClick(); setPresetsOpen(!presetsOpen); }}
          className="w-full flex items-center justify-between text-[9.5px] font-mono text-[#888] hover:text-[#ccc] py-0.5"
        >
          <span className="flex items-center gap-1 tracking-wider">
            REGIONAL SECTORS
          </span>
          {presetsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {presetsOpen && (
          <div className="mt-1 space-y-1 text-[8.5px] font-mono">
            {presetLocations.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  soundManager.playClick();
                  onSelectPreset(preset);
                }}
                className={`w-full text-left px-2 py-1 rounded-[2px] border transition-colors ${
                  currentPresetId === preset.id
                    ? 'bg-[#ff8800]/20 border-[#ff8800]/50 text-[#ff8800]'
                    : 'bg-[#0e0e0e] border-[#1a1a1a] text-[#888] hover:text-[#ccc]'
                }`}
              >
                <div className="font-bold">{preset.name}</div>
                <div className="text-[7.5px] text-[#555]">{preset.region}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
