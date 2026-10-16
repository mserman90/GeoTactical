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

// --- AEGEAN AGRI-CORRIDOR DATA ---
const AEGEAN_SECTORS: Sector[] = [
  {
    id: 'SEC-A1',
    name: 'Sector A1 - Durum Wheat',
    crop: 'Durum Wheat (Triticum durum)',
    areaHa: 42.8,
    ndviHealth: 0.82,
    soilMoisturePct: 38.4,
    irrigationStatus: 'active',
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

const AEGEAN_ASSETS: Asset[] = [
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
    lat: 38.6178,
    lng: 27.4402,
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

const AEGEAN_EVENTS: TelemetryEvent[] = [
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

// --- CALIFORNIA SAN JOAQUIN FARMLANDS DATA ---
const CALIFORNIA_SECTORS: Sector[] = [
  {
    id: 'SEC-CAL-1',
    name: 'Sector C1 - Almond Orchard Delta',
    crop: 'Nonpareil Almonds (Prunus dulcis)',
    areaHa: 68.4,
    ndviHealth: 0.85,
    soilMoisturePct: 36.2,
    irrigationStatus: 'active',
    alertLevel: 'optimal',
    polygon: [
      [-121.490, 38.018],
      [-121.478, 38.019],
      [-121.476, 38.013],
      [-121.488, 38.012],
      [-121.490, 38.018]
    ]
  },
  {
    id: 'SEC-CAL-2',
    name: 'Sector C2 - Pistachio Grove North',
    crop: 'Kerman Pistachio (Pistacia vera)',
    areaHa: 52.0,
    ndviHealth: 0.78,
    soilMoisturePct: 27.4,
    irrigationStatus: 'required',
    alertLevel: 'moderate',
    polygon: [
      [-121.477, 38.019],
      [-121.465, 38.020],
      [-121.463, 38.014],
      [-121.475, 38.013],
      [-121.477, 38.019]
    ]
  },
  {
    id: 'SEC-CAL-3',
    name: 'Sector C3 - Processing Alfalfa Pivot',
    crop: 'Medicago sativa (Certified Alfalfa)',
    areaHa: 94.5,
    ndviHealth: 0.61,
    soilMoisturePct: 22.0,
    irrigationStatus: 'required',
    alertLevel: 'critical',
    polygon: [
      [-121.489, 38.011],
      [-121.477, 38.012],
      [-121.475, 38.005],
      [-121.487, 38.004],
      [-121.489, 38.011]
    ]
  }
];

const CALIFORNIA_ASSETS: Asset[] = [
  {
    id: 'UAV-CAL-1',
    name: 'Delta Recon Eagle',
    callsign: 'PACIFIC-1',
    type: 'drone',
    status: 'active',
    lat: 38.0155,
    lng: -121.4820,
    altitudeMeters: 80,
    speedKmh: 38.5,
    headingDeg: 120,
    batteryPct: 88,
    signalPct: 98,
    temperatureC: 28.2,
    humidityPct: 35,
    ndviIndex: 0.84,
    sectorId: 'SEC-CAL-1',
    mission: 'Thermal Canal Evapotranspiration Survey',
    lastPing: 'Just now',
    waypoints: [
      [-121.489, 38.017],
      [-121.479, 38.018],
      [-121.477, 38.014],
      [-121.487, 38.013],
      [-121.489, 38.017]
    ]
  },
  {
    id: 'TRACTOR-CAL',
    name: 'Autonomous Harvester T-850',
    callsign: 'VALLEY-2',
    type: 'tractor',
    status: 'active',
    lat: 38.0162,
    lng: -121.4795,
    altitudeMeters: 4,
    speedKmh: 9.2,
    headingDeg: 270,
    batteryPct: 75,
    signalPct: 92,
    temperatureC: 31.0,
    soilMoisturePct: 35.8,
    sectorId: 'SEC-CAL-1',
    mission: 'Precision Orchard Row Mulching',
    lastPing: '3s ago'
  },
  {
    id: 'IRRIG-CAL',
    name: 'Central Pivot Controller #4',
    callsign: 'PIVOT-04',
    type: 'irrigation_node',
    status: 'warning',
    lat: 38.0080,
    lng: -121.4810,
    altitudeMeters: 3,
    speedKmh: 0,
    headingDeg: 0,
    batteryPct: 94,
    signalPct: 85,
    temperatureC: 33.5,
    soilMoisturePct: 22.0,
    sectorId: 'SEC-CAL-3',
    mission: 'Deep Well Pumping & Variable Rate Pivot',
    lastPing: '6s ago'
  }
];

const CALIFORNIA_EVENTS: TelemetryEvent[] = [
  {
    id: 'EVT-CAL-1',
    timestamp: '09:14:22',
    assetId: 'UAV-CAL-1',
    assetName: 'Delta Recon Eagle',
    severity: 'info',
    message: 'Canal thermal leakage inspection logged for San Joaquin Delta Aqueduct.'
  },
  {
    id: 'EVT-CAL-2',
    timestamp: '09:08:15',
    assetId: 'IRRIG-CAL',
    assetName: 'Central Pivot Controller #4',
    severity: 'alert',
    message: 'Aquifer drawdown alarm: flow rate degraded by 18% in Sector C3.'
  }
];

// --- RHINE VALLEY TERRACES DATA ---
const RHINE_SECTORS: Sector[] = [
  {
    id: 'SEC-RH-1',
    name: 'Sector R1 - Steep Slope Riesling',
    crop: 'Riesling Grand Cru (Vitis vinifera)',
    areaHa: 26.2,
    ndviHealth: 0.91,
    soilMoisturePct: 44.5,
    irrigationStatus: 'optimal' as unknown as 'active',
    alertLevel: 'optimal',
    polygon: [
      [7.835, 48.588],
      [7.846, 48.590],
      [7.848, 48.583],
      [7.837, 48.581],
      [7.835, 48.588]
    ]
  },
  {
    id: 'SEC-RH-2',
    name: 'Sector R2 - Spätburgunder Pinot Noir',
    crop: 'Baden Pinot Noir',
    areaHa: 19.8,
    ndviHealth: 0.83,
    soilMoisturePct: 39.0,
    irrigationStatus: 'active',
    alertLevel: 'optimal',
    polygon: [
      [7.847, 48.589],
      [7.858, 48.591],
      [7.860, 48.584],
      [7.849, 48.582],
      [7.847, 48.589]
    ]
  },
  {
    id: 'SEC-RH-3',
    name: 'Sector R3 - Black Forest Hops & Barley',
    crop: 'Tettnanger Hops & Winter Barley',
    areaHa: 38.0,
    ndviHealth: 0.69,
    soilMoisturePct: 24.8,
    irrigationStatus: 'required',
    alertLevel: 'critical',
    polygon: [
      [7.838, 48.580],
      [7.850, 48.581],
      [7.852, 48.574],
      [7.840, 48.573],
      [7.838, 48.580]
    ]
  }
];

const RHINE_ASSETS: Asset[] = [
  {
    id: 'UAV-RH-1',
    name: 'Alpine Survey Hexacopter',
    callsign: 'RHINE-01',
    type: 'drone',
    status: 'active',
    lat: 48.5855,
    lng: 7.8435,
    altitudeMeters: 92,
    speedKmh: 31.0,
    headingDeg: 35,
    batteryPct: 82,
    signalPct: 97,
    temperatureC: 18.4,
    humidityPct: 68,
    ndviIndex: 0.89,
    sectorId: 'SEC-RH-1',
    mission: 'High Altitude Steep Terrace Photogrammetry',
    lastPing: 'Just now',
    waypoints: [
      [7.837, 48.587],
      [7.845, 48.589],
      [7.847, 48.584],
      [7.839, 48.582],
      [7.837, 48.587]
    ]
  },
  {
    id: 'SENSOR-RH',
    name: 'Frost & Microclimate Sentinel',
    callsign: 'FROST-1',
    type: 'sensor_cluster',
    status: 'online',
    lat: 48.5840,
    lng: 7.8450,
    altitudeMeters: 220,
    speedKmh: 0,
    headingDeg: 0,
    batteryPct: 96,
    signalPct: 91,
    temperatureC: 16.2,
    humidityPct: 74,
    soilMoisturePct: 43.1,
    sectorId: 'SEC-RH-1',
    mission: 'Terrace Cold Air Drainage & Downslope Wind Tracking',
    lastPing: '4s ago'
  }
];

const RHINE_EVENTS: TelemetryEvent[] = [
  {
    id: 'EVT-RH-1',
    timestamp: '16:02:40',
    assetId: 'UAV-RH-1',
    assetName: 'Alpine Survey Hexacopter',
    severity: 'info',
    message: 'Terrace slope gradient mapped. Maximum incline 42° in Sector R1.'
  },
  {
    id: 'EVT-RH-2',
    timestamp: '15:58:12',
    assetId: 'SENSOR-RH',
    assetName: 'Frost & Microclimate Sentinel',
    severity: 'warning',
    message: 'Inversion layer forming: valley floor temperature dropping to 11.4°C.'
  }
];

export function getRegionalData(presetId: string): {
  sectors: Sector[];
  assets: Asset[];
  events: TelemetryEvent[];
} {
  switch (presetId) {
    case 'california_delta':
      return {
        sectors: CALIFORNIA_SECTORS,
        assets: CALIFORNIA_ASSETS,
        events: CALIFORNIA_EVENTS
      };
    case 'rhine_basin':
      return {
        sectors: RHINE_SECTORS,
        assets: RHINE_ASSETS,
        events: RHINE_EVENTS
      };
    case 'aegean_agro':
    default:
      return {
        sectors: AEGEAN_SECTORS,
        assets: AEGEAN_ASSETS,
        events: AEGEAN_EVENTS
      };
  }
}

export const INITIAL_SECTORS: Sector[] = AEGEAN_SECTORS;
export const INITIAL_ASSETS: Asset[] = AEGEAN_ASSETS;
export const INITIAL_EVENTS: TelemetryEvent[] = AEGEAN_EVENTS;
