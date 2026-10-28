/**
 * NovaPoshtaThermalButton — друк офіційної наліпки НП на термопринтер EZPOS L4-W
 * Бекенд: NP API (printMarkings HTML) → Puppeteer → bitmap → TSPL BITMAP → TCP socket.
 * Багатомісна ТТН — по наліпці на кожне місце, одним завданням.
 *
 * label — підпис кнопки (у щільних таблицях — коротший, напр. «Термо»).
 * onError(опис | null) — помилку показує батько (NpAlert у вікні НП);
 * без onError короткий заголовок помилки лишається під текстом кнопки.
 */

import React, { useState } from 'react';
import axios from '../../api/axiosInstance';
import { getSettings } from '../barcode/qzTrayService';
import { describeNpError } from './npErrors';

export default function NovaPoshtaThermalButton({ waybillRef, intDocNumber, className = '', onError, label = 'ДРУК НАЛІПКИ' }) {
  const [printing, setPrinting] = useState(false);
  const [lastOk, setLastOk] = useState(false);
  const [error, setError] = useState(null);

  if (!waybillRef) return null;

  const report = (described) => {
    setError(described);
    if (onError) onError(described);
  };

  const handlePrint = async () => {
    setPrinting(true);
    report(null);
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
      setLastOk(response.data?.labels || 1);
      setTimeout(() => setLastOk(false), 3000);
    } catch (err) {
      console.error('[NP Thermal] Error:', err?.response?.data?.error || err.message);
      report(describeNpError(err, 'thermal'));
    } finally {
      setPrinting(false);
    }
  };

  const inlineError = error && !onError;

  return (
    <button
      type="button"
      className={className || 'npw-btn npw-btn--sm'}
      onClick={handlePrint}
      disabled={printing}
      title={error ? [error.title, error.items?.[0]?.text, error.hint].filter(Boolean).join('. ') : 'Друк офіційної наліпки НП на термопринтер'}
      style={{ opacity: printing ? 0.6 : 1, position: 'relative' }}
    >
      <span>
        {printing ? 'Друк...' : lastOk ? (lastOk > 1 ? `Надруковано: ${lastOk}` : 'Надруковано') : label}
      </span>
      {inlineError && (
        <span style={{
          display: 'block',
          fontSize: 'var(--font-size-xs, 11px)',
          color: 'var(--adminred)',
          marginTop: 2,
          whiteSpace: 'normal',
        }}>
          {error.title}
        </span>
      )}
    </button>
  );
}
