import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { Asset, Sector, FilterSettings, MapStyleMode, PresetLocation, WeatherLayerMode } from '../types';
import { soundManager } from '../utils/audio';
import { TACTICAL_DARK_STYLE, SATELLITE_RECON_STYLE } from './map/mapStyles';
import TacticalHudOverlay from './map/TacticalHudOverlay';
import WeatherTelemetryHud from './map/WeatherTelemetryHud';
import MapControls from './map/MapControls';
import WaypointPlannerHud from './map/WaypointPlannerHud';
import { useAssetMarkers } from './map/useAssetMarkers';
import { useMapLayers } from './map/useMapLayers';

interface MapViewProps {
  assets: Asset[];
  sectors: Sector[];
  selectedAsset: Asset | null;
  selectedSector: Sector | null;
  onSelectAsset: (asset: Asset) => void;
  onSelectSector: (sector: Sector) => void;
  filters: FilterSettings;
  onSetWeatherMode: (mode: WeatherLayerMode) => void;
  mapStyle: MapStyleMode;
  currentPreset: PresetLocation;
  isChaseCam: boolean;
  onToggleChaseCam: () => void;
  isPlanningRoute: boolean;
  onTogglePlanningRoute: () => void;
  planningWaypoints: [number, number][];
  onAddPlanningWaypoint: (coord: [number, number]) => void;
  onClearPlanningWaypoints: () => void;
  onCancelPlanningRoute: () => void;
  onDeployPlanningRoute: () => void;
}

