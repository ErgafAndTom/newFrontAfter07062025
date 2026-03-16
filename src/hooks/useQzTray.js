/**
 * useQzTray — React хук для друку етикеток через бекенд TCP socket
 * (QZ Tray більше не використовується, друк через POST /novaposhta/print-raw)
 */

import { useState, useCallback } from 'react';
import {
  printNovaPoshtaLabel,
  getSettings,
  saveSettings,
} from '../PrintPeaksFAinal/barcode/qzTrayService';

export default function useQzTray() {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettingsState] = useState(getSettings);

  const printLabel = useCallback(async (labelData, overrideSettings) => {
    setError(null);
    setPrinting(true);
    try {
      await printNovaPoshtaLabel(labelData, overrideSettings);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw err;
    } finally {
      setPrinting(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings) => {
    const merged = { ...settings, ...newSettings };
    saveSettings(merged);
    setSettingsState(merged);
  }, [settings]);

  return {
    connected: true, // бекенд завжди доступний
    printing,
    error,
    printers: [],
    settings,
    connect: async () => {},
    disconnect: async () => {},
    fetchPrinters: async () => {},
    printLabel,
    updateSettings,
    clearError: () => setError(null),
  };
}
