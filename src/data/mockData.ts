import { Asset, Sector, TelemetryEvent, PresetLocation } from '../types';

export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'aegean_agro',
    name: 'Aegean Agri-Corridor',
    region: 'Gediz Basin, Sector 4',
    center: [27.428, 38.618],
    zoom: 14.5,
    pitch: 50,
    bearing: -24
  },
  {
    id: 'california_delta',
    name: 'San Joaquin Farmlands',
    region: 'Central Valley, California',
    center: [-121.482, 38.012],
    zoom: 14.0,
    pitch: 45,
    bearing: 15
  },
  {
    id: 'rhine_basin',
    name: 'Rhine Valley Terraces',
    region: 'Baden Agri-Territories',
    center: [7.842, 48.583],
    zoom: 14.2,
    pitch: 42,
    bearing: -10
  }
];

export const INITIAL_SECTORS: Sector[] = [
  {
    id: 'SEC-A1',
    name: 'Sector A1 - Durum Wheat',
    crop: 'Durum Wheat (Triticum durum)',
    areaHa: 42.8,
    ndviHealth: 0.82,
    soilMoisturePct: 38.4,
    irrigationStatus: 'optimal' as unknown as 'active',
    alertLevel: 'optimal',
    polygon: [
      [27.418, 38.625],
      [27.426, 38.626],
      [27.428, 38.621],
      [27.420, 38.619],
      [27.418, 38.625]
    ]
  },
  {
    id: 'SEC-B2',
    name: 'Sector B2 - Drip Olive Grove',
    crop: 'Ayvalık Olives (Olea europaea)',
    areaHa: 28.5,
    ndviHealth: 0.74,
    soilMoisturePct: 29.1,
    irrigationStatus: 'required',
    alertLevel: 'moderate',
    polygon: [
      [27.427, 38.626],
      [27.436, 38.627],
      [27.438, 38.622],
      [27.429, 38.620],
      [27.427, 38.626]
    ]
  },
  {
    id: 'SEC-C3',
    name: 'Sector C3 - Vineyard High-Trellis',
    crop: 'Sultana Grapes (Vitis vinifera)',
    areaHa: 34.2,
    ndviHealth: 0.88,
    soilMoisturePct: 41.2,
    irrigationStatus: 'active',
    alertLevel: 'optimal',
    polygon: [
      [27.420, 38.618],
      [27.429, 38.619],
      [27.431, 38.614],
      [27.422, 38.612],
      [27.420, 38.618]
    ]
  },
  {
    id: 'SEC-D4',
    name: 'Sector D4 - Organic Tomato & Corn',
    crop: 'Hybrid Sweetcorn & Processing Tomato',
    areaHa: 19.6,
    ndviHealth: 0.58,
    soilMoisturePct: 21.8,
    irrigationStatus: 'required',
    alertLevel: 'critical',
    polygon: [
      [27.430, 38.620],
      [27.439, 38.621],
      [27.441, 38.615],
      [27.432, 38.613],
      [27.430, 38.620]
    ]
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'UAV-ALPHA',
    name: 'Recon Drone Alpha',
    callsign: 'AGRA-01',
    type: 'drone',
    status: 'active',
    lat: 38.6225,
    lng: 27.4278,
    altitudeMeters: 65,
    speedKmh: 34.2,
    headingDeg: 42,
    batteryPct: 84,
    signalPct: 96,
    temperatureC: 24.8,
    humidityPct: 48,
    ndviIndex: 0.79,
    sectorId: 'SEC-A1',
    mission: 'Multispectral NDVI Canopy Sweep',
    lastPing: 'Just now',
    waypoints: [
      [27.419, 38.624],
      [27.425, 38.625],
      [27.435, 38.623],
      [27.431, 38.616],
      [27.422, 38.615],
      [27.419, 38.624]
    ]
  },
  {
    id: 'UAV-BRAVO',
    name: 'Precision Sprayer Bravo',
    callsign: 'AERO-09',
    type: 'drone',
    status: 'standby',
    lat: 38.6172,
    lng: 27.4221,
    altitudeMeters: 0,
    speedKmh: 0,
    headingDeg: 180,
    batteryPct: 98,
    signalPct: 99,
    temperatureC: 22.1,
    humidityPct: 52,
    sectorId: 'SEC-C3',
    mission: 'Pad Docked - Ready for Organic Spray',
    lastPing: '1m ago',
    waypoints: []
  },
  {
    id: 'TRACTOR-01',
    name: 'Autonomous Rig T-900',
    callsign: 'TERRA-4',
    type: 'tractor',
    status: 'active',
    lat: 38.6208,
    lng: 27.4245,
    altitudeMeters: 142,
    speedKmh: 7.8,
    headingDeg: 88,
    batteryPct: 71,
    signalPct: 94,
    temperatureC: 48.5,
    soilMoisturePct: 37.2,
    sectorId: 'SEC-A1',
    mission: 'Laser Guided Furrow & Tillage',
    lastPing: '2s ago'
  },
  {
    id: 'SENSOR-SOUTH',
    name: 'Soil Probe Node S-4',
    callsign: 'TELEM-04',
    type: 'sensor_cluster',
    status: 'online',
    lat: 38.6184,
    lng: 27.4355,
    altitudeMeters: 140,
    speedKmh: 0,
    headingDeg: 0,
    batteryPct: 92,
    signalPct: 88,
    temperatureC: 21.5,
    humidityPct: 62,
    soilMoisturePct: 22.4,
    sectorId: 'SEC-D4',
    mission: 'Continuous Soil Salinity & Volumetric Moisture',
    lastPing: '5s ago'
  },
  {
    id: 'IRRIG-CTRL-12',
    name: 'Smart Irrigation Hub 12',
    callsign: 'VALVE-12',
    type: 'irrigation_node',
    status: 'warning',
    lat: 38.6214,
    lng: 27.4332,
    altitudeMeters: 138,
    speedKmh: 0,
    headingDeg: 0,
    batteryPct: 89,
    signalPct: 78,
    temperatureC: 27.0,
    humidityPct: 70,
    soilMoisturePct: 28.5,
    sectorId: 'SEC-B2',
    mission: 'Pressure Regulating Valve / Drip Line Flow',
    lastPing: '8s ago'
  },
  {
    id: 'SENTINEL-02',
    name: 'Perimeter Sentinel Lidar',
    callsign: 'WATCH-2',
    type: 'sentinel',
    status: 'online',
    lat: 27.4402,
    lng: 38.6178, // inverted check will be safe
    altitudeMeters: 154,
    speedKmh: 0,
    headingDeg: 315,
    batteryPct: 100,
    signalPct: 97,
    temperatureC: 23.4,
    mission: '360° Thermal Intrusion & Wildlife Perimeter Watch',
    lastPing: '1s ago'
  }
];