export default function MapView({
  assets,
  sectors,
  selectedAsset,
  onSelectAsset,
  onSelectSector,
  filters,
  onSetWeatherMode,
  mapStyle,
  currentPreset,
  isChaseCam,
  onToggleChaseCam,
  isPlanningRoute,
  onTogglePlanningRoute,
  planningWaypoints,
  onAddPlanningWaypoint,
  onClearPlanningWaypoints,
  onCancelPlanningRoute,
  onDeployPlanningRoute,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pitch, setPitch] = useState<number>(currentPreset.pitch);
  const [bearing, setBearing] = useState<number>(currentPreset.bearing);
  const [zoom, setZoom] = useState<number>(currentPreset.zoom);

  // Initialize and synchronize vector layers and weather simulation
  const { initLayers, weatherStats } = useMapLayers({
    map,
    sectors,
    assets,
    onSelectSector,
    filters,
    currentPreset,
    draftWaypoints: planningWaypoints,
  });

  // Manage tactical DOM markers on the map
  useAssetMarkers({
    map,
    assets,
    selectedAsset,
    onSelectAsset,
    filters,
  });

  // Initialize MapLibre instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyle = mapStyle === 'satellite_recon' ? SATELLITE_RECON_STYLE : TACTICAL_DARK_STYLE;

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: currentPreset.center,
      zoom: currentPreset.zoom,
      pitch: currentPreset.pitch,
      bearing: currentPreset.bearing,
      attributionControl: false,
    });

    mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    mapInstance.on('mousemove', (e) => {
      setCursorCoords({
        lat: parseFloat(e.lngLat.lat.toFixed(5)),
        lng: parseFloat(e.lngLat.lng.toFixed(5)),
      });
    });

    mapInstance.on('rotate', () => {
      setBearing(Math.round(mapInstance.getBearing()));
    });

    mapInstance.on('pitch', () => {
      setPitch(Math.round(mapInstance.getPitch()));
    });

    mapInstance.on('zoom', () => {
      setZoom(parseFloat(mapInstance.getZoom().toFixed(1)));
    });

    mapInstance.on('load', () => {
      initLayers(mapInstance);
      setMap(mapInstance);
    });

    return () => {
      mapInstance.remove();
      setMap(null);
    };
  }, []);

  // Update cursor and handle waypoint clicks when planning route
  useEffect(() => {
    if (!map) return;

    const canvas = map.getCanvas();
    if (isPlanningRoute) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = '';
    }

    const clickHandler = (e: maplibregl.MapMouseEvent) => {
      if (!isPlanningRoute) return;
      onAddPlanningWaypoint([
        parseFloat(e.lngLat.lng.toFixed(5)),
        parseFloat(e.lngLat.lat.toFixed(5)),
      ]);
    };

    map.on('click', clickHandler);
    return () => {
      map.off('click', clickHandler);
    };
  }, [map, isPlanningRoute, onAddPlanningWaypoint]);

  // Handle map style changes
  useEffect(() => {
    if (!map) return;

    const targetStyle = mapStyle === 'satellite_recon' ? SATELLITE_RECON_STYLE : TACTICAL_DARK_STYLE;
    map.setStyle(targetStyle);

    map.once('style.load', () => {
      initLayers(map);
    });
  }, [mapStyle, map, initLayers]);

  // Handle preset location jumps
  useEffect(() => {
    if (!map) return;

    map.flyTo({
      center: currentPreset.center,
      zoom: currentPreset.zoom,
      pitch: currentPreset.pitch,
      bearing: currentPreset.bearing,
      essential: true,
      duration: 1500,
    });
  }, [currentPreset, map]);

  // Pan to selected asset / Chase Cam lock
  useEffect(() => {
    if (!map || !selectedAsset) return;

    if (isChaseCam) {
      map.easeTo({
        center: [selectedAsset.lng, selectedAsset.lat],
        duration: 1200,
        essential: true,
      });
    } else {
      map.easeTo({
        center: [selectedAsset.lng, selectedAsset.lat],
        zoom: Math.max(map.getZoom(), 15),
        duration: 1000,
      });
    }
  }, [selectedAsset?.lng, selectedAsset?.lat, isChaseCam, map]);

  // Controls Handlers
  const handleZoomIn = () => {
    soundManager.playClick();
    map?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    soundManager.playClick();
    map?.zoomOut({ duration: 300 });
  };

  const handleResetBearing = () => {
    soundManager.playClick();
    map?.resetNorthPitch({ duration: 500 });
  };

  const handleToggle3D = () => {
    soundManager.playClick();
    if (!map) return;
    const currentPitch = map.getPitch();
    map.easeTo({
      pitch: currentPitch > 20 ? 0 : 55,
      duration: 600,
    });
  };

  return (
    <div className="flex-1 relative min-h-[520px] bg-[#080808] overflow-hidden">
      {/* MapLibre DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

      {/* Reticle / Radar Sweep HUD Overlay */}
      <TacticalHudOverlay
        showRadarSweep={filters.showRadarSweep}
        showGridHUD={filters.showGridHUD}
        cursorCoords={cursorCoords}
        pitch={pitch}
        bearing={bearing}
      />

      {/* Interactive Waypoint Mission Planner HUD */}
      <WaypointPlannerHud
        isActive={isPlanningRoute}
        targetCallsign={selectedAsset?.callsign || 'UAV-PRIMARY'}
        waypoints={planningWaypoints}
        onClear={onClearPlanningWaypoints}
        onCancel={onCancelPlanningRoute}
        onDeploy={onDeployPlanningRoute}
      />

      {/* On-Map Weather Telemetry & Heatmap Legend HUD */}
      <WeatherTelemetryHud
        showWeatherLayer={filters.showWeatherLayer}
        weatherLayerMode={filters.weatherLayerMode}
        onSetWeatherMode={onSetWeatherMode}
        weatherStats={weatherStats}
      />

      {/* Map Control Buttons & Coordinates HUD */}
      <MapControls
        zoom={zoom}
        pitch={pitch}
        bearing={bearing}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetBearing={handleResetBearing}
        onToggle3D={handleToggle3D}
        isChaseCam={isChaseCam}
        onToggleChaseCam={onToggleChaseCam}
        canChaseCam={!!selectedAsset}
        isPlanningRoute={isPlanningRoute}
        onTogglePlanningRoute={onTogglePlanningRoute}
        canPlanRoute={selectedAsset?.type === 'drone'}
      />
    </div>
  );
}
