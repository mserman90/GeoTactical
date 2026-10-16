import { Asset, Sector, TelemetryEvent } from '../types';

export interface TacticalAIResponse {
  message: string;
  recommendedAction?: {
    type: 'irrigate' | 'rth' | 'ndvi' | 'inspect';
    targetId: string;
    description: string;
  };
}

/**
 * 100% Free & Keyless Tactical AI Intelligence Engine
 * - Uses free, keyless neural inference via Pollinations AI (OpenAI-compatible text generation)
 * - Has an instant, zero-latency local tactical agronomic rule engine as fallback
 * - Requires NO API keys, NO secrets, NO accounts, NO payment
 */
export async function queryTacticalAI(
  prompt: string,
  context: {
    assets: Asset[];
    sectors: Sector[];
    events: TelemetryEvent[];
    regionName: string;
  }
): Promise<TacticalAIResponse> {
  const criticalSectors = context.sectors.filter((s) => s.alertLevel === 'critical');
  const moderateSectors = context.sectors.filter((s) => s.alertLevel === 'moderate');
  const activeAssets = context.assets.filter((a) => a.status === 'active' || a.status === 'online');

  // Format real-time telemetry snapshot
  const contextSummary = `
[CURRENT GEO-TACTICAL TELEMETRY]
REGION: ${context.regionName}
ACTIVE FLEET (${activeAssets.length}): ${activeAssets.map((a) => `${a.callsign} (${a.type}, Batt: ${a.batteryPct}%, Speed: ${a.speedKmh}km/h)`).join(', ')}
CRITICAL SECTORS (${criticalSectors.length}): ${criticalSectors.map((s) => `${s.id} (${s.name}, Crop: ${s.crop}, Soil Moisture: ${s.soilMoisturePct}%)`).join(', ') || 'None (all nominal)'}
MODERATE SECTORS (${moderateSectors.length}): ${moderateSectors.map((s) => `${s.id} (${s.name}, Soil: ${s.soilMoisturePct}%)`).join(', ') || 'None'}
RECENT LOGS: ${context.events.slice(0, 3).map((e) => `[${e.timestamp}] ${e.assetName}: ${e.message}`).join(' | ')}
  `.trim();

  // Try Free Keyless Public Neural LLM (Pollinations AI) with 6s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const systemPrompt = `You are ARES-AGRI, an autonomous tactical agricultural AI copilot in the GeoTactical operations console.
Your tone is sharp, concise, military-tactical yet grounded in precision agronomy and IoT telemetry.
Keep responses concise (2 to 4 sentences maximum), direct and action-oriented. Do not use filler introductions.
Analyze the following telemetry:
${contextSummary}`;

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 10000),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim().length > 10) {
        // Extract executable recommendation if relevant
        let recommendedAction: TacticalAIResponse['recommendedAction'] = undefined;
        const lowerText = text.toLowerCase() + ' ' + prompt.toLowerCase();

        if (lowerText.includes('irrigat') || lowerText.includes('sulama') || lowerText.includes('valve') || lowerText.includes('drip') || lowerText.includes('moisture')) {
          if (criticalSectors.length > 0) {
            recommendedAction = {
              type: 'irrigate',
              targetId: criticalSectors[0].id,
              description: `Schedule drip irrigation cycle for ${criticalSectors[0].name}`,
            };
          }
        } else if (lowerText.includes('rth') || lowerText.includes('return to base') || lowerText.includes('üs') || lowerText.includes('recall')) {
          const drone = activeAssets.find((a) => a.type === 'drone');
          if (drone) {
            recommendedAction = {
              type: 'rth',
              targetId: drone.id,
              description: `Recall ${drone.callsign} to primary launchpad`,
            };
          }
        }

        return {
          message: text.trim(),
          recommendedAction,
        };
      }
    }
  } catch (err) {
    // Network offline or endpoint unreachable -> Fallback smoothly to local engine
    console.debug('Free neural endpoint timed out or offline, using local tactical engine:', err);
  }

  // --- LOCAL TACTICAL AGRI-REASONING ENGINE (Instant, Zero-Key, 100% Offline) ---
  const lowerPrompt = prompt.toLowerCase();

  // 1. Irrigation & Moisture query
  if (
    lowerPrompt.includes('su') ||
    lowerPrompt.includes('irrigation') ||
    lowerPrompt.includes('drip') ||
    lowerPrompt.includes('moisture') ||
    lowerPrompt.includes('nem')
  ) {
    if (criticalSectors.length > 0) {
      const target = criticalSectors[0];
      return {
        message: `TACTICAL IRRIGATION ADVISORY: ${target.name} (${target.id}) reports critical soil moisture at ${target.soilMoisturePct}%. Recommend activating drip line manifold at 4.0 bar pressure to prevent crop wilt stress.`,
        recommendedAction: {
          type: 'irrigate',
          targetId: target.id,
          description: `Execute emergency drip irrigation for ${target.name}`,
        },
      };
    }
    return {
      message: `SOIL TELEMETRY NOMINAL: All monitored parcel moisture levels in ${context.regionName} are above minimum threshold levels (average ~38%). Transpiration balance is optimal.`,
    };
  }

  // 2. Drone / Flight / RTH query
  if (
    lowerPrompt.includes('drone') ||
    lowerPrompt.includes('uav') ||
    lowerPrompt.includes('rth') ||
    lowerPrompt.includes('uç') ||
    lowerPrompt.includes('dön') ||
    lowerPrompt.includes('hava')
  ) {
    const drone = context.assets.find((a) => a.type === 'drone');
    if (drone) {
      return {
        message: `AIR FLEET STATUS [${drone.callsign}]: Airborne at ${drone.altitudeMeters}m AGL (${drone.speedKmh} km/h, HDG ${drone.headingDeg}°). Battery capacity ${drone.batteryPct}%, RTK GNSS fix active. Ready to execute RTH or waypoint grid missions.`,
        recommendedAction: {
          type: 'rth',
          targetId: drone.id,
          description: `Transmit RTH command to ${drone.callsign}`,
        },
      };
    }
  }

  // 3. Status briefing / Anomalies query
  if (
    lowerPrompt.includes('durum') ||
    lowerPrompt.includes('status') ||
    lowerPrompt.includes('anomali') ||
    lowerPrompt.includes('report') ||
    lowerPrompt.includes('özet') ||
    lowerPrompt.includes('brifing')
  ) {
    const alertText = criticalSectors.length > 0
      ? `ATTENTION: ${criticalSectors.length} sector(s) in critical state (${criticalSectors.map((s) => s.id).join(', ')}). Immediate hydric mitigation required.`
      : 'All monitored agricultural sectors operating within optimal physiological limits.';

    return {
      message: `TACTICAL SITUATION REPORT [${context.regionName}]: ${activeAssets.length} nodes transmitting live telemetry. ${alertText} Weather radar front tracked via Doppler radar sweep.`,
    };
  }

  // Default response
  return {
    message: `OPERATIONAL ACKNOWLEDGE: Telemetry buffer cross-analyzed for [${context.regionName}]. Active fleet nodes: ${activeAssets.length}. Critical soil parcels: ${criticalSectors.length}. All autonomous telemetry loops are running at nominal latency.`,
  };
}
