import type { StyleSpecification } from 'maplibre-gl';
import { MapStyleMode } from '../../types';

export type MapStyleDefinition = StyleSpecification | string;

/**
 * OpenFreeMap Dark Vector Map Style URL
 * 100% Free, Open-Source, Zero API Keys, Zero Rate Limits, No Registration.
 * Native vector style specifically built for MapLibre GL JS.
 */
export const OPENFREEMAP_DARK_URL = 'https://tiles.openfreemap.org/styles/dark';

/**
 * Keyless Offline Dark Raster Fallback (Desaturated/Inverted OpenStreetMap)
 * In case vector tiles are unavailable or strictly offline raster is needed.
 */
export const OFFLINE_DARK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-dark-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-dark-layer',
      type: 'raster',
      source: 'osm-dark-tiles',
      paint: {
        'raster-saturation': -1,
        'raster-brightness-max': 0.35,
        'raster-contrast': 0.4,
      },
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

/**
 * Tactical Dark Base Map
 * Uses OpenFreeMap Dark vector style (100% Free & Keyless, no Carto API key required).
 */
export const TACTICAL_DARK_STYLE: MapStyleDefinition = OPENFREEMAP_DARK_URL;

/**
 * Satellite Recon Aerial Imagery Base Map (ESRI World Imagery)
 * 100% Free, Keyless, High-resolution photographic satellite imagery from Maxar & USGS.
 */
export const SATELLITE_RECON_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics, USDA, USGS',
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

/**
 * Topographic Terrain & Elevation Relief Base Map (ESRI World Topo Map)
 * 100% Free, Keyless, Shaded relief and elevation contours for slope and watershed analysis.
 */
export const TERRAIN_TOPO_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-topo': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri, HERE, Garmin, USGS, EPA, NPS',
    },
  },
  layers: [
    {
      id: 'esri-topo-layer',
      type: 'raster',
      source: 'esri-topo',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

/**
 * OpenStreetMap Standard Base Map (OSM Standard)
 * 100% Free, Open-Source, Community-maintained global cartographic database (Zero Keys).
 */
export const OSM_STANDARD_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-standard': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-standard-layer',
      type: 'raster',
      source: 'osm-standard',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const MAP_STYLES: Record<MapStyleMode, MapStyleDefinition> = {
  tactical_dark: TACTICAL_DARK_STYLE,
  satellite_recon: SATELLITE_RECON_STYLE,
  terrain_topo: TERRAIN_TOPO_STYLE,
  osm_standard: OSM_STANDARD_STYLE,
};

export const MAP_STYLE_INFO: Record<MapStyleMode, { name: string; shortName: string; provider: string; description: string }> = {
  tactical_dark: {
    name: 'Tactical Dark',
    shortName: 'DARK',
    provider: 'OpenFreeMap Dark Vector',
    description: 'High-contrast dark vector GIS built for MapLibre with zero API keys or limits (replaces Carto)',
  },
  satellite_recon: {
    name: 'Satellite Recon',
    shortName: 'SATELLITE',
    provider: 'ESRI World Imagery',
    description: 'High-resolution photographic earth observation (Free & Keyless)',
  },
  terrain_topo: {
    name: 'Terrain Topo',
    shortName: 'TOPO',
    provider: 'ESRI Topographic Relief',
    description: 'Elevation contours and shaded relief for slope & terrain evaluation (Free & Keyless)',
  },
  osm_standard: {
    name: 'OpenStreetMap',
    shortName: 'OSM',
    provider: 'OpenStreetMap Standard',
    description: '100% open-source community cartography (Free & Keyless)',
  },
};

export function getMapStyle(mode: MapStyleMode): MapStyleDefinition {
  return MAP_STYLES[mode] || TACTICAL_DARK_STYLE;
}
