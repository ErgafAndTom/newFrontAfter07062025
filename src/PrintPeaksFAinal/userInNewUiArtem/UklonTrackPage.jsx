import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";
import UklonMap from "./UklonMap";
import "./UklonTrackPage.css";

const STATUS_MAP = {
  processing: { label: 'Пошук водія...', color: '#e8a500', icon: '🔍' },
  driver_found: { label: 'Водій знайдений', color: '#3c60a6', icon: '🚗' },
  driver_on_way: { label: 'Водій їде', color: '#3c60a6', icon: '🚗' },
  on_place: { label: 'Водій прибув', color: '#3c60a6', icon: '📍' },
  picked_up: { label: 'Забрано', color: '#7b5ea7', icon: '📦' },
  delivering: { label: 'Доставка', color: '#7b5ea7', icon: '🚚' },
  delivered: { label: 'Доставлено', color: '#2d8b61', icon: '✅' },
  canceled: { label: 'Скасовано', color: '#c0392b', icon: '❌' },
  cancelled: { label: 'Скасовано', color: '#c0392b', icon: '❌' },
};

const STEPS = ['processing', 'driver_on_way', 'picked_up', 'delivering', 'delivered'];

export default function UklonTrackPage() {
  const { trackId } = useParams();
  const [order, setOrder] = useState(null);
  const [courier, setCourier] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/uklon/order/${trackId}`);
      setOrder(data);
      setError(null);
      const st = (data?.status || '').toLowerCase();
      if (['delivered', 'cancelled', 'canceled', 'failed'].includes(st)) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch (err) {
      setError('Замовлення не знайдено');
      if (pollRef.current) clearInterval(pollRef.current);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  const fetchCourier = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/uklon/order/${trackId}/courier`);
      if (data?.lat) setCourier(data);
    } catch {}
  }, [trackId]);

  useEffect(() => {
    fetchOrder();
    fetchCourier();
    pollRef.current = setInterval(() => {
      fetchOrder();
      fetchCourier();
    }, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchOrder, fetchCourier]);

  if (loading) return <div className="utp-loading">Завантаження...</div>;
  if (error) return <div className="utp-error">{error}</div>;
  if (!order) return null;

  const status = (order.status || 'processing').toLowerCase();
  const st = STATUS_MAP[status] || { label: status, color: '#666', icon: '📦' };
  const currentStep = STEPS.indexOf(status === 'driver_found' || status === 'on_place' ? 'driver_on_way' : status);

  // Побудувати pickup/dropoffs з route
  const pickup = order.route?.points?.pickup || {};
  const dropoffs = (order.route?.points?.dropoffs || []).map(d => ({
    lat: d.latitude, lng: d.longitude, address: d.address,
  }));

  const driverInfo = order.driver || courier?.driver;
  const carInfo = driverInfo ? [driverInfo.car?.brand, driverInfo.car?.model].filter(Boolean).join(' ') : '';

  return (
    <div className="utp-wrap">
      <div className="utp-header">
        <div className="utp-logo">PRINT PEAKS</div>
        <div className="utp-title">Відстеження доставки</div>
      </div>

      {/* Прогрес-бар */}
      <div className="utp-progress">
        {STEPS.map((step, i) => {
          const isCurrent = i === currentStep;
          const isPast = i < currentStep;
          return (
            <React.Fragment key={step}>
              {i > 0 && (
                <div className={`utp-progress-line ${isPast || isCurrent ? 'utp-progress-line--active' : ''}`} />
              )}
              <div className={`utp-progress-dot ${isPast ? 'utp-progress-dot--done' : ''} ${isCurrent ? 'utp-progress-dot--current' : ''}`} />
            </React.Fragment>
          );
        })}
      </div>
      <div className="utp-progress-labels">
        <span>Пошук</span><span>Водій їде</span><span>Забрано</span><span>Доставка</span><span>Готово</span>
      </div>

      {/* Статус */}
      <div className="utp-status" style={{ color: st.color }}>
        <span className="utp-status-icon">{st.icon}</span>
        <span>{st.label}</span>
      </div>

      {/* Інфо водія */}
      {driverInfo && (
        <div className="utp-driver">
          {driverInfo.photo && <img src={driverInfo.photo} alt="" className="utp-driver-photo" />}
          <div className="utp-driver-info">
            <div className="utp-driver-name">{driverInfo.name}</div>
            <div className="utp-driver-car">{carInfo} {driverInfo.car?.color && `(${driverInfo.car.color})`} {driverInfo.car?.number}</div>
            {driverInfo.phone && <a href={`tel:${driverInfo.phone}`} className="utp-driver-phone">{driverInfo.phone}</a>}
          </div>
        </div>
      )}

      {/* Карта */}
      {pickup?.latitude && dropoffs[0]?.lat && (
        <div className="utp-map">
          <UklonMap
            pickup={{ lat: pickup.latitude, lng: pickup.longitude }}
            dropoffs={dropoffs}
            courierPos={courier}
            status={status}
          />
        </div>
      )}

      {/* Вартість */}
      {order.cost?.total && (
        <div className="utp-cost">
          Вартість доставки: <strong>{order.cost.total} {order.cost.currency || 'UAH'}</strong>
        </div>
      )}
    </div>
  );
}