// Fix sentinel coordinates if inverted
INITIAL_ASSETS[5].lat = 38.6178;
INITIAL_ASSETS[5].lng = 27.4402;

export const INITIAL_EVENTS: TelemetryEvent[] = [
  {
    id: 'EVT-1008',
    timestamp: '12:51:42',
    assetId: 'UAV-ALPHA',
    assetName: 'Recon Drone Alpha',
    severity: 'info',
    message: 'Multispectral scan pass #4 complete for Sector A1. Average NDVI 0.81.'
  },
  {
    id: 'EVT-1007',
    timestamp: '12:49:15',
    assetId: 'IRRIG-CTRL-12',
    assetName: 'Smart Irrigation Hub 12',
    severity: 'warning',
    message: 'Low pressure anomaly detected in manifold line B (3.2 bar vs expected 4.0 bar).'
  },
  {
    id: 'EVT-1006',
    timestamp: '12:44:02',
    assetId: 'SENSOR-SOUTH',
    assetName: 'Soil Probe Node S-4',
    severity: 'alert',
    message: 'Soil moisture dropped below critical threshold (21.8%) in Sector D4.'
  },
  {
    id: 'EVT-1005',
    timestamp: '12:40:11',
    assetId: 'TRACTOR-01',
    assetName: 'Autonomous Rig T-900',
    severity: 'success',
    message: 'Waypoint cluster 08 reached. Steer lock accuracy ±1.4cm (RTK Fix OK).'
  },
  {
    id: 'EVT-1004',
    timestamp: '12:35:00',
    assetName: 'Base Station Central',
    severity: 'info',
    message: 'Telemetry network heartbeat synchronized. All 6 nodes responding.'
  }
];
