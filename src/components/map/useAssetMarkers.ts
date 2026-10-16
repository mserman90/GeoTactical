import { useEffect, useRef } from 'react';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import * as maplibregl from 'maplibre-gl';
import { Asset, FilterSettings } from '../../types';
import { soundManager } from '../../utils/audio';

interface UseAssetMarkersProps {
  map: MapLibreMap | null;
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
  filters: Pick<FilterSettings, 'showDrones' | 'showTractors' | 'showSensors'>;
}

export function useAssetMarkers({
  map,
  assets,
  selectedAsset,
  onSelectAsset,
  filters,
}: UseAssetMarkersProps) {
  const markersRef = useRef<{ [id: string]: Marker }>({});

  useEffect(() => {
    if (!map) return;

    // Filter assets based on active layer filters
    const visibleAssets = assets.filter((asset) => {
      if (asset.type === 'drone' && !filters.showDrones) return false;
      if (asset.type === 'tractor' && !filters.showTractors) return false;
      if (
        (asset.type === 'sensor_cluster' || asset.type === 'sentinel' || asset.type === 'irrigation_node') &&
        !filters.showSensors
      ) {
        return false;
      }
      return true;
    });

    const visibleIds = new Set(visibleAssets.map((a) => a.id));

    // Remove markers that are no longer visible
    Object.keys(markersRef.current).forEach((id) => {
      if (!visibleIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Create or update visible markers
    visibleAssets.forEach((asset) => {
      let marker = markersRef.current[asset.id];
      const isSelected = selectedAsset?.id === asset.id;

      if (!marker) {
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

      // Render marker visual
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
  }, [map, assets, selectedAsset, filters.showDrones, filters.showTractors, filters.showSensors]);

  // Clean up markers on unmount
  useEffect(() => {
    return () => {
      (Object.values(markersRef.current) as Marker[]).forEach((m) => m.remove());
      markersRef.current = {};
    };
  }, []);

  return markersRef;
}
