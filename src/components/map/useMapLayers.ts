import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import { Asset, Sector, FilterSettings, PresetLocation, EarthquakeEvent } from '../../types';
import { generateWeatherGrid } from '../../data/weatherData';
import { soundManager } from '../../utils/audio';

interface UseMapLayersProps {
  map: MapLibreMap | null;
  sectors: Sector[];
  assets: Asset[];
  onSelectSector: (sector: Sector) => void;
  filters: FilterSettings;
  currentPreset: PresetLocation;
  draftWaypoints?: [number, number][];
  earthquakes?: EarthquakeEvent[];
  onSelectEarthquake?: (quake: EarthquakeEvent) => void;
}

export function useMapLayers({
  map,
  sectors,
  assets,
  onSelectSector,
  filters,
  currentPreset,
  draftWaypoints = [],
  earthquakes = [],
  onSelectEarthquake,
}: UseMapLayersProps) {
  const weatherTimeRef = useRef<number>(0);
  const [weatherStats, setWeatherStats] = useState({
    maxPrecip: 38.4,
    avgWindSpeed: 28.5,
    stormHeading: 235,
  });

  // Setup all vector and raster layers on style load or initialization
  const initLayers = useCallback(
    (mapInstance: MapLibreMap) => {
      // 1. Add Sector GeoJSON
      const sectorFeatures = sectors.map((s) => ({
        type: 'Feature' as const,
        properties: {
          id: s.id,
          name: s.name,
          crop: s.crop,
          alertLevel: s.alertLevel,
          moisture: s.soilMoisturePct,
          ndvi: s.ndviHealth,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [s.polygon],
        },
      }));

      if (!mapInstance.getSource('sectors-source')) {
        mapInstance.addSource('sectors-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: sectorFeatures,
          },
        });

        // Fill Layer
        mapInstance.addLayer({
          id: 'sectors-fill',
          type: 'fill',
          source: 'sectors-source',
          paint: {
            'fill-color': [
              'match',
              ['get', 'alertLevel'],
              'critical', '#ff0033',
              'moderate', '#ff8800',
              '#00ff88',
            ],
            'fill-opacity': 0.12,
          },
        });

        // Border Outline Layer
        mapInstance.addLayer({
          id: 'sectors-line',
          type: 'line',
          source: 'sectors-source',
          paint: {
            'line-color': [
              'match',
              ['get', 'alertLevel'],
              'critical', '#ff0033',
              'moderate', '#ff8800',
              '#00ff88',
            ],
            'line-width': 1.5,
            'line-dasharray': [4, 2],
          },
        });

        // Interactive Click on Sectors
        mapInstance.on('click', 'sectors-fill', (e) => {
          if (!e.features || !e.features[0]) return;
          const featureId = e.features[0].properties?.id;
          const matchedSector = sectors.find((s) => s.id === featureId);
          if (matchedSector) {
            soundManager.playTargetAcquired();
            onSelectSector(matchedSector);
          }
        });

        mapInstance.on('mouseenter', 'sectors-fill', () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });
        mapInstance.on('mouseleave', 'sectors-fill', () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      }

      // 2. Add Drone Flight Waypoints Trail
      const droneWithWaypoints = assets.find((a) => a.waypoints && a.waypoints.length > 0);
      if (droneWithWaypoints && droneWithWaypoints.waypoints) {
        if (!mapInstance.getSource('flight-trail-source')) {
          mapInstance.addSource('flight-trail-source', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: droneWithWaypoints.waypoints,
              },
            },
          });

          // Glowing outer blur
          mapInstance.addLayer({
            id: 'flight-trail-glow',
            type: 'line',
            source: 'flight-trail-source',
            paint: {
              'line-color': '#00ff88',
              'line-width': 4,
              'line-opacity': 0.3,
              'line-blur': 3,
            },
          });

          // Core sharp dash
          mapInstance.addLayer({
            id: 'flight-trail-line',
            type: 'line',
            source: 'flight-trail-source',
            paint: {
              'line-color': '#00ff88',
              'line-width': 1.5,
              'line-dasharray': [3, 2],
              'line-opacity': 0.8,
            },
          });
        }
      }

      // 3. Add Weather GeoJSON Source & Heatmap Layers
      const initialWeatherData = generateWeatherGrid(currentPreset.center[0], currentPreset.center[1], 0);
      setWeatherStats({
        maxPrecip: initialWeatherData.maxPrecip,
        avgWindSpeed: initialWeatherData.avgWindSpeed,
        stormHeading: initialWeatherData.stormCellHeading,
      });

      if (!mapInstance.getSource('weather-source')) {
        mapInstance.addSource('weather-source', {
          type: 'geojson',
          data: initialWeatherData.geojson,
        });

        // Precipitation Heatmap Layer (Doppler Radar)
        mapInstance.addLayer(
          {
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
                35, 1.0,
              ],
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0.9,
                15, 2.0,
              ],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 0, 0)',
                0.15, 'rgba(0, 160, 255, 0.45)',
                0.35, 'rgba(0, 255, 136, 0.7)',
                0.55, 'rgba(255, 230, 0, 0.85)',
                0.75, 'rgba(255, 130, 0, 0.92)',
                1.0, 'rgba(255, 0, 60, 0.98)',
              ],
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 25,
                14, 55,
                17, 95,
              ],
              'heatmap-opacity': 0.82,
            },
            layout: {
              visibility:
                filters.showWeatherLayer && filters.weatherLayerMode === 'precipitation' ? 'visible' : 'none',
            },
          },
          'sectors-line'
        );

        // Wind Speed Heatmap Layer
        mapInstance.addLayer(
          {
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
                70, 1.0,
              ],
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0.8,
                15, 1.8,
              ],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 0, 0)',
                0.2, 'rgba(20, 50, 170, 0.45)',
                0.4, 'rgba(0, 229, 255, 0.7)',
                0.6, 'rgba(180, 255, 0, 0.85)',
                0.8, 'rgba(255, 140, 0, 0.92)',
                1.0, 'rgba(255, 0, 200, 0.98)',
              ],
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 30,
                14, 60,
                17, 100,
              ],
              'heatmap-opacity': 0.78,
            },
            layout: {
              visibility: filters.showWeatherLayer && filters.weatherLayerMode === 'wind' ? 'visible' : 'none',
            },
          },
          'sectors-line'
        );

        // Wind Velocity Vector Scatter Dots Layer
        mapInstance.addLayer({
          id: 'weather-wind-dots',
          type: 'circle',
          source: 'weather-source',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12, 1.5,
              15, 3.5,
            ],
            'circle-color': '#00e5ff',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.75,
          },
          layout: {
            visibility: filters.showWeatherLayer && filters.weatherLayerMode === 'wind' ? 'visible' : 'none',
          },
        });
      }

      // 4. Add Live AFAD / Regional Earthquake Layers
      const quakeFeatures = (earthquakes || []).map((q) => ({
        type: 'Feature' as const,
        properties: {
          id: q.id,
          magnitude: q.magnitude,
          depth: q.depth,
          location: q.location,
          time: q.time,
          provider: q.provider,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [q.lng, q.lat],
        },
      }));

      if (!mapInstance.getSource('earthquakes-source')) {
        mapInstance.addSource('earthquakes-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: quakeFeatures,
          },
        });

        // Pulsing / Blurred Glow Circle
        mapInstance.addLayer({
          id: 'earthquakes-glow',
          type: 'circle',
          source: 'earthquakes-source',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'magnitude'],
              1, 8,
              2.5, 16,
              4.0, 28,
              6.0, 48,
            ],
            'circle-color': [
              'case',
              ['>=', ['get', 'magnitude'], 4.0], '#ff0033',
              ['>=', ['get', 'magnitude'], 2.5], '#ff8800',
              '#00ff88',
            ],
            'circle-opacity': 0.25,
            'circle-blur': 0.8,
          },
          layout: {
            visibility: filters.showEarthquakes ? 'visible' : 'none',
          },
        });

        // Shockwave Outline Ring
        mapInstance.addLayer({
          id: 'earthquakes-outer',
          type: 'circle',
          source: 'earthquakes-source',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'magnitude'],
              1, 6,
              2.5, 12,
              4.0, 22,
              6.0, 36,
            ],
            'circle-color': 'transparent',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': [
              'case',
              ['>=', ['get', 'magnitude'], 4.0], '#ff0033',
              ['>=', ['get', 'magnitude'], 2.5], '#ff8800',
              '#00ff88',
            ],
            'circle-stroke-opacity': 0.85,
          },
          layout: {
            visibility: filters.showEarthquakes ? 'visible' : 'none',
          },
        });

        // Focal Epicenter Center Dot
        mapInstance.addLayer({
          id: 'earthquakes-center',
          type: 'circle',
          source: 'earthquakes-source',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'magnitude'],
              1, 3.5,
              2.5, 5.0,
              4.0, 7.5,
              6.0, 11,
            ],
            'circle-color': [
              'case',
              ['>=', ['get', 'magnitude'], 4.0], '#ff0033',
              ['>=', ['get', 'magnitude'], 2.5], '#ff8800',
              '#00ff88',
            ],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
          },
          layout: {
            visibility: filters.showEarthquakes ? 'visible' : 'none',
          },
        });

        // Click interaction on earthquake epicenters
        mapInstance.on('click', 'earthquakes-center', (e) => {
          if (!e.features || !e.features[0]) return;
          const feat = e.features[0];
          const quakeId = feat.properties?.id;
          const found = earthquakes.find((q) => q.id === quakeId);
          if (found && onSelectEarthquake) {
            soundManager.playTargetAcquired();
            onSelectEarthquake(found);
          }
        });

        mapInstance.on('mouseenter', 'earthquakes-center', () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });
        mapInstance.on('mouseleave', 'earthquakes-center', () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      }
    },
    [sectors, assets, currentPreset.center, filters.showWeatherLayer, filters.weatherLayerMode, filters.showEarthquakes, onSelectSector, earthquakes, onSelectEarthquake]
  );

  // Sync layer visibility based on filters
  useEffect(() => {
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

      // Earthquake Layers visibility sync
      if (map.getLayer('earthquakes-glow')) {
        map.setLayoutProperty('earthquakes-glow', 'visibility', filters.showEarthquakes ? 'visible' : 'none');
      }
      if (map.getLayer('earthquakes-outer')) {
        map.setLayoutProperty('earthquakes-outer', 'visibility', filters.showEarthquakes ? 'visible' : 'none');
      }
      if (map.getLayer('earthquakes-center')) {
        map.setLayoutProperty('earthquakes-center', 'visibility', filters.showEarthquakes ? 'visible' : 'none');
      }
    } catch {
      // ignore
    }
  }, [map, filters.showSectors, filters.showFlightPaths, filters.showWeatherLayer, filters.weatherLayerMode, filters.showEarthquakes]);

  // Periodic weather drift animation
  useEffect(() => {
    if (!filters.showWeatherLayer || !map) return;

    const interval = setInterval(() => {
      weatherTimeRef.current += 3;
      const weatherSource = map.getSource('weather-source') as GeoJSONSource | undefined;
      if (weatherSource && typeof weatherSource.setData === 'function') {
        const data = generateWeatherGrid(currentPreset.center[0], currentPreset.center[1], weatherTimeRef.current);
        weatherSource.setData(data.geojson);
        setWeatherStats({
          maxPrecip: data.maxPrecip,
          avgWindSpeed: data.avgWindSpeed,
          stormHeading: data.stormCellHeading,
        });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [filters.showWeatherLayer, currentPreset, map]);

  // Update weather data when preset location changes
  useEffect(() => {
    if (!map) return;

    const weatherSource = map.getSource('weather-source') as GeoJSONSource | undefined;
    if (weatherSource && typeof weatherSource.setData === 'function') {
      const data = generateWeatherGrid(currentPreset.center[0], currentPreset.center[1], weatherTimeRef.current);
      weatherSource.setData(data.geojson);
      setWeatherStats({
        maxPrecip: data.maxPrecip,
        avgWindSpeed: data.avgWindSpeed,
        stormHeading: data.stormCellHeading,
      });
    }
  }, [currentPreset, map]);

  // Synchronize sector polygons dynamically
  useEffect(() => {
    if (!map) return;
    const source = map.getSource('sectors-source') as GeoJSONSource | undefined;
    if (source && typeof source.setData === 'function') {
      const sectorFeatures = sectors.map((s) => ({
        type: 'Feature' as const,
        properties: {
          id: s.id,
          name: s.name,
          crop: s.crop,
          alertLevel: s.alertLevel,
          moisture: s.soilMoisturePct,
          ndvi: s.ndviHealth,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [s.polygon],
        },
      }));
      source.setData({
        type: 'FeatureCollection',
        features: sectorFeatures,
      });
    }
  }, [map, sectors]);

  // Synchronize active drone flight trail dynamically
  useEffect(() => {
    if (!map) return;
    const droneWithWaypoints = assets.find((a) => a.waypoints && a.waypoints.length > 0);
    const source = map.getSource('flight-trail-source') as GeoJSONSource | undefined;
    if (source && typeof source.setData === 'function' && droneWithWaypoints?.waypoints) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: droneWithWaypoints.waypoints,
        },
      });
    }
  }, [map, assets]);

  // Synchronize draft waypoint mission line dynamically
  useEffect(() => {
    if (!map) return;
    let source = map.getSource('draft-trail-source') as GeoJSONSource | undefined;

    if (!source && map.isStyleLoaded()) {
      try {
        map.addSource('draft-trail-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: draftWaypoints.length > 1 ? draftWaypoints : [],
            },
          },
        });

        map.addLayer({
          id: 'draft-trail-line',
          type: 'line',
          source: 'draft-trail-source',
          paint: {
            'line-color': '#00ff88',
            'line-width': 3,
            'line-dasharray': [2, 2],
          },
        });
        source = map.getSource('draft-trail-source') as GeoJSONSource | undefined;
      } catch {
        // ignore if already added
      }
    }

    if (source && typeof source.setData === 'function') {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: draftWaypoints.length > 1 ? draftWaypoints : [],
        },
      });
    }
  }, [map, draftWaypoints]);

  // Synchronize earthquake GeoJSON source dynamically
  useEffect(() => {
    if (!map) return;
    const source = map.getSource('earthquakes-source') as GeoJSONSource | undefined;
    if (source && typeof source.setData === 'function') {
      const quakeFeatures = (earthquakes || []).map((q) => ({
        type: 'Feature' as const,
        properties: {
          id: q.id,
          magnitude: q.magnitude,
          depth: q.depth,
          location: q.location,
          time: q.time,
          provider: q.provider,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [q.lng, q.lat],
        },
      }));
      source.setData({
        type: 'FeatureCollection',
        features: quakeFeatures,
      });
    }
  }, [map, earthquakes]);

  return {
    initLayers,
    weatherStats,
  };
}
