import { GeoJSON } from 'geojson';

export interface WeatherDataPoint {
  coordinates: [number, number]; // [lng, lat]
  precipitation: number;         // mm/hr (0 to 50)
  windSpeed: number;             // km/h (5 to 80)
  windHeading: number;           // degrees (0 to 360)
  tempC: number;
}

// Generate a high-resolution grid of simulated meteorological points around a center coordinate
export function generateWeatherGrid(
  centerLng: number, 
  centerLat: number, 
  timeOffsetSec: number = 0
): {
  geojson: GeoJSON.FeatureCollection;
  maxPrecip: number;
  avgWindSpeed: number;
  stormCellHeading: number;
} {
  const points: GeoJSON.Feature[] = [];
  const rows = 14;
  const cols = 14;
  const step = 0.0035; // ~380m resolution
  const startLng = centerLng - (cols / 2) * step;
  const startLat = centerLat - (rows / 2) * step;

  // Storm cell movement offset
  const driftX = (timeOffsetSec * 0.00008) % (cols * step);
  const driftY = (timeOffsetSec * 0.00005) % (rows * step);

  let maxPrecip = 0;
  let totalWind = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lng = startLng + c * step;
      const lat = startLat + r * step;

      // Simulated rain front using radial Gaussian + sinusoidal wave
      const dx = (lng - centerLng + 0.008 - driftX) * 220;
      const dy = (lat - centerLat + 0.005 - driftY) * 220;
      const distSq = dx * dx + dy * dy;

      // Two precipitation clusters (frontal rain band and convection cell)
      const cell1 = Math.exp(-distSq / 1.8) * 38;
      
      const dx2 = (lng - centerLng - 0.012 - driftX * 0.8) * 200;
      const dy2 = (lat - centerLat - 0.008 - driftY * 0.8) * 200;
      const cell2 = Math.exp(-(dx2 * dx2 + dy2 * dy2) / 2.2) * 26;

      // Wave noise
      const noise = Math.sin(r * 0.8 + timeOffsetSec * 0.1) * Math.cos(c * 0.8) * 3.5;
      const rawPrecip = Math.max(0, cell1 + cell2 + noise);
      const precip = parseFloat(rawPrecip.toFixed(1));

      // Wind field: prevailing southwest with thermal deflection
      const baseWind = 24 + Math.sin(c * 0.5 + timeOffsetSec * 0.05) * 8 + (cell1 > 10 ? 18 : 0);
      const windSpeed = parseFloat(baseWind.toFixed(1));
      const windHeading = Math.round((225 + Math.sin(r * 0.4) * 25 + Math.cos(c * 0.4) * 15) % 360);
      const tempC = parseFloat((22 - precip * 0.15).toFixed(1));

      if (precip > maxPrecip) maxPrecip = precip;
      totalWind += windSpeed;

      points.push({
        type: 'Feature',
        properties: {
          id: `WX-${r}-${c}`,
          precipitation: precip,
          windSpeed: windSpeed,
          windHeading: windHeading,
          tempC: tempC
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    }
  }

  return {
    geojson: {
      type: 'FeatureCollection',
      features: points
    },
    maxPrecip,
    avgWindSpeed: parseFloat((totalWind / points.length).toFixed(1)),
    stormCellHeading: 235
  };
}
