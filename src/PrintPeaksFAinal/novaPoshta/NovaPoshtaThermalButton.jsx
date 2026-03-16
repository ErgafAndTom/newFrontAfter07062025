/**
 * NovaPoshtaThermalButton — друк офіційної наліпки НП на термопринтер EZPOS L4-W
 * Бекенд: NP API (printMarkings PDF) → Puppeteer → bitmap → TSPL BITMAP → TCP socket
 */

import React, { useState } from 'react';
import axios from '../../api/axiosInstance';
import { getSettings } from '../barcode/qzTrayService';

export default function NovaPoshtaThermalButton({ waybillRef, intDocNumber, className = '' }) {
  const [printing, setPrinting] = useState(false);
  const [lastOk, setLastOk] = useState(false);
  const [error, setError] = useState(null);

  if (!waybillRef) return null;

  const handlePrint = async () => {
    setPrinting(true);
    setError(null);
    setLastOk(false);

    try {
      const s = getSettings();
      const response = await axios.post(`/novaposhta/print-sticker-thermal/${waybillRef}`, {
        host: s.printerHost,
        port: s.printerPort,
        resolution: s.resolution || 6,
        density: s.density || 8,
        speed: s.speed || 4,
        gap: s.gap || 3,
        labelWidth: s.labelWidth || 100,
        labelHeight: s.labelHeight || 100,
        sound: s.sound !== false,
        offsetX: s.offsetX || 0,
        offsetY: s.offsetY || 0,
        threshold: s.threshold || 128,
      });

      console.log('[NP Thermal]', response.data);
      setLastOk(true);
      setTimeout(() => setLastOk(false), 3000);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      console.error('[NP Thermal] Error:', msg);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <button
      className={className || 'npc-btn npc-btn-outline'}
      onClick={handlePrint}
      disabled={printing}
      title={error || 'Друк офіційної наліпки НП на термопринтер'}
      style={{ opacity: printing ? 0.6 : 1, position: 'relative' }}
    >
      <span>
        {printing ? 'Друк...' : lastOk ? 'Надруковано' : 'ДРУК НАЛІПКИ'}
      </span>
      {error && (
        <span style={{
          display: 'block',
          fontSize: 'var(--font-size-xs, 11px)',
          color: 'var(--adminred)',
          marginTop: 2,
        }}>
          {error.length > 40 ? error.substring(0, 40) + '...' : error}
        </span>
      )}
    </button>
  );
}
