import type { StyleSpecification } from 'maplibre-gl';
import { MapStyleMode } from '../../types';

/**
 * Tactical Dark Raster Base Map (Carto Dark Matter)
 * 100% Free, Keyless, High-contrast for military HUD overlays and night telemetry.
 */
export const TACTICAL_DARK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

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
 * OpenStreetMap Standard Base Map (OSM Carto)
 * 100% Free, Open-Source, Community-maintained global cartographic database.
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

export const MAP_STYLES: Record<MapStyleMode, StyleSpecification> = {
  tactical_dark: TACTICAL_DARK_STYLE,
  satellite_recon: SATELLITE_RECON_STYLE,
  terrain_topo: TERRAIN_TOPO_STYLE,
  osm_standard: OSM_STANDARD_STYLE,
};

export const MAP_STYLE_INFO: Record<MapStyleMode, { name: string; shortName: string; provider: string; description: string }> = {
  tactical_dark: {
    name: 'Tactical Dark',
    shortName: 'DARK',
    provider: 'CARTO Dark Matter / OSM',
    description: 'High-contrast dark vector raster for tactical night ops and HUD overlays (Free & Keyless)',
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
    description: 'Open-source community cartography with complete land-use roads (Free & Keyless)',
  },
};

export function getMapStyle(mode: MapStyleMode): StyleSpecification {
  return MAP_STYLES[mode] || TACTICAL_DARK_STYLE;
}
