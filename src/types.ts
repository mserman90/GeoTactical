export type AssetType = 'drone' | 'tractor' | 'sensor_cluster' | 'sentinel' | 'irrigation_node';

export type AssetStatus = 'online' | 'active' | 'warning' | 'standby' | 'offline';

export interface Asset {
  id: string;
  name: string;
  callsign: string;
  type: AssetType;
  status: AssetStatus;
  lat: number;
  lng: number;
  altitudeMeters: number;
  speedKmh: number;
  headingDeg: number;
  batteryPct: number;
  signalPct: number;
  temperatureC: number;
  humidityPct?: number;
  soilMoisturePct?: number;
  ndviIndex?: number;
  sectorId?: string;
  mission: string;
  lastPing: string;
  waypoints?: [number, number][]; // [lng, lat]
}

export interface Sector {
  id: string;
  name: string;
  crop: string;
  areaHa: number;
  ndviHealth: number; // 0 to 1
  soilMoisturePct: number;
  irrigationStatus: 'active' | 'scheduled' | 'idle' | 'required';
  alertLevel: 'optimal' | 'moderate' | 'critical';
  polygon: [number, number][]; // [lng, lat]
}

export type EventSeverity = 'info' | 'warning' | 'alert' | 'success';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  assetId?: string;
  assetName: string;
  severity: EventSeverity;
  message: string;
  coords?: [number, number];
}

export type MapStyleMode = 'tactical_dark' | 'satellite_recon' | 'monochrome_radar';

export type WeatherLayerMode = 'precipitation' | 'wind';

export interface FilterSettings {
  showDrones: boolean;
  showTractors: boolean;
  showSensors: boolean;
  showSectors: boolean;
  showFlightPaths: boolean;
  showRadarSweep: boolean;
  showGridHUD: boolean;
  showWeatherLayer: boolean;
  weatherLayerMode: WeatherLayerMode;
}

export interface PresetLocation {
  id: string;
  name: string;
  region: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
}
