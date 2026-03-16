import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onScan } from './barcodeScannerService';
import ClientCabinet from '../userInNewUiArtem/ClientCabinet';

const SCAN_INTERVAL_MS = 150; // макс. інтервал між натисканнями для сканера (BT може бути повільніший за USB)
const MIN_BARCODE_LEN  = 4;   // мін. довжина штрих-коду (ORD1)

// Маппінг українська розкладка → латиниця (сканер натискає фізичні клавіші,
// але ОС може мати активну українську розкладку)
const UA_TO_EN = {
  'Щ':'O','К':'R','В':'D',  // ORD → ЩКВ
  'С':'C','Д':'L','Т':'N',  // CLN → СДТ
  'щ':'o','к':'r','в':'d',
  'с':'c','д':'l','т':'n',
};

function normalizeToLatin(str) {
  return str.replace(/[А-яЁёІіЇїЄєҐґ]/g, ch => UA_TO_EN[ch] || ch);
}

/**
 * BarcodeScannerListener — глобальний слухач для сканерів штрих-кодів.
 * Сканер працює як клавіатура — швидко набирає символи і натискає Enter.
 * Розпізнає: ORD{id} → /Orders/{id}, CLN{id} → відкриває клієнта.
 * Працює з будь-якою розкладкою клавіатури (EN/UA).
 */
export default function BarcodeScannerListener() {
  const navigate = useNavigate();
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const [cabinetClientId, setCabinetClientId] = useState(null);

  const isInputFocused = useCallback(() => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return false;
  }, []);

  const processBarcode = useCallback((code) => {
    // Нормалізуємо: якщо розкладка українська — конвертуємо в латиницю
    const trimmed = normalizeToLatin(code.trim()).toUpperCase();
    const orderMatch = trimmed.match(/^ORD(\d+)$/);
    if (orderMatch) {
      navigate(`/Orders/${orderMatch[1]}`);
      return;
    }

    const clientMatch = trimmed.match(/^CLN(\d+)$/);
    if (clientMatch) {
      setCabinetClientId(Number(clientMatch[1]));
      return;
    }

  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isInputFocused()) return;

      const now = Date.now();

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= MIN_BARCODE_LEN) {
          processBarcode(bufferRef.current);
        }
        bufferRef.current = '';
        lastKeyTimeRef.current = 0;
        return;
      }

      // Тільки друковані символи
      if (!e.key || e.key.length !== 1) return;

      if (now - lastKeyTimeRef.current > SCAN_INTERVAL_MS && bufferRef.current.length > 0) {
        // Занадто великий інтервал — скидаємо (це ручний набір)
        bufferRef.current = '';
      }

      bufferRef.current += e.key;
      lastKeyTimeRef.current = now;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isInputFocused, processBarcode]);

  // BLE сканер — отримуємо дані через Bluetooth і обробляємо тим самим processBarcode
  useEffect(() => {
    return onScan((barcode) => processBarcode(barcode));
  }, [processBarcode]);

  return cabinetClientId ? (
    <ClientCabinet
      userId={cabinetClientId}
      onClose={() => setCabinetClientId(null)}
      onCreateOrder={() => {}}
      onOpenChat={() => {}}
    />
  ) : null;
}
