import React, { useCallback, useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import { printLabel, isConnected, connect, onStatusChange, hasSavedDevice, getBatteryLevel } from './niimbotPrintService';
import {
  connect as scannerConnect,
  isConnected as scannerIsConnected,
  onStatusChange as scannerOnStatusChange,
  hasSavedDevice as scannerHasSavedDevice,
} from './barcodeScannerService';
import './BarcodeLabel.css';

/**
 * BarcodeLabel — компонент для відображення та друку наліпок зі штрих-кодом.
 *
 * @param {'order'|'client'} type — тип наліпки
 * @param {object} data — дані для наліпки
 *   order: { id, allPrice, clientId, client: { id, firstName, lastName } }
 *   client: { id, firstName, lastName }
 * @param {'compact'|'full'} variant — compact = маленька іконка для таблиць, full = повний штрих-код
 * @param {string} [className] — додатковий CSS-клас
 */
export default function BarcodeLabel({ type = 'order', data, variant = 'compact', className = '', onAfterPrint }) {
  const [printing, setPrinting] = useState(false);

  const barcodeValue = type === 'order' ? `ORD${data?.id || 0}` : `CLN${data?.id || 0}`;

  const getClientName = () => {
    if (type === 'client') {
      return [data?.firstName, data?.lastName].filter(Boolean).join(' ') || `Client #${data?.id}`;
    }
    const c = data?.client;
    return c ? [c.firstName, c.lastName].filter(Boolean).join(' ') || `Client #${c.id}` : '—';
  };

  // --- Niimbot Bluetooth print (єдиний метод друку) ---
  const handlePrint = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (printing) return;

    setPrinting(true);
    try {
      // printLabel сам підключить принтер якщо потрібно
      await printLabel(type, data);
      if (onAfterPrint) onAfterPrint();
    } catch (err) {
      console.error('Niimbot print error:', err);
      alert('Помилка друку: ' + err.message);
    } finally {
      setPrinting(false);
    }
  }, [printing, type, data, onAfterPrint]);

  if (!data?.id) return null;

  const printingClass = printing ? ' bc-label--printing' : '';

  if (variant === 'compact') {
    return (
      <div className={`bc-label bc-label--compact bc-label--${type}${printingClass} ${className}`} onClick={handlePrint} title={`Друк ${type === 'order' ? 'замовлення' : 'клієнта'} ${barcodeValue}`}>
        <Barcode value={barcodeValue} width={1} height={22} background="transparent" fontSize={0} displayValue={false} margin={0} />
      </div>
    );
  }

  return (
    <div className={`bc-label bc-label--full bc-label--${type}${printingClass} ${className}`} onClick={handlePrint} title={`Друк ${type === 'order' ? 'замовлення' : 'клієнта'} ${barcodeValue}`}>
      <div className="bc-label__barcode">
        <Barcode value={barcodeValue} width={type === 'order' ? 2 : 1.2} height={type === 'order' ? 36 : 28} background="transparent" fontSize={0} displayValue={false} margin={0} />
      </div>
    </div>
  );
}

/**
 * NiimbotConnectButton — кнопка підключення до Niimbot принтера.
 * Розміщується в Nav або Settings.
 */
const NiimbotLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1174 208" className="bc-niimbot-logo">
    <path fill="currentColor" d="M551,202v-94l-52.5,73.98-50.02-72.96c-.73-1.76-2.48.02-2.48.48v91l-1.5,1.5h-49.5V6h42.5l61,87.98,61-87.98h41l1.5,1.5v193l-1.5,1.5h-49.5Z"/>
    <path fill="currentColor" d="M43.5,6l70.49,97.52c.55.98,2.01-.9,2.01-1.02V6h48.5l1.5,1.5v193l-1.5,1.5h-41L51,104v96.5l-1.5,1.5H1V6h42.5Z"/>
    <path fill="currentColor" d="M835.54,165.45c-42.76-57.44-15.15-140.06,53.25-160.17,80.07-23.55,155.63,53.07,127.69,132.69-27.26,77.67-131.64,93.7-180.94,27.48ZM954.45,143.44c24.02-22.39,23.54-59.34-1.97-80.42-41.86-34.57-103.8,8.97-83.77,60.77,13.23,34.22,58.89,44.68,85.74,19.65Z"/>
    <path fill="currentColor" d="M759.01,95.98c28.22,12.28,37.66,43.72,26.02,71.55-11.11,26.56-39.27,33.26-65.49,34.51-25.49,1.21-51.96-.99-77.55-.04l-.06-195.57c26.04.34,53.67-1.96,79.55-.43,20.93,1.24,45.19,7.7,54.52,28.48,6.97,15.52,5.05,36.78-6.04,49.99-1.77,2.11-12.27,9.59-10.97,11.51ZM691.5,39l-1.5,1.5v44l1.5,1.5h18c.64,0,8.37-2.07,9.49-2.51,14.97-5.88,16.3-30.88,3.94-39.92-1.13-.83-8.68-4.57-9.43-4.57h-22ZM690,115v52.5l1.5,1.5h22c.72,0,10.12-2.92,11.51-3.49,18.96-7.92,19.85-37.37,1.89-46.91-1.04-.55-8.9-3.6-9.4-3.6h-27.5Z"/>
    <polygon fill="currentColor" points="1174 45 1129 45 1129 202 1076.5 202 1075 200.5 1075 45 1038.5 45 1023.35 21.11 1009 6 1172.5 6 1174 7.5 1174 45"/>
    <polygon fill="currentColor" points="355 6 355 202 301.5 202 300 200.5 300 6 355 6"/>
    <polygon fill="currentColor" points="260 6 260 200.5 258.5 202 206.5 202 205 200.5 205 7.5 206.5 6 260 6"/>
  </svg>
);

/**
 * ScannerLogo — іконка штрих-код сканера (SCANNER text + barcode lines).
 */
const ScannerLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272.2 89.09" className="bc-scanner-logo">
    <g fill="currentColor">
      <rect x="252.91" y="2.06" width="6" height="53"/><rect x="109.43" y="2.1" width="6" height="53"/><rect x="122.12" y="2.06" width="6" height="53"/><rect x="130.16" y="2.06" width="6" height="53"/><rect x="20.91" y="2.06" width="5.5" height="53"/><rect x="211.91" y="2.06" width="5.5" height="53"/><rect x="225.64" y="2.1" width="5.5" height="53"/><rect x="151.91" y="2.06" width="5.5" height="53"/><rect x="35.91" y="2.06" width="5.5" height="53"/><rect x="204.41" y="2.06" width="5.5" height="53"/><rect x="163.41" y="2.06" width="5.5" height="53"/><rect x="54.91" y="2.06" width="5.5" height="53"/><rect x="62.41" y="2.06" width="5.5" height="53"/><rect x="189.41" y="2.06" width="5.5" height="53"/><rect x="84.91" y="2.06" width="5.5" height="53"/><rect x="92.41" y="2.06" width="5.5" height="53"/>
      <path d="M18.91,2.06v53c-1.79-.23-4.18.67-5.5-.75V2.06h5.5Z"/>
      <rect x="2.41" y="2.06" width="2" height="83"/><rect x="267.91" y="2.06" width="2" height="83"/><rect x="28.41" y="2.06" width="2" height="53"/><rect x="219.41" y="2.06" width="2" height="53"/><rect x="43.41" y="2.06" width="2" height="53"/><rect x="50.91" y="2.06" width="2" height="53"/><rect x="80.91" y="2.06" width="2" height="53"/><rect x="181.91" y="2.06" width="2" height="53"/><rect x="73.41" y="2.06" width="2" height="53"/><rect x="249.41" y="2.06" width="2" height="53"/><rect x="159.41" y="2.06" width="2" height="53"/><rect x="234.41" y="2.06" width="2" height="53"/><rect x="241.91" y="2.06" width="2" height="53"/><rect x="9.91" y="2.06" width="2" height="53"/>
      <path d="M146.41,2.06v53c-.58.2-2-.22-2-.75V2.06h2Z"/><path d="M120.41,2.06v52.25c0,.53-1.42.95-2,.75V2.06h2Z"/><path d="M105.41,2.06v52.25c0,.53-1.42.95-2,.75V2.06h2Z"/><path d="M239.91,2.06v53c-.58.2-2-.22-2-.75V2.06h2Z"/><path d="M263.56,2.04v53c-.58.2-2-.22-2-.75V2.04h2Z"/><path d="M149.91,2.06v51.75c0,.75.82,1.39-1.5,1.25V2.06h1.5Z"/><path d="M202.41,2.06v53c-2.32.14-1.5-.5-1.5-1.25V2.06h1.5Z"/><path d="M138.91,2.06v53c-2.32.14-1.5-.5-1.5-1.25V2.06h1.5Z"/>
      <rect x="32.41" y="2.06" width="1.5" height="53"/><rect x="69.91" y="2.06" width="1.5" height="53"/><rect x="185.91" y="2.06" width="1.5" height="53"/><rect x="170.91" y="2.06" width="1.5" height="53"/><rect x="99.91" y="2.06" width="1.5" height="53"/><rect x="178.41" y="2.06" width="1.5" height="53"/>
    </g>
    <g fill="currentColor">
      <path d="M16.44,78.06c.62,2.75,2.44,4.38,5.82,4.38,3.76,0,5.2-1.89,5.2-4.14s-1.03-3.79-5.55-4.91c-4.35-1.1-6.23-2.52-6.23-5.51,0-2.72,1.97-5.27,6.38-5.27s6.44,2.78,6.7,5.3h-1.65c-.47-2.22-1.91-3.82-5.14-3.82-2.97,0-4.58,1.39-4.58,3.7s1.35,3.17,5.14,4.11c5.79,1.45,6.64,3.79,6.64,6.28,0,3.05-2.2,5.68-6.97,5.68-5.14,0-7.02-3.02-7.41-5.8h1.65Z"/>
      <path d="M68.38,78.09c-.97,3.29-3.38,5.77-7.73,5.77-5.91,0-9.02-4.74-9.02-10.57s3.06-10.69,9.05-10.69c4.44,0,7.05,2.49,7.73,5.95h-1.59c-.94-2.69-2.67-4.47-6.23-4.47-5.11,0-7.26,4.71-7.26,9.18s2.12,9.12,7.38,9.12c3.35,0,5.06-1.75,6.08-4.29h1.59Z"/>
      <path d="M93.83,76.46l-2.62,7.16h-1.62l7.55-20.72h1.88l7.88,20.72h-1.73l-2.67-7.16h-8.67ZM101.98,74.98c-2.29-6.16-3.47-9.12-3.88-10.51h-.03c-.5,1.57-1.82,5.24-3.67,10.51h7.58Z"/>
      <path d="M129.67,83.62v-20.72h2.35c3.2,4.97,10.73,16.55,12.02,18.8h.03c-.18-2.99-.15-6.04-.15-9.41v-9.38h1.62v20.72h-2.18c-3.06-4.8-10.7-16.84-12.17-19.12h-.03c.15,2.72.12,5.74.12,9.5v9.62h-1.62Z"/>
      <path d="M170.7,83.62v-20.72h2.35c3.2,4.97,10.73,16.55,12.02,18.8h.03c-.18-2.99-.15-6.04-.15-9.41v-9.38h1.62v20.72h-2.17c-3.06-4.8-10.7-16.84-12.17-19.12h-.03c.15,2.72.12,5.74.12,9.5v9.62h-1.62Z"/>
      <path d="M223.81,73.44h-10.49v8.7h11.49l-.23,1.48h-12.84v-20.72h12.61v1.48h-11.02v7.58h10.49v1.48Z"/>
      <path d="M249.59,73.94v9.68h-1.62v-20.72h7.38c4.05,0,6.2,2.19,6.2,5.45,0,2.63-1.56,4.35-3.85,4.85,2.12.5,3.53,1.89,3.53,5.42v.8c0,1.45-.12,3.4.26,4.2h-1.62c-.38-.89-.29-2.55-.29-4.32v-.53c0-3.4-1-4.83-4.94-4.83h-5.05ZM249.59,72.46h4.97c3.62,0,5.29-1.36,5.29-4.08,0-2.55-1.65-4-4.85-4h-5.41v8.08Z"/>
    </g>
  </svg>
);

