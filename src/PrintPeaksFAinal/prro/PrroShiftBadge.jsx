import React, { useEffect, useState } from 'react';
import { getPrroStatus, openPrroShift, closePrroShift } from '../../api/prro';

export default function PrroShiftBadge({ blockIfClosed = false, onState }) {
  const [loading, setLoading] = useState(true);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [cashier, setCashier] = useState(null);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const s = await getPrroStatus();
      setShiftOpen(Boolean(s.shiftOpen));
      setCashier(s.cashier || null);
      if (typeof onState === 'function') onState({ shiftOpen: Boolean(s.shiftOpen), cashier: s.cashier || null });
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const open = async () => {
    try {
      await openPrroShift();
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  const close = async () => {
    try {
      await closePrroShift();
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        title={shiftOpen ? 'Зміна відкрита' : 'Зміна закрита'}
        style={{
          padding: '4px 8px',
          borderRadius: 6,
          background: shiftOpen ? '#E6FFF2' : '#FFF2F0',
          color: shiftOpen ? '#008249' : '#B51D1D',
          fontSize: 12,
          border: `1px solid ${shiftOpen ? '#00A66C' : '#E28B8B'}`
        }}
      >
        ПРРО: {shiftOpen ? 'ВІДКРИТО' : 'ЗАКРИТО'} {cashier ? `• ${cashier}` : ''}
      </span>

      {loading ? <span style={{ fontSize: 12, opacity: 0.7 }}>оновлення…</span> : (
        <>
          {!shiftOpen && (
            <button className="btn btn-sm btn-outline-primary" onClick={open}>
              Відкрити зміну
            </button>
          )}
          {shiftOpen && (
            <button className="btn btn-sm btn-outline-secondary" onClick={close}>
              Закрити зміну
            </button>
          )}
        </>
      )}

      {error && <span style={{ color: '#c00', fontSize: 12 }}>{error}</span>}
    </div>
  );
}
