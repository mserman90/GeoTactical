import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import MapView from './components/MapView';
import RightSidebar from './components/RightSidebar';
import BottomBar from './components/BottomBar';
import { 
  Asset, 
  Sector, 
  TelemetryEvent, 
  FilterSettings, 
  MapStyleMode, 
  PresetLocation,
  WeatherLayerMode 
} from './types';
import { 
  INITIAL_ASSETS, 
  INITIAL_SECTORS, 
  INITIAL_EVENTS, 
  PRESET_LOCATIONS 
} from './data/mockData';
import { soundManager } from './utils/audio';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [sectors, setSectors] = useState<Sector[]>(INITIAL_SECTORS);
  const [events, setEvents] = useState<TelemetryEvent[]>(INITIAL_EVENTS);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('UAV-ALPHA');
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  
  const [mapStyle, setMapStyle] = useState<MapStyleMode>('tactical_dark');
  const [currentPreset, setCurrentPreset] = useState<PresetLocation>(PRESET_LOCATIONS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);

  const [filters, setFilters] = useState<FilterSettings>({
    showDrones: true,
    showTractors: true,
    showSensors: true,
    showSectors: true,
    showFlightPaths: true,
    showRadarSweep: true,
    showGridHUD: true,
    showWeatherLayer: true,
    weatherLayerMode: 'precipitation'
  });

  const waypointStepRef = useRef<number>(0);

  // Simulation loop: update drone and tractor coordinates, simulate live pings
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      waypointStepRef.current += 1;
      const step = waypointStepRef.current;

      setAssets((prev) =>
        prev.map((asset) => {
          // Animate Recon Drone Alpha along its flight path
          if (asset.id === 'UAV-ALPHA' && asset.status === 'active' && asset.waypoints && asset.waypoints.length > 0) {
            const numWp = asset.waypoints.length;
            const currentWpIndex = Math.floor(step / 6) % numWp;
            const nextWpIndex = (currentWpIndex + 1) % numWp;
            const progress = (step % 6) / 6;

            const [curLng, curLat] = asset.waypoints[currentWpIndex];
            const [nextLng, nextLat] = asset.waypoints[nextWpIndex];

            const newLng = curLng + (nextLng - curLng) * progress;
            const newLat = curLat + (nextLat - curLat) * progress;

            // Calculate bearing
            const dy = nextLat - curLat;
            const dx = nextLng - curLng;
            const heading = Math.round((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;

            return {
              ...asset,
              lng: parseFloat(newLng.toFixed(5)),
              lat: parseFloat(newLat.toFixed(5)),
              headingDeg: heading,
              speedKmh: parseFloat((32 + Math.sin(step) * 3).toFixed(1)),
              altitudeMeters: Math.round(65 + Math.sin(step * 0.5) * 4),
              lastPing: 'Just now'
            };
          }

          // Subtle update for tractor
          if (asset.id === 'TRACTOR-01' && asset.status === 'active') {
            const shiftLat = Math.sin(step * 0.1) * 0.00008;
            const shiftLng = Math.cos(step * 0.1) * 0.00012;
            return {
              ...asset,
              lat: parseFloat((asset.lat + shiftLat).toFixed(5)),
              lng: parseFloat((asset.lng + shiftLng).toFixed(5)),
              speedKmh: parseFloat((7.6 + Math.cos(step) * 0.4).toFixed(1)),
              lastPing: 'Just now'
            };
          }

          return asset;
        })
      );

      // Periodically add realistic telemetry events (every ~18 seconds)
      if (step % 9 === 0) {
        const now = new Date();
        const timeStr = now.toTimeString().substring(0, 8);
        const randomDrone = assets.find((a) => a.id === 'UAV-ALPHA');

        const newEvent: TelemetryEvent = {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          timestamp: timeStr,
          assetId: 'UAV-ALPHA',
          assetName: 'Recon Drone Alpha',
          severity: 'info',
          message: `Periodic multispectral telemetry ping received. Sensor array at [${randomDrone?.lat.toFixed(4)}, ${randomDrone?.lng.toFixed(4)}].`
        };

        setEvents((prev) => [newEvent, ...prev.slice(0, 29)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, assets]);

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAssetId(asset.id);
    setSelectedSectorId(null);
  };

  const handleSelectSector = (sector: Sector) => {
    setSelectedSectorId(sector.id);
    setSelectedAssetId(null);
  };

  const handleClearSelection = () => {
    setSelectedAssetId(null);
    setSelectedSectorId(null);
  };

  const handleToggleFilter = <K extends keyof FilterSettings>(key: K) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSetWeatherMode = (mode: WeatherLayerMode) => {
    setFilters((prev) => ({ ...prev, weatherLayerMode: mode }));
  };

  const handleSelectPreset = (preset: PresetLocation) => {
    setCurrentPreset(preset);
  };

  const handleResetView = () => {
    setCurrentPreset({ ...currentPreset });
  };

  const handleTriggerAction = (assetId: string, actionName: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 8);

    let message = '';
    let severity: TelemetryEvent['severity'] = 'info';

    if (actionName === 'RTH') {
      message = `RTH command acknowledged by ${target.callsign}. Returning to primary launchpad dock.`;
      severity = 'warning';
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, status: 'standby', mission: 'Aborting - Returning to Base' } : a))
      );
    } else if (actionName === 'NDVI_SCAN') {
      message = `High-resolution multispectral scan initiated over Sector. Radiometer calibrated.`;
      severity = 'success';
    } else if (actionName === 'PULSE_IRRIGATION') {
      message = `High pressure valve opened at Node 12. Regulated to 4.0 bar. Drip lines flowing.`;
      severity = 'success';
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, status: 'active', mission: 'Main Valve Open - 4.0 bar' } : a))
      );
    } else {
      message = `Diagnostic routine [${actionName}] executed successfully for ${target.callsign}.`;
      severity = 'info';
    }

    const newEvt: TelemetryEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      assetId: target.id,
      assetName: target.name,
      severity,
      message
    };

    setEvents((prev) => [newEvt, ...prev.slice(0, 29)]);
  };

  const handleTriggerSectorIrrigation = (sectorId: string) => {
    const sector = sectors.find((s) => s.id === sectorId);
    if (!sector) return;

    setSectors((prev) =>
      prev.map((s) =>
        s.id === sectorId
          ? {
              ...s,
              soilMoisturePct: Math.min(100, s.soilMoisturePct + 12),
              irrigationStatus: 'active',
              alertLevel: 'optimal'
            }
          : s
      )
    );

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 8);

    const newEvt: TelemetryEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      assetName: `Irrigation System [${sector.id}]`,
      severity: 'success',
      message: `Emergency drip irrigation cycle scheduled for ${sector.name}. Volumetric moisture target: 45%.`
    };

    setEvents((prev) => [newEvt, ...prev.slice(0, 29)]);
  };

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;
  const selectedSector = sectors.find((s) => s.id === selectedSectorId) || null;

  const activeAssetCount = assets.filter((a) => a.status === 'active' || a.status === 'online').length;
  const alertCount = sectors.filter((s) => s.alertLevel === 'critical').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#060606] text-[#e6e6e6] font-mono selection:bg-[#00ff88]/30">
      {/* Top Header */}
      <Header
        mapStyle={mapStyle}
        onStyleChange={setMapStyle}
        activeAssetCount={activeAssetCount}
        alertCount={alertCount}
        onResetView={handleResetView}
      />

      {/* Main workspace container: Left sidebar + Map canvas + Right details drawer */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Left target & layer controls */}
        <LeftSidebar
          assets={assets}
          sectors={sectors}
          selectedAssetId={selectedAssetId}
          selectedSectorId={selectedSectorId}
          onSelectAsset={handleSelectAsset}
          onSelectSector={handleSelectSector}
          filters={filters}
          onToggleFilter={handleToggleFilter}
          onSetWeatherMode={handleSetWeatherMode}
          presetLocations={PRESET_LOCATIONS}
          currentPresetId={currentPreset.id}
          onSelectPreset={handleSelectPreset}
        />

        {/* Center MapLibre GL instance */}
        <MapView
          assets={assets}
          sectors={sectors}
          selectedAsset={selectedAsset}
          selectedSector={selectedSector}
          onSelectAsset={handleSelectAsset}
          onSelectSector={handleSelectSector}
          filters={filters}
          onSetWeatherMode={handleSetWeatherMode}
          mapStyle={mapStyle}
          currentPreset={currentPreset}
        />

        {/* Right real-time telemetry & log stream */}
        <RightSidebar
          selectedAsset={selectedAsset}
          selectedSector={selectedSector}
          onClearSelection={handleClearSelection}
          events={events}
          onTriggerAction={handleTriggerAction}
          onTriggerSectorIrrigation={handleTriggerSectorIrrigation}
          onClearLogs={() => setEvents([])}
          isOpen={rightPanelOpen}
          onToggleOpen={() => setRightPanelOpen(!rightPanelOpen)}
        />
      </div>

      {/* Bottom Status / Telemetry Bar */}
      <BottomBar
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        activeAssetCount={activeAssetCount}
        sectorCount={sectors.length}
      />
    </div>
  );
}
