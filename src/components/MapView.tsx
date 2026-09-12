import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker, StyleSpecification } from 'maplibre-gl';
import { 
  Crosshair, 
  Plus, 
  Minus, 
  Compass, 
  Layers, 
  Eye, 
  Radio, 
  Plane, 
  Tractor,
  Maximize2,
  CloudRain,
  Wind,
  Thermometer,
  Gauge
} from 'lucide-react';
import { Asset, Sector, FilterSettings, MapStyleMode, PresetLocation, WeatherLayerMode } from '../types';
import { soundManager } from '../utils/audio';
import { generateWeatherGrid } from '../data/weatherData';

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
}

const TACTICAL_DARK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

const SATELLITE_RECON_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics'
    }
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export default function MapView({
  assets,
  sectors,
  selectedAsset,
  selectedSector,
  onSelectAsset,
  onSelectSector,
  filters,
  onSetWeatherMode,
  mapStyle,
  currentPreset,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<{ [id: string]: Marker }>({});
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pitch, setPitch] = useState<number>(currentPreset.pitch);
  const [bearing, setBearing] = useState<number>(currentPreset.bearing);
  const [zoom, setZoom] = useState<number>(currentPreset.zoom);
  const weatherTimeRef = useRef<number>(0);
  const [weatherStats, setWeatherStats] = useState({
    maxPrecip: 38.4,
    avgWindSpeed: 28.5,
    stormHeading: 235
  });
  const [weatherHudMinimized, setWeatherHudMinimized] = useState<boolean>(false);

  // Initialize map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyle = mapStyle === 'satellite_recon' ? SATELLITE_RECON_STYLE : TACTICAL_DARK_STYLE;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: currentPreset.center,
      zoom: currentPreset.zoom,
      pitch: currentPreset.pitch,
      bearing: currentPreset.bearing,
      attributionControl: false
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: parseFloat(e.lngLat.lat.toFixed(5)),
        lng: parseFloat(e.lngLat.lng.toFixed(5))
      });
    });

    map.on('rotate', () => {
      setBearing(Math.round(map.getBearing()));
    });

    map.on('pitch', () => {
      setPitch(Math.round(map.getPitch()));
    });

    map.on('zoom', () => {
      setZoom(parseFloat(map.getZoom().toFixed(1)));
    });

    map.on('load', () => {
      initMapLayers(map);
    });

    mapRef.current = map;

    return () => {
      // Clean up markers and map instance
      (Object.values(markersRef.current) as Marker[]).forEach((m) => m.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle map style changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const targetStyle = mapStyle === 'satellite_recon' ? SATELLITE_RECON_STYLE : TACTICAL_DARK_STYLE;
    map.setStyle(targetStyle);

    map.once('style.load', () => {
      initMapLayers(map);
    });
  }, [mapStyle]);

  // Handle preset location jumps
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: currentPreset.center,
      zoom: currentPreset.zoom,
      pitch: currentPreset.pitch,
      bearing: currentPreset.bearing,
      essential: true,
      duration: 1500
    });
  }, [currentPreset]);

  // Pan to selected asset
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedAsset) return;

    map.easeTo({
      center: [selectedAsset.lng, selectedAsset.lat],
      zoom: Math.max(map.getZoom(), 15),
      duration: 1000
    });
  }, [selectedAsset]);

  // Function to initialize vector polygon & flight path layers
  const initMapLayers = (map: MapLibreMap) => {
    // 1. Add Sector GeoJSON
    const sectorFeatures = sectors.map((s) => ({
      type: 'Feature' as const,
      properties: {
        id: s.id,
        name: s.name,
        crop: s.crop,
        alertLevel: s.alertLevel,
        moisture: s.soilMoisturePct,
        ndvi: s.ndviHealth
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [s.polygon]
      }
    }));

    if (!map.getSource('sectors-source')) {
      map.addSource('sectors-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: sectorFeatures
        }
      });

      // Fill Layer
      map.addLayer({
        id: 'sectors-fill',
        type: 'fill',
        source: 'sectors-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'alertLevel'],
            'critical', '#ff0033',
            'moderate', '#ff8800',
            '#00ff88'
          ],
          'fill-opacity': 0.12
        }
      });

      // Border Outline Layer
      map.addLayer({
        id: 'sectors-line',
        type: 'line',
        source: 'sectors-source',
        paint: {
          'line-color': [
            'match',
            ['get', 'alertLevel'],
            'critical', '#ff0033',
            'moderate', '#ff8800',
            '#00ff88'
          ],
          'line-width': 1.5,
          'line-dasharray': [4, 2]
        }
      });

      // Interactive Click on Sectors
      map.on('click', 'sectors-fill', (e) => {
        if (!e.features || !e.features[0]) return;
        const featureId = e.features[0].properties?.id;
        const matchedSector = sectors.find((s) => s.id === featureId);
        if (matchedSector) {
          soundManager.playTargetAcquired();
          onSelectSector(matchedSector);
        }
      });

      map.on('mouseenter', 'sectors-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'sectors-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    // 2. Add Drone Flight Waypoints Trail
    const droneWithWaypoints = assets.find((a) => a.waypoints && a.waypoints.length > 0);
    if (droneWithWaypoints && droneWithWaypoints.waypoints) {
      if (!map.getSource('flight-trail-source')) {
        map.addSource('flight-trail-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: droneWithWaypoints.waypoints
            }
          }
        });

        // Glowing outer blur
        map.addLayer({
          id: 'flight-trail-glow',
          type: 'line',
          source: 'flight-trail-source',
          paint: {
            'line-color': '#00ff88',
            'line-width': 4,
            'line-opacity': 0.3,
            'line-blur': 3
          }
        });

        // Core sharp dash
        map.addLayer({
          id: 'flight-trail-line',
          type: 'line',
          source: 'flight-trail-source',
          paint: {
            'line-color': '#00ff88',
            'line-width': 1.5,
            'line-dasharray': [3, 2],
            'line-opacity': 0.8
          }
        });
      }
    }

    // 3. Add Weather GeoJSON Source & Heatmap Layers
    const initialWeatherData = generateWeatherGrid(currentPreset.center[0], currentPreset.center[1], 0);
    setWeatherStats({
      maxPrecip: initialWeatherData.maxPrecip,
      avgWindSpeed: initialWeatherData.avgWindSpeed,
      stormHeading: initialWeatherData.stormCellHeading
    });

    if (!map.getSource('weather-source')) {
      map.addSource('weather-source', {
        type: 'geojson',
        data: initialWeatherData.geojson
      });

      // Precipitation Heatmap Layer (Doppler Radar)
      map.addLayer({
        id: 'weather-precip-heatmap',
        type: 'heatmap',
        source: 'weather-source',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'precipitation'],
            0, 0,
            4, 0.2,
            15, 0.55,
            35, 1.0
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.9,
            15, 2.0
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.15, 'rgba(0, 160, 255, 0.45)', // light blue
            0.35, 'rgba(0, 255, 136, 0.7)',  // moderate green
            0.55, 'rgba(255, 230, 0, 0.85)', // yellow heavy
            0.75, 'rgba(255, 130, 0, 0.92)', // orange storm
            1.0, 'rgba(255, 0, 60, 0.98)'    // intense downpour red
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 25,
            14, 55,
            17, 95
          ],
          'heatmap-opacity': 0.82
        },
        layout: {
          visibility: filters.showWeatherLayer && filters.weatherLayerMode === 'precipitation' ? 'visible' : 'none'
        }
      }, 'sectors-line');

      // Wind Speed Heatmap Layer
      map.addLayer({
        id: 'weather-wind-heatmap',
        type: 'heatmap',
        source: 'weather-source',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'windSpeed'],
            10, 0.1,
            25, 0.35,
            45, 0.7,
            70, 1.0
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.8,
            15, 1.8
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.2, 'rgba(20, 50, 170, 0.45)',  // navy
            0.4, 'rgba(0, 229, 255, 0.7)',   // cyan
            0.6, 'rgba(180, 255, 0, 0.85)',  // lime
            0.8, 'rgba(255, 140, 0, 0.92)',  // amber
            1.0, 'rgba(255, 0, 200, 0.98)'   // magenta
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 30,
            14, 60,
            17, 100
          ],
          'heatmap-opacity': 0.78
        },
        layout: {
          visibility: filters.showWeatherLayer && filters.weatherLayerMode === 'wind' ? 'visible' : 'none'
        }
      }, 'sectors-line');

      // Wind Velocity Vector Scatter Dots Layer
      map.addLayer({
        id: 'weather-wind-dots',
        type: 'circle',
        source: 'weather-source',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 1.5,
            15, 3.5
          ],
          'circle-color': '#00e5ff',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.75
        },
        layout: {
          visibility: filters.showWeatherLayer && filters.weatherLayerMode === 'wind' ? 'visible' : 'none'
        }
      });
    }
  };

  // Sync layer visibility based on filters
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    try {
      if (map.getLayer('sectors-fill')) {
        map.setLayoutProperty('sectors-fill', 'visibility', filters.showSectors ? 'visible' : 'none');
      }
      if (map.getLayer('sectors-line')) {
        map.setLayoutProperty('sectors-line', 'visibility', filters.showSectors ? 'visible' : 'none');
      }
      if (map.getLayer('flight-trail-glow')) {
        map.setLayoutProperty('flight-trail-glow', 'visibility', filters.showFlightPaths ? 'visible' : 'none');
      }
      if (map.getLayer('flight-trail-line')) {
        map.setLayoutProperty('flight-trail-line', 'visibility', filters.showFlightPaths ? 'visible' : 'none');
      }

      // Weather Heatmap Layer visibility sync
      if (map.getLayer('weather-precip-heatmap')) {
        map.setLayoutProperty(
          'weather-precip-heatmap',
          'visibility',
          filters.showWeatherLayer && filters.weatherLayerMode === 'precipitation' ? 'visible' : 'none'
        );
      }
      if (map.getLayer('weather-wind-heatmap')) {
        map.setLayoutProperty(
          'weather-wind-heatmap',
          'visibility',
          filters.showWeatherLayer && filters.weatherLayerMode === 'wind' ? 'visible' : 'none'
        );
      }
      if (map.getLayer('weather-wind-dots')) {
        map.setLayoutProperty(
          'weather-wind-dots',
          'visibility',
          filters.showWeatherLayer && filters.weatherLayerMode === 'wind' ? 'visible' : 'none'
        );
      }
    } catch {
      // ignore
    }
  }, [filters.showSectors, filters.showFlightPaths, filters.showWeatherLayer, filters.weatherLayerMode]);

  // Periodic weather drift animation
  useEffect(() => {
    if (!filters.showWeatherLayer) return;

    const interval = setInterval(() => {
      weatherTimeRef.current += 3;
      const map = mapRef.current;
      if (!map) return;

      const weatherSource = map.getSource('weather-source') as maplibregl.GeoJSONSource | undefined;
      if (weatherSource && typeof weatherSource.setData === 'function') {
        const data = generateWeatherGrid(currentPreset.center[0], currentPreset.center[1], weatherTimeRef.current);
        weatherSource.setData(data.geojson);
        setWeatherStats({
          maxPrecip: data.maxPrecip,
          avgWindSpeed: data.avgWindSpeed,
          stormHeading: data.stormCellHeading
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [filters.showWeatherLayer, currentPreset]);

  // Update weather data when preset location changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const weatherSource = map.getSource('weather-source') as maplibregl.GeoJSONSource | undefined;
    if (weatherSource && typeof weatherSource.setData === 'function') {
      const data = generateWeatherGrid(currentPreset.center[0], currentPreset.center[1], weatherTimeRef.current);
      weatherSource.setData(data.geojson);
      setWeatherStats({
        maxPrecip: data.maxPrecip,
        avgWindSpeed: data.avgWindSpeed,
        stormHeading: data.stormCellHeading
      });
    }
  }, [currentPreset]);

  // Sync HTML markers for active assets
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    assets.forEach((asset) => {
      let marker = markersRef.current[asset.id];
      const isSelected = selectedAsset?.id === asset.id;

      if (!marker) {
        // Create custom HTML DOM marker
        const el = document.createElement('div');
        el.className = 'tactical-marker cursor-pointer select-none';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          soundManager.playTargetAcquired();
          onSelectAsset(asset);
        });

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([asset.lng, asset.lat])
          .addTo(map);

        markersRef.current[asset.id] = marker;
      } else {
        marker.setLngLat([asset.lng, asset.lat]);
      }

      // Update inner HTML of the marker
      const el = marker.getElement();
      const color = asset.status === 'warning' ? '#ff8800' : asset.status === 'active' ? '#00ff88' : '#00e5ff';
      const isDrone = asset.type === 'drone';
      const isTractor = asset.type === 'tractor';

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          ${isSelected ? `
            <div style="position: absolute; width: 44px; height: 44px; border: 1.5px dashed #ff8800; border-radius: 50%; animation: spin 8s linear infinite; pointer-events: none;"></div>
            <div style="position: absolute; width: 50px; height: 50px; border: 1px solid rgba(255,136,0,0.4); border-radius: 50%; pointer-events: none;"></div>
          ` : ''}
          <div style="
            width: 24px; 
            height: 24px; 
            background: #0a0a0a; 
            border: 1.5px solid ${color}; 
            border-radius: ${isDrone ? '50%' : '3px'}; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 0 8px ${color};
            transform: rotate(${isDrone || isTractor ? asset.headingDeg : 0}deg);
            transition: transform 0.3s ease;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              ${isDrone 
                ? '<polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>' 
                : isTractor 
                ? '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8" cy="18" r="2"></circle><circle cx="16" cy="18" r="2"></circle>'
                : '<circle cx="12" cy="12" r="3"></circle><path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>'
              }
            </svg>
          </div>
          <div style="
            background: rgba(10,10,10,0.9); 
            border: 1px solid rgba(255,255,255,0.15); 
            color: ${color}; 
            font-family: monospace; 
            font-size: 8px; 
            font-weight: bold; 
            padding: 1px 3px; 
            border-radius: 2px; 
            margin-top: 2px; 
            white-space: nowrap;
            letter-spacing: 0.05em;
          ">
            ${asset.callsign}
          </div>
        </div>
      `;
    });
  }, [assets, selectedAsset]);

  // Controls Handlers
  const handleZoomIn = () => {
    soundManager.playClick();
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    soundManager.playClick();
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleResetBearing = () => {
    soundManager.playClick();
    mapRef.current?.resetNorthPitch({ duration: 500 });
  };

  const handleToggle3D = () => {
    soundManager.playClick();
    const map = mapRef.current;
    if (!map) return;
    const currentPitch = map.getPitch();
    map.easeTo({
      pitch: currentPitch > 20 ? 0 : 55,
      duration: 600
    });
  };

  return (
    <div className="flex-1 relative min-h-[520px] bg-[#080808] overflow-hidden">
      {/* MapLibre DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

      {/* Rotating Radar Sweep Layer */}
      {filters.showRadarSweep && (
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
      {filters.showGridHUD && (
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

      {/* On-Map Weather Telemetry & Heatmap Legend HUD */}
      {filters.showWeatherLayer && (
        <div className="absolute top-3 left-3 z-10 font-mono select-none w-[240px] bg-[#0a0f14]/95 border border-[#00e5ff]/40 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0e1720] border-b border-[#00e5ff]/30 text-[10px]">
            <div className="flex items-center gap-1.5 text-[#00e5ff] font-bold tracking-wider">
              {filters.weatherLayerMode === 'precipitation' ? (
                <CloudRain className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
              ) : (
                <Wind className="w-3.5 h-3.5 text-[#ff8800] animate-pulse" />
              )}
              <span>RADAR METEOROLOGY</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
              <button
                onClick={() => setWeatherHudMinimized(!weatherHudMinimized)}
                className="text-[#777] hover:text-[#00e5ff] text-[9px] px-1"
                title="Toggle Minimized"
              >
                {weatherHudMinimized ? '+' : '—'}
              </button>
            </div>
          </div>

          {!weatherHudMinimized && (
            <div className="p-2 space-y-2">
              {/* Layer Mode Selector */}
              <div className="grid grid-cols-2 gap-1 bg-[#06090c] p-0.5 rounded-[2px] border border-[#162530]">
                <button
                  onClick={() => { soundManager.playClick(); onSetWeatherMode('precipitation'); }}
                  className={`py-1 text-[8px] font-bold tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center gap-1 ${
                    filters.weatherLayerMode === 'precipitation'
                      ? 'bg-[#00e5ff] text-black font-black shadow-[0_0_8px_#00e5ff]'
                      : 'text-[#888] hover:text-[#eee]'
                  }`}
                >
                  <CloudRain className="w-2.5 h-2.5" /> PRECIPITATION
                </button>
                <button
                  onClick={() => { soundManager.playClick(); onSetWeatherMode('wind'); }}
                  className={`py-1 text-[8px] font-bold tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center gap-1 ${
                    filters.weatherLayerMode === 'wind'
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
                  <span>{filters.weatherLayerMode === 'precipitation' ? 'DOPPLER (mm/h)' : 'VELOCITY (km/h)'}</span>
                  <span className="text-[#00e5ff]">HEATMAP</span>
                </div>
                
                {/* Gradient Bar */}
                <div className="h-2 w-full rounded-[1px] border border-white/10 overflow-hidden relative">
                  {filters.weatherLayerMode === 'precipitation' ? (
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-[#00a0ff] via-[#00ff88] via-[#ffe600] via-[#ff8200] to-[#ff003c]" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-[#1432a0] via-[#00e5ff] via-[#b4ff00] via-[#ff8c00] to-[#ff00c8]" />
                  )}
                </div>

                {/* Ticks */}
                <div className="flex justify-between text-[7.5px] text-[#888] font-mono">
                  {filters.weatherLayerMode === 'precipitation' ? (
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
                    {filters.weatherLayerMode === 'precipitation' ? 'PEAK CELL' : 'PEAK GUST'}
                  </div>
                  <div className="text-[#00e5ff] font-bold text-[9.5px] mt-0.5">
                    {filters.weatherLayerMode === 'precipitation' 
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
      )}

      {/* Map Control Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 font-mono select-none">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-[2px] bg-[#0a0a0a]/90 border border-[#222] text-[#e6e6e6] hover:text-[#00ff88] hover:border-[#00ff88]/50 flex items-center justify-center transition-colors shadow-md"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-[2px] bg-[#0a0a0a]/90 border border-[#222] text-[#e6e6e6] hover:text-[#00ff88] hover:border-[#00ff88]/50 flex items-center justify-center transition-colors shadow-md"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetBearing}
          className="w-8 h-8 rounded-[2px] bg-[#0a0a0a]/90 border border-[#222] text-[#e6e6e6] hover:text-[#00ff88] hover:border-[#00ff88]/50 flex items-center justify-center transition-colors shadow-md"
          title="Reset North Heading"
        >
          <Compass className="w-4 h-4" style={{ transform: `rotate(${-bearing}deg)` }} />
        </button>

        <button
          onClick={handleToggle3D}
          className={`w-8 h-8 rounded-[2px] border text-[9px] font-bold flex items-center justify-center transition-colors shadow-md ${
            pitch > 10 
              ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88]' 
              : 'bg-[#0a0a0a]/90 border-[#222] text-[#888] hover:text-[#ccc]'
          }`}
          title="Toggle 3D Pitch View"
        >
          3D
        </button>
      </div>

      {/* Coordinates HUD in bottom-left */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#0a0a0a]/90 border border-[#1a1a1a] rounded-[2px] px-2 py-1 font-mono text-[9px] text-[#888] flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
          <span className="text-[#00ff88] font-bold">WGS-84</span>
        </span>
        <span>Z: {zoom}</span>
        <span>BRG: {bearing}°</span>
        <span>PITCH: {pitch}°</span>
      </div>
    </div>
  );
}