/**
 * BarcodeScannerButton — кнопка сканера штрих-кодів в навігації.
 */
export function BarcodeScannerButton({ className = '' }) {
  const [status, setStatus] = useState(
    scannerIsConnected() ? 'connected' : scannerHasSavedDevice() ? 'connecting' : 'disconnected'
  );

  useEffect(() => {
    const unsub = scannerOnStatusChange((isConn) => {
      setStatus(isConn ? 'connected' : 'disconnected');
    });
    return unsub;
  }, []);

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (status === 'connected') return;
    setStatus('connecting');
    try {
      await scannerConnect();
      setStatus('connected');
    } catch {
      setStatus('disconnected');
    }
  };

  return (
    <button
      className={`bc-scanner-btn bc-scanner-btn--${status} ${className}`}
      onClick={handleConnect}
      title={status === 'connected' ? 'Сканер підключений' : 'Підключити сканер штрих-кодів'}
    >
      <ScannerLogo />
      <span className="bc-scanner-dot" />
    </button>
  );
}

export function NiimbotConnectButton({ className = '' }) {
  const [status, setStatus] = useState(
    isConnected() ? 'connected' : hasSavedDevice() ? 'connecting' : 'disconnected'
  );
  const [battery, setBattery] = useState(getBatteryLevel());

  // Підписуємось на зміни статусу (авто-реконнект, disconnect тощо)
  useEffect(() => {
    const unsub = onStatusChange((isConn) => {
      setStatus(isConn ? 'connected' : 'disconnected');
      setBattery(isConn ? getBatteryLevel() : null);
    });
    return unsub;
  }, []);

  // Оновлюємо батарею кожні 30с коли підключений
  useEffect(() => {
    if (status !== 'connected') return;
    const iv = setInterval(() => setBattery(getBatteryLevel()), 30000);
    return () => clearInterval(iv);
  }, [status]);

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (status === 'connected') return;
    setStatus('connecting');
    try {
      await connect();
      setStatus('connected');
      setBattery(getBatteryLevel());
    } catch {
      setStatus('disconnected');
    }
  };

  // Колір за рівнем заряду: 0-25% red, 50% coral, 75% orange, 100% green
  const batteryColor = battery != null
    ? battery <= 25 ? 'var(--adminred, #ee3c23)'
      : battery <= 50 ? 'var(--admincoral, #ff7f50)'
      : battery <= 75 ? 'var(--adminorange, #f5a623)'
      : 'var(--admingreen, #0e935b)'
    : undefined;

  return (
    <button
      className={`buttonSkewedOrder bc-niimbot-nav bc-niimbot-nav--${status} ${className}`}
      onClick={handleConnect}
      title={status === 'connected' ? `Niimbot B21S — ${battery != null ? battery + '%' : 'підключений'}` : 'Підключити Niimbot B21S'}
    >
      <NiimbotLogo />
      <span className="bc-niimbot-status-row">
        <span className="bc-niimbot-dot" style={status === 'connected' && batteryColor ? { backgroundColor: batteryColor } : undefined} />
        {status === 'connected' && battery != null && (
          <span className="bc-niimbot-battery" style={{ color: batteryColor }}>{battery}%</span>
        )}
      </span>
    </button>
  );
}
