import { GoogleGenAI } from '@google/genai';
import { Asset, Sector, TelemetryEvent } from '../types';

interface TacticalAIResponse {
  message: string;
  recommendedAction?: {
    type: 'irrigate' | 'rth' | 'ndvi' | 'inspect';
    targetId: string;
    description: string;
  };
}

export async function queryTacticalAI(
  prompt: string,
  context: {
    assets: Asset[];
    sectors: Sector[];
    events: TelemetryEvent[];
    regionName: string;
  }
): Promise<TacticalAIResponse> {
  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY;

  const criticalSectors = context.sectors.filter((s) => s.alertLevel === 'critical');
  const moderateSectors = context.sectors.filter((s) => s.alertLevel === 'moderate');
  const activeAssets = context.assets.filter((a) => a.status === 'active' || a.status === 'online');

  // Build telemetry context snippet
  const contextSummary = `
REGION: ${context.regionName}
ACTIVE ASSETS (${activeAssets.length}): ${activeAssets.map((a) => `${a.callsign} (${a.type}, Batt: ${a.batteryPct}%, Status: ${a.status})`).join(', ')}
CRITICAL SECTORS (${criticalSectors.length}): ${criticalSectors.map((s) => `${s.id} (${s.name}, Crop: ${s.crop}, Soil: ${s.soilMoisturePct}%, Alert: ${s.alertLevel})`).join(', ')}
MODERATE SECTORS (${moderateSectors.length}): ${moderateSectors.map((s) => `${s.id} (${s.name}, Soil: ${s.soilMoisturePct}%)`).join(', ')}
RECENT TELEMETRY EVENTS: ${context.events.slice(0, 4).map((e) => `[${e.timestamp}] ${e.assetName}: ${e.message}`).join(' | ')}
  `.trim();

  // If real Gemini API key is configured, use official @google/genai SDK
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `
You are the Tactical Operations & Agri-Telemetry AI Officer (Callsign: ARES-AGRI) in the GeoTactical console.
Your tone is professional, concise, military/tactical yet deeply grounded in precision agronomy, IoT telemetry, and autonomous fleet operations.
Keep your answers brief (2-4 sentences max), sharp, and action-oriented.
Current telemetry context:
${contextSummary}
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const text = response.text || 'Telemetry analyzed. No anomalies requiring immediate override.';
      return { message: text };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to tactical simulation engine:', err);
    }
  }

  // Tactical Rule-based Intelligent Offline Copilot (when no API key or offline)
  const lowerPrompt = prompt.toLowerCase();

  // 1. Irrigation requests
  if (lowerPrompt.includes('su') || lowerPrompt.includes('irrigation') || lowerPrompt.includes('drip') || lowerPrompt.includes('moisture') || lowerPrompt.includes('nem')) {
    if (criticalSectors.length > 0) {
      const target = criticalSectors[0];
      return {
        message: `TACTICAL ALERT: ${target.name} (${target.id}) reports critical soil moisture (${target.soilMoisturePct}%). Recommend immediate pulse drip cycle at 4.0 bar.`,
        recommendedAction: {
          type: 'irrigate',
          targetId: target.id,
          description: `Execute drip irrigation for ${target.name}`,
        },
      };
    }
    return {
      message: `SOIL SURVEY: All monitored parcel moisture levels are currently within safe operational ranges. Average canopy hydration index is nominal.`,
    };
  }

  // 2. Drone / RTH / Recon
  if (lowerPrompt.includes('drone') || lowerPrompt.includes('uav') || lowerPrompt.includes('rth') || lowerPrompt.includes('uç') || lowerPrompt.includes('dön')) {
    const drone = context.assets.find((a) => a.type === 'drone');
    if (drone) {
      return {
        message: `AIRBORNE UNIT ${drone.callsign}: Cruising at ${drone.altitudeMeters}m AGL (${drone.speedKmh} km/h). Battery at ${drone.batteryPct}%, telemetry signal ${drone.signalPct}%. Ready to accept RTH or multispectral waypoint missions.`,
        recommendedAction: {
          type: 'rth',
          targetId: drone.id,
          description: `Recall ${drone.callsign} to primary launchpad`,
        },
      };
    }
  }

  // 3. Anomaly / Diagnostic general overview
  if (lowerPrompt.includes('durum') || lowerPrompt.includes('status') || lowerPrompt.includes('anomali') || lowerPrompt.includes('report') || lowerPrompt.includes('özet')) {
    const alertText = criticalSectors.length > 0 
      ? `Critical anomalies detected in ${criticalSectors.length} sector(s) (${criticalSectors.map(s => s.id).join(', ')}).`
      : 'All monitored agricultural sectors are currently in optimal condition.';
    return {
      message: `TACTICAL BRIEFING [${context.regionName}]: ${activeAssets.length} active nodes transmitting. ${alertText} Weather front telemetry stable. Automated surveillance sweep in progress.`,
    };
  }

  // Default context response
  return {
    message: `OPERATIONAL ACKNOWLEDGE: Telemetry buffer cross-checked against [${context.regionName}]. ${criticalSectors.length} critical sectors logged. Fleet status: ${activeAssets.length} nodes online with RTK precision fix.`,
  };
}
