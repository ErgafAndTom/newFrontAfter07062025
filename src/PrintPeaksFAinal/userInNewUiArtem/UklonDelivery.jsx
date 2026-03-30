import React, { useState, useEffect, useCallback } from "react";
import axios from "../../api/axiosInstance";
import { loadSetting } from "../../hooks/useUserSettings";
import UklonAddressInput from "./UklonAddressInput";
import DatePicker from "../tools/DatePicker";
import "./UklonDelivery.css";

const dateToISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const UKLON_DEFAULTS = {
  pickupAddress: '',
  pickupLat: '',
  pickupLng: '',
  pickupPhone: '+38 067 750 96 76',
  pickupName: 'PrintPeaks',
  pickupComment: '',
  defaultWeight: '1',
  defaultInsurance: '100',
  verificationRequired: false,
};

const EMPTY_DROPOFF = {
  address: '', lat: '', lng: '',
  contact_name: '', contact_phone: '', comment: '',
};

export default function UklonDelivery({ showUklon, setShowUklon, thisOrder, setThisOrder, setSelectedThings2, onMapData }) {
  const [settings, setSettings] = useState(UKLON_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [showPaidDialog, setShowPaidDialog] = useState(null); // null = не перевірено
  const [deliveryPrice, setDeliveryPrice] = useState(null); // фінальна ціна доставки для клієнта
  const [balance, setBalance] = useState(null);
  const [checkStatus, setCheckStatus] = useState(null); // null | 'loading' | 'ok' | 'error'
  const [checkMsg, setCheckMsg] = useState('');

  // Місто
  const [city, setCity] = useState(1);
  const [cities, setCities] = useState([]);

  // Забір
  const [pickup, setPickup] = useState({
    address: '', lat: '', lng: '',
    contact_name: '', contact_phone: '', comment: '',
  });

  // Мультидоставка (масив)
  const [dropoffs, setDropoffs] = useState([{ ...EMPTY_DROPOFF }]);

  // Тип продукту
  const [product, setProduct] = useState('car'); // 'car' | 'courier'
  const [payerType, setPayerType] = useState('sender'); // 'sender' | 'receiver'

  const [weight, setWeight] = useState('1');
  const [insurance, setInsurance] = useState('100');
  const [codAmount, setCodAmount] = useState('');
  const [verification, setVerification] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  // Завантажити налаштування + міста
  useEffect(() => {
    loadSetting('uklon_settings', UKLON_DEFAULTS).then(s => {
      setSettings(s);
      setPickup(prev => ({
        ...prev,
        address: s.pickupAddress || '',
        lat: s.pickupLat || '',
        lng: s.pickupLng || '',
        contact_name: s.pickupName || '',
        contact_phone: s.pickupPhone || '',
        comment: s.pickupComment || '',
      }));
      setWeight(s.defaultWeight || '1');
      setInsurance(s.defaultInsurance || '100');
      setVerification(s.verificationRequired || false);
    });

    // Завантажити список міст
    axios.get('/api/uklon/cities').then(r => {
      const list = r.data?.cities || [];
      if (list.length) setCities(list);
    }).catch(() => {});

    // Завантажити баланс
    axios.get('/api/uklon/balance').then(r => {
      const b = r.data?.balance ?? r.data?.amount ?? r.data?.value;
      if (b !== null && b !== undefined) setBalance(b);
    }).catch(() => {});
  }, []);

  // Заповнити отримувача з замовлення
  useEffect(() => {
    if (thisOrder?.User) {
      const user = thisOrder.User;
      setDropoffs(prev => {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          contact_name: user.username || '',
          contact_phone: user.phoneNumber || '',
        };
        return updated;
      });
    }
  }, [thisOrder]);

  // Скидаємо result якщо uklonData відсутня або скасована
  useEffect(() => {
    if (!thisOrder?.uklonData) {
      console.log('%c[Uklon:FE:Effect] uklonData пусте, скидаю result/tracking', 'color: #999');
      setResult(null);
      setTracking(null);
      setError(null);
      return;
    }
    try {
      const data = typeof thisOrder.uklonData === 'string' ? JSON.parse(thisOrder.uklonData) : thisOrder.uklonData;
      const st = (data?.status || '').toLowerCase();
      console.log('%c[Uklon:FE:Effect] uklonData status:', 'color: #6a5acd', st, '| deliveryId:', data?.deliveryId);
      if (['cancelled', 'canceled', 'delivered', 'completed', 'failed'].includes(st)) {
        console.log('%c[Uklon:FE:Effect] Статус завершальний, скидаю result', 'color: #f5a623');
        setResult(null);
        setTracking(null);
      } else if (data?.deliveryId) {
        // Відновлюємо result та tracking з uklonData після рефрешу сторінки
        console.log('%c[Uklon:FE:Effect] Відновлюю result/tracking з uklonData, deliveryId:', 'color: #0e935b; font-weight: bold', data.deliveryId);
        const courier = mapDriverToCourier(data);
        setResult(prev => prev || { uid: data.deliveryId, id: data.deliveryId, status: data.status });
        setTracking(prev => prev || { id: data.deliveryId, status: data.status || 'processing', courier });
      }
    } catch (e) { console.error('[Uklon:FE:Effect] Parse error:', e.message); }
  }, [thisOrder?.uklonData, thisOrder?.id]);

  // Перевірка оплати при відкритті модалки
  useEffect(() => {
    if (showUklon && !result) {
      setShowPaidDialog(isOrderPaid());
    }
  }, [showUklon]);

  // WebSocket listener — оновлюємо tracking коли приходить status update або driver info
  useEffect(() => {
    const handler = (e) => {
      const { orderId, status, driver, deliveryId, pointStatus, vehicle } = e.detail || {};
      if (!orderId || orderId !== thisOrder?.id) return;
      console.log('%c[Uklon:FE:WS] 📡 Status update в UklonDelivery:', 'color: #FFD600; font-weight: bold', status, '| pointStatus:', pointStatus, '| driver:', !!driver);

      const st = (status || '').toLowerCase();
      const cancelStatuses = ['cancelled', 'canceled', 'failed'];
      if (cancelStatuses.includes(st)) {
        setResult(null);
        setTracking(null);
        return;
      }

      const courier = driver ? mapDriverToCourier({ driver, vehicle: vehicle || driver.vehicle }) : null;
      setTracking(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: status || prev.status,
          pointStatus: pointStatus || prev.pointStatus,
          courier: courier || prev.courier,
        };
      });
      setResult(prev => prev ? { ...prev, status: status || prev.status } : prev);
    };
    window.addEventListener('uklonStatusUpdate', handler);
    return () => window.removeEventListener('uklonStatusUpdate', handler);
  }, [thisOrder?.id]);

  const handleClose = () => {
    setShowUklon(false);
    setShowPaidDialog(null);
    if (!result && onMapData) onMapData(null);
  };

  // ── Dropoff helpers ──
  const updateDropoff = useCallback((index, field, value) => {
    setDropoffs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const updateDropoffFull = useCallback((index, data) => {
    setDropoffs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  }, []);

  const addDropoff = useCallback(() => {
    if (dropoffs.length >= 9) return;
    setDropoffs(prev => [...prev, { ...EMPTY_DROPOFF }]);
  }, [dropoffs.length]);

  const removeDropoff = useCallback((index) => {
    if (dropoffs.length <= 1) return;
    setDropoffs(prev => prev.filter((_, i) => i !== index));
  }, [dropoffs.length]);

  // ── Розрахунок вартості ──
  const handleEstimate = async () => {
    const firstDropoff = dropoffs[0];
    if (!pickup.lat || !pickup.lng || !firstDropoff.lat || !firstDropoff.lng) {
      setError('Вкажіть адреси забору та доставки (з автодоповненням)');
      return;
    }
    setEstimating(true);
    setError(null);
    try {
      const estimatePayload = {
        city,
        product,
        pickup: { lat: parseFloat(pickup.lat), lng: parseFloat(pickup.lng) },
        dropoffs: dropoffs
          .filter(d => d.lat && d.lng)
          .map(d => ({ lat: parseFloat(d.lat), lng: parseFloat(d.lng) })),
        weight: parseFloat(weight) || undefined,
        insurance: parseFloat(insurance) || undefined,
      };
      console.log('%c[Uklon:FE:Estimate] 📤 POST /api/uklon/estimate', 'color: #FFD600; font-weight: bold', estimatePayload);
      const { data } = await axios.post('/api/uklon/estimate', estimatePayload);
      console.log('%c[Uklon:FE:Estimate] 📥 Response:', 'color: #0e935b; font-weight: bold', data);
      setEstimate(data);
      // Показати карту — з estimate даними (вартість, відстань, час)
      const ep = data?.estimated_products?.[product] || data?.estimated_products?.car || data?.estimated_products?.courier;
      const costObj = ep?.estimation?.cost || ep?.cost || (typeof data?.cost === 'object' ? data.cost : null);
      const route = ep?.estimation?.route || {};
      const distM = (route?.distance?.cityMeters || 0) + (route?.distance?.suburbanMeters || 0);
      const driveTime = route?.drive_time_seconds || 0;
      if (onMapData) onMapData({
        pickup, dropoffs,
        estimate: {
          cost: costObj?.recommended || costObj?.minimum || null,
          distance: distM > 0 ? (distM / 1000).toFixed(1) + ' км' : null,
          time: driveTime > 0 ? Math.ceil(driveTime / 60) + ' хв' : null,
        },
      });
    } catch (err) {
      const errDetails = err?.response?.data;
      console.error('%c[Uklon:FE:Estimate] ❌ Error:', 'color: #ee3c23; font-weight: bold', err?.response?.status, errDetails || err.message);
      setError(errDetails?.error || errDetails?.message || err.message);
    } finally {
      setEstimating(false);
    }
  };

  // ── Helper: маппінг driver/vehicle з Uklon API → courier для UI ──
  const mapDriverToCourier = (data) => {
    if (!data?.driver) return null;
    return {
      name: data.driver.name,
      phone: data.driver.phone,
      photo: data.driver.image_url,
      rating: data.driver.rating,
      completed_orders: data.driver.completed_orders,
      car: data.vehicle ? {
        brand: data.vehicle.brand,
        model: data.vehicle.model,
        number: data.vehicle.license_plate,
        color: data.vehicle.color,
      } : null,
    };
  };

  // ── Tracking state ──
  const [tracking, setTracking] = useState(null); // { id, status, courier }
  const [trackingLoading, setTrackingLoading] = useState(false);
  const trackingInterval = React.useRef(null);

  // Polling для відстеження
  const pollTracking = useCallback(async (deliveryId) => {
    try {
      console.log('%c[Uklon:FE:Poll] 📤 GET /api/uklon/order/' + deliveryId, 'color: #6a5acd');
      const { data } = await axios.get(`/api/uklon/order/${deliveryId}`);
      console.log('%c[Uklon:FE:Poll] 📥 Status:', 'color: #6a5acd', data?.status, '| data:', data);
      setTracking(prev => {
        const courier = mapDriverToCourier(data) || prev?.courier || null;
        const next = { ...prev, ...data, courier };
        if (onMapData) onMapData(prevMap => ({
          ...(typeof prevMap === 'object' ? prevMap : { pickup, dropoffs }),
          tracking: next,
        }));
        return next;
      });
      const st = (data?.status || '').toLowerCase();
      const cancelStatuses = ['cancelled', 'canceled', 'failed'];
      const doneStatuses = ['delivered', 'completed', ...cancelStatuses];
      if (doneStatuses.includes(st)) {
        if (trackingInterval.current) clearInterval(trackingInterval.current);
      }
      // При скасуванні — скинути result щоб показати форму
      if (cancelStatuses.includes(st)) {
        console.log('%c[Uklon:FE:Poll] ⚠️ Статус cancelled/failed, скидаю result', 'color: #ee3c23');
        setResult(null);
        setTracking(null);
        if (onMapData) onMapData(null);
      }
    } catch (err) {
      // Зупинити polling якщо 404 (невалідний ID)
      if (err?.response?.status === 404) {
        console.warn('%c[Uklon:FE:Poll] ❌ 404 — Order not found, stopping polling', 'color: #ee3c23; font-weight: bold');
        if (trackingInterval.current) clearInterval(trackingInterval.current);
      } else {
        console.error('%c[Uklon:FE:Poll] ❌ Poll error:', 'color: #ee3c23', err?.response?.status, err.message);
      }
    }
  }, [onMapData, pickup, dropoffs]);

  const pollCourier = useCallback(async (deliveryId) => {
    try {
      const { data } = await axios.get(`/api/uklon/order/${deliveryId}/courier`);
      setTracking(prev => {
        const next = { ...prev, courier: data };
        if (onMapData) onMapData(prevMap => ({ ...prevMap, tracking: next }));
        return next;
      });
    } catch {}
  }, [onMapData]);

  const startTracking = useCallback((deliveryId) => {
    setTracking({ id: deliveryId, status: 'created' });
    // НЕ запускаємо polling тут — polling обробляється в NewUIArtem.jsx
    // Модалка Uklon тільки створює замовлення і закривається
  }, []);

  // Cleanup interval
  useEffect(() => {
    return () => {
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    };
  }, []);

  // Скасування замовлення
  const handleCancel = async () => {
    const cancelId = tracking?.id || result?.uid || result?.id;
    console.log('%c[Uklon:FE:Cancel] 📤 Cancel deliveryId:', 'color: #ee3c23; font-weight: bold', cancelId);
    if (!cancelId) { setError('Немає ID замовлення для скасування'); return; }
    setTrackingLoading(true);
    try {
      const resp = await axios.put(`/api/uklon/order/${cancelId}/cancel`, { reason: 'changed_my_mind' });
      console.log('%c[Uklon:FE:Cancel] 📥 Response:', 'color: #0e935b', resp.data);
      setTracking(null);
      setResult(null);
      if (trackingInterval.current) clearInterval(trackingInterval.current);
      // Позначити uklonData як скасований + видалити orderUnit "Доставка Uklon"
      if (thisOrder?.id) {
        try {
          const cancelData = JSON.stringify({ status: 'canceled' });
          await axios.put(`/orders/one/${thisOrder.id}`, { uklonData: cancelData });

          // Видалити всі orderUnit-и "Доставка Uklon" з цього замовлення
          const uklonUnits = (thisOrder.OrderUnits || []).filter(u =>
            (u.newField6 === 'Delivery' || u.type === 'Delivery') &&
            (u.nameOrderUnit || '').toLowerCase().includes('uklon')
          );
          for (const unit of uklonUnits) {
            try {
              await axios.delete(`/orderUnits/OneOrder/OneOrderUnitInOrder/${unit.id}`);
              console.log('%c[Uklon:FE:Cancel] 🗑️ Видалено orderUnit:', 'color: #ee3c23', unit.id, unit.nameOrderUnit);
            } catch (_) {}
          }

          // Оновити thisOrder
          const { data: freshOrder } = await axios.get(`/orders/one/${thisOrder.id}`);
          if (setThisOrder) setThisOrder(freshOrder);
          if (setSelectedThings2) setSelectedThings2(freshOrder?.OrderUnits || []);
        } catch (_) {}
      }
    } catch (err) {
      console.error('%c[Uklon:FE:Cancel] ❌ Error:', 'color: #ee3c23; font-weight: bold', err?.response?.status, err?.response?.data || err.message);
      setError(err?.response?.data?.error || err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  // ── Створення замовлення ──
  // Валідація телефону
  const isValidPhone = (phone) => {
    if (!phone) return false;
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+?380\d{9}$/.test(clean) || /^0\d{9}$/.test(clean);
  };

  // Перевірка чи замовлення оплачене
  const isOrderPaid = () => {
    if (!thisOrder) return false;
    const ps = (thisOrder.payStatus || '').toLowerCase();
    const paymentStatus = (thisOrder.Payment?.status || '').toUpperCase();
    return ps === 'paid' || ps === 'оплачено' || ps === '1' || thisOrder.payStatus === 1
      || paymentStatus === 'PAID'
      || (thisOrder.allPrice > 0 && parseFloat(thisOrder.prepayment || 0) >= parseFloat(thisOrder.allPrice || 0));
  };

  // Розрахунок ціни доставки для клієнта
  const calcDeliveryPrice = (estimateData) => {
    const threshold = parseFloat(settings.freeDeliveryThreshold);
    const orderTotal = parseFloat(thisOrder?.allPrice || thisOrder?.price || 0);

    if (threshold && orderTotal >= threshold) {
      return 1; // безкоштовна доставка = 1 грн
    }

    // Реальна ціна з estimate
    const ep = estimateData?.estimated_products?.car?.estimation || estimateData?.estimated_products?.courier?.estimation;
    const cost = ep?.cost?.recommended || ep?.cost?.minimum || estimateData?.cost?.recommended || 0;
    return cost;
  };

  // Створення нового замовлення з тим же клієнтом для доставки
  const createNewOrderWithDelivery = async () => {
    setShowPaidDialog(false);
    try {
      const clientId = thisOrder?.clientId || thisOrder?.client?.id;
      if (!clientId) {
        setError('Не знайдено клієнта для створення замовлення');
        return;
      }
      const { data } = await axios.post('/api/orders/createForThisUser', {
        userId: clientId,
      });
      const newOrder = data?.order || data;
      if (newOrder?.id) {
        window.location.href = `/Orders/${newOrder.id}`;
      }
    } catch (err) {
      setError('Помилка створення нового замовлення: ' + (err?.response?.data?.error || err.message));
    }
  };

  // ── Перевірка даних доставки через GET /api/uklon/order/:id ──
  const handleCheck = async () => {
    const deliveryId = tracking?.id || result?.uid || result?.id;
    if (!deliveryId) { setCheckStatus('error'); setCheckMsg('Немає ID доставки'); return; }

    setCheckStatus('loading');
    setCheckMsg('');
    try {
      console.log('%c[Uklon:FE:Check] ═══════════════════════════════════════', 'color: #FFD600; font-weight: bold');
      console.log('%c[Uklon:FE:Check] 📤 GET /api/uklon/order/' + deliveryId, 'color: #FFD600; font-weight: bold');
      const { data } = await axios.get(`/api/uklon/order/${deliveryId}`);
      console.log('%c[Uklon:FE:Check] 📥 Повні дані замовлення:', 'color: #0e935b; font-weight: bold', data);
      console.log('%c[Uklon:FE:Check] 📥 status:', 'color: #0e935b', data?.status);
      console.log('%c[Uklon:FE:Check] 📥 pickup:', 'color: #0e935b', JSON.stringify(data?.pickup_point || data?.pickup));
      console.log('%c[Uklon:FE:Check] 📥 dropoffs:', 'color: #0e935b', JSON.stringify(data?.dropoff_points || data?.dropoffs));
      console.log('%c[Uklon:FE:Check] 📥 sender:', 'color: #0e935b', JSON.stringify(data?.sender));
      console.log('%c[Uklon:FE:Check] 📥 receivers:', 'color: #0e935b', JSON.stringify(data?.receivers));
      console.log('%c[Uklon:FE:Check] 📥 parcels:', 'color: #0e935b', JSON.stringify(data?.parcels));
      console.log('%c[Uklon:FE:Check] 📥 cost:', 'color: #0e935b', JSON.stringify(data?.cost));
      console.log('%c[Uklon:FE:Check] 📥 product:', 'color: #0e935b', data?.product);
      console.log('%c[Uklon:FE:Check] 📥 comment:', 'color: #0e935b', data?.comment);
      console.log('%c[Uklon:FE:Check] ═══════════════════════════════════════', 'color: #FFD600; font-weight: bold');
      setCheckStatus('ok');
      setCheckMsg(`OK — статус: ${data?.status || 'unknown'}, вартість: ${data?.cost?.total || data?.cost?.recommended || '?'} грн`);
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      console.error('%c[Uklon:FE:Check] ❌ Error:', 'color: #ee3c23; font-weight: bold', err?.response?.status, errMsg, err?.response?.data);
      setCheckStatus('error');
      setCheckMsg(`Помилка: ${err?.response?.status || ''} ${errMsg}`);
    }
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();

    // Кастомна валідація
    for (let i = 0; i < dropoffs.length; i++) {
      const d = dropoffs[i];
      if (!d.address || !d.lat || !d.lng) {
        setError(`Вкажіть адресу доставки${dropoffs.length > 1 ? ` #${i + 1}` : ''} (оберіть зі списку)`);
        return;
      }
      if (!d.contact_name?.trim()) {
        setError(`Вкажіть отримувача${dropoffs.length > 1 ? ` #${i + 1}` : ''}`);
        return;
      }
      if (!isValidPhone(d.contact_phone)) {
        setError(`Помилка в номері телефону${dropoffs.length > 1 ? ` отримувача #${i + 1}` : ' отримувача'}`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        orderId: thisOrder?.id,
        product,
        city,
        pickup: {
          address: pickup.address,
          lat: parseFloat(pickup.lat) || undefined,
          lng: parseFloat(pickup.lng) || undefined,
          contact_name: pickup.contact_name,
          contact_phone: pickup.contact_phone,
          comment: pickup.comment,
        },
        dropoffs: dropoffs.map(d => ({
          address: d.address,
          lat: parseFloat(d.lat) || undefined,
          lng: parseFloat(d.lng) || undefined,
          contact_name: d.contact_name,
          contact_phone: d.contact_phone,
          comment: d.comment,
        })),
        weight: parseFloat(weight) || undefined,
        insurance: parseFloat(insurance) || undefined,
        cod_amount: parseFloat(codAmount) || undefined,
        verification,
        scheduled_at: scheduledAt || undefined,
        payer_type: payerType,
      };
      console.log('%c[Uklon:FE:Create] ═══════════════════════════════════════', 'color: #FFD600; font-weight: bold');
      console.log('%c[Uklon:FE:Create] 📤 POST /api/uklon/create', 'color: #FFD600; font-weight: bold');
      console.log('%c[Uklon:FE:Create] 📤 Payload:', 'color: #FFD600', JSON.stringify(payload, null, 2));
      const { data } = await axios.post('/api/uklon/create', payload);
      console.log('%c[Uklon:FE:Create] 📥 Response:', 'color: #0e935b; font-weight: bold', data);
      console.log('%c[Uklon:FE:Create] 📥 data.uid:', 'color: #0e935b', data?.uid, '| data.id:', data?.id, '| data.status:', data?.status);
      console.log('%c[Uklon:FE:Create] 📥 data.error:', 'color: #ee3c23', data?.error || '(немає)');
      console.log('%c[Uklon:FE:Create] 📥 data keys:', 'color: #0e935b', Object.keys(data || {}));
      setResult(data);

      // Додаємо вартість доставки до замовлення як позицію (через стандартний endpoint)
      const responsePrice = data?.cost?.total || data?.cost?.recommended || data?.cost?.minimum;
      const dp = responsePrice || calcDeliveryPrice(estimate) || 300;
      console.log('%c[Uklon:FE:Create] 💰 Ціна доставки: dp=' + dp + ', responsePrice=' + responsePrice + ', payerType=' + payerType, 'color: #f5a623');
      setDeliveryPrice(dp);
      if (dp && thisOrder?.id && payerType !== 'receiver') {
        try {
          const deliveryData = {
            orderId: thisOrder.id,
            toCalc: {
              nameOrderUnit: "Доставка Uklon",
              type: "Delivery",
              deliveryType: "Uklon",
              city: "Київ",
              warehouse: "",
              courierAddress: dropoffs[0]?.address || '',
              cost: dp,
              size: { x: 0, y: 0 },
              material: { type: "Не потрібно" },
              color: { sides: "Не потрібно" },
              lamination: { type: "Не потрібно" },
              big: "Не потрібно",
              cute: "Не потрібно",
              cuteLocal: { leftTop: false, rightTop: false, rightBottom: false, leftBottom: false, radius: "" },
              holes: "Не потрібно",
              holesR: "Не потрібно",
              count: 1,
              price: dp,
            },
          };
          const { data: updatedOrder } = await axios.post("/orderUnits/OneOrder/OneOrderUnitInOrder", deliveryData);
          // Оновити thisOrder та список позицій
          if (updatedOrder) {
            if (setThisOrder) setThisOrder(updatedOrder);
            if (setSelectedThings2) setSelectedThings2(updatedOrder.OrderUnits);
          }
        } catch (priceErr) {
          const errMsg = priceErr?.response?.data?.error || priceErr.message;
          console.error('%c[Uklon:FE:Create] ❌ Помилка додавання доставки як позиції:', 'color: #ee3c23; font-weight: bold', errMsg, priceErr?.response?.data);
          setError(`Помилка додавання доставки: ${errMsg}`);
        }
      }

      const deliveryId = data?.uid || data?.id;
      console.log('%c[Uklon:FE:Create] 🔑 deliveryId для tracking:', 'color: #3c60a6; font-weight: bold', deliveryId);
      if (deliveryId) startTracking(deliveryId);
      // Показуємо карту з трекінгом в центральній зоні і закриваємо модалку
      if (onMapData) {
        // Зберігаємо estimate дані якщо є
        const prevEstimate = document.querySelector('.nui-uklon-map-zone') ? undefined : undefined;
        onMapData({
          pickup, dropoffs,
          tracking: { id: deliveryId, status: data?.status || 'processing' },
          result: data,
          estimate: (() => {
            if (estimate) {
              const ep2 = estimate?.estimated_products?.[product] || estimate?.estimated_products?.car;
              const c2 = ep2?.estimation?.cost || ep2?.cost || (typeof estimate?.cost === 'object' ? estimate.cost : null);
              const r2 = ep2?.estimation?.route || {};
              const d2 = (r2?.distance?.cityMeters || 0) + (r2?.distance?.suburbanMeters || 0);
              return {
                cost: c2?.recommended || c2?.minimum || dp || null,
                distance: d2 > 0 ? (d2 / 1000).toFixed(1) + ' км' : null,
                time: r2?.drive_time_seconds > 0 ? Math.ceil(r2.drive_time_seconds / 60) + ' хв' : null,
              };
            }
            // Fallback — ціна з data.cost або dp
            const costFromResponse = data?.cost?.total || data?.cost?.recommended || data?.cost?.minimum;
            return { cost: costFromResponse || dp || 300, distance: null, time: null };
          })(),
          createdAt: new Date().toISOString(),
        });
      }
      console.log('%c[Uklon:FE:Create] ✅ Замовлення створено, закриваю модалку', 'color: #0e935b; font-weight: bold');
      console.log('%c[Uklon:FE:Create] ═══════════════════════════════════════', 'color: #0e935b; font-weight: bold');
      setShowUklon(false);
    } catch (err) {
      const errStatus = err?.response?.status;
      const errData = err?.response?.data;
      console.error('%c[Uklon:FE:Create] ❌ ПОМИЛКА СТВОРЕННЯ!', 'color: #ee3c23; font-weight: bold; font-size: 14px');
      console.error('%c[Uklon:FE:Create] ❌ HTTP status:', 'color: #ee3c23', errStatus);
      console.error('%c[Uklon:FE:Create] ❌ Response data:', 'color: #ee3c23', errData);
      console.error('%c[Uklon:FE:Create] ❌ Error message:', 'color: #ee3c23', err.message);
      console.error('%c[Uklon:FE:Create] ═══════════════════════════════════════', 'color: #ee3c23; font-weight: bold');
      setError(errData?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!showUklon) return null;

  return (
    <div className="ukl-overlay" onClick={handleClose}>
      <div className="ukl-modal" onClick={e => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="ukl-header">
          <div className="ukl-header-title">
            <div className="ukl-logo">
              <svg viewBox="0 0 40 40" width="28" height="28">
                <rect width="40" height="40" rx="8" fill="#000"/>
                <path d="M12 14 L22 22 L28 16" stroke="#FFD200" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span>UKLON DELIVERY</span>
            {balance !== null && (
              <span className="ukl-balance">{balance} грн</span>
            )}
          </div>
          <button className="ukl-close" onClick={handleClose}>✕</button>
        </div>

        <div className="ukl-body">
          {/* ── Діалог "Замовлення оплачене" ── */}
          {showPaidDialog && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#333' }}>
                Замовлення вже оплачене
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--admingrey)', marginBottom: '1.5rem' }}>
                Створити нове замовлення з доставкою для цього клієнта?
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  className="ukl-btn-main"
                  onClick={createNewOrderWithDelivery}
                  style={{ padding: '0.6rem 2rem', background: '#FFD600', color: '#333', fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  ТАК
                </button>
                <button
                  onClick={() => setShowPaidDialog(false)}
                  style={{ padding: '0.6rem 2rem', background: '#eee', color: '#333', fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  НІ
                </button>
              </div>
            </div>
          )}

          {/* ── Трекінг замовлення ── */}
          {result && !['canceled', 'cancelled', 'failed'].includes((tracking?.status || result?.status || '').toLowerCase()) && (
            <div className="ukl-tracking">
              <div className="ukl-tracking-header">
                <div className="ukl-tracking-title">Замовлення доставки</div>
                <div className="ukl-tracking-id">ID: {result.uid || result.id}</div>
              </div>

              {/* Статус */}
              <div className="ukl-tracking-status">
                <div className="ukl-tracking-status-label">Статус</div>
                <div className={`ukl-tracking-status-value ukl-status--${(tracking?.status || result?.status || 'created').toLowerCase()}`}>
                  {(() => {
                    const s = (tracking?.status || result?.status || 'created').toLowerCase();
                    const statusMap = {
                      created: '⏳ Створено',
                      placed: '⏳ Розміщено',
                      waiting_for_processing: '⏳ Очікує обробки',
                      processing: '🔍 Пошук водія',
                      accepted: '🚗 Водій їде',
                      arrived: '📍 Водій прибув',
                      running: '🚚 Доставляється',
                      returning: '↩️ Повертається',
                      completed: '✅ Доставлено',
                      delivered: '✅ Доставлено',
                      suspended: '⏸️ Призупинено',
                      cancelled: '❌ Скасовано',
                      canceled: '❌ Скасовано',
                    };
                    // Якщо running + водій прибув на точку видачі
                    if (s === 'running' && tracking?.pointStatus === 'ROUTE_POINT_STATUS_ARRIVED') {
                      return '📍 Водій прибув на точку видачі';
                    }
                    return statusMap[s] || s;
                  })()}
                </div>
              </div>

              {/* Інфо водія */}
              {tracking?.courier && (
                <div className="ukl-tracking-courier">
                  <div className="ukl-tracking-status-label">Водій</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {tracking.courier.photo && (
                      <img src={tracking.courier.photo} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{tracking.courier.name || tracking.courier.first_name}</div>
                      {tracking.courier.phone && <div style={{ fontSize: '0.85rem', color: 'var(--admingrey)' }}>{tracking.courier.phone}</div>}
                      {tracking.courier.car && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--admingrey)' }}>
                          {tracking.courier.car.brand} {tracking.courier.car.model}
                          {tracking.courier.car.color ? ` • ${tracking.courier.car.color}` : ''}
                          {tracking.courier.car.number ? ` • ${tracking.courier.car.number}` : ''}
                        </div>
                      )}
                      {tracking.courier.completed_orders != null && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--admingrey)', opacity: 0.7 }}>
                          Виконано замовлень: {tracking.courier.completed_orders}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Карта відображається в центральній зоні замовлення */}

              {/* Кнопки */}
              {(() => {
                const s = (tracking?.status || result?.status || 'created').toLowerCase();
                const isDone = ['delivered', 'cancelled', 'completed', 'failed'].includes(s);
                return (
                  <>
                    <div className="ukl-actions" style={{ marginTop: '0.8rem' }}>
                      <button
                        type="button"
                        className={`ukl-btn ukl-btn--check${checkStatus === 'ok' ? ' ukl-btn--check-ok' : ''}${checkStatus === 'error' ? ' ukl-btn--check-err' : ''}`}
                        onClick={handleCheck}
                        disabled={checkStatus === 'loading'}
                        style={{ flex: 1 }}
                      >
                        {checkStatus === 'loading' ? 'Перевірка...' : checkStatus === 'ok' ? 'OK ✓' : checkStatus === 'error' ? 'ПОМИЛКА ✗' : 'ПЕРЕВІРИТИ'}
                      </button>
                      {!isDone && (
                        <button
                          className="ukl-btn ukl-btn--cancel"
                          onClick={handleCancel}
                          disabled={trackingLoading}
                          style={{ flex: 1 }}
                        >
                          {trackingLoading ? 'Скасування...' : 'СКАСУВАТИ'}
                        </button>
                      )}
                    </div>
                    {checkMsg && (
                      <div style={{ fontSize: 'var(--font-size-s, 13px)', color: checkStatus === 'ok' ? 'var(--admingreen)' : 'var(--adminred)', marginTop: '0.3rem' }}>
                        {checkMsg}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {!result && !showPaidDialog && (
            <form onSubmit={handleCreate} noValidate>
              {/* ── Хто платить ── */}
              <div className="ukl-payer-toggle">
                <span className="ukl-payer-label">Хто платить:</span>
                <button type="button" className={`ukl-payer-btn ${payerType === 'sender' ? 'ukl-payer-btn--active' : ''}`}
                  onClick={() => setPayerType('sender')}>ВІДПРАВНИК</button>
                <button type="button" className={`ukl-payer-btn ${payerType === 'receiver' ? 'ukl-payer-btn--active' : ''}`}
                  onClick={() => setPayerType('receiver')}>ОТРИМУВАЧ</button>
              </div>

              {/* ── Забір ── */}
              <div className="ukl-section">
                <div className="ukl-section-title">ЗАБІР</div>
                <div className="ukl-field">
                  <label>Адреса</label>
                  <input
                    type="text"
                    value={pickup.address}
                    readOnly
                    style={{ color: 'var(--admingrey)', cursor: 'default' }}
                    title={`Lat: ${pickup.lat}, Lng: ${pickup.lng} (з налаштувань профілю)`}
                  />
                </div>
                <div className="ukl-field-row">
                  <div className="ukl-field ukl-field--half">
                    <label>Контакт</label>
                    <input
                      type="text"
                      value={pickup.contact_name}
                      onChange={e => setPickup(p => ({ ...p, contact_name: e.target.value }))}
                    />
                  </div>
                  <div className="ukl-field ukl-field--half">
                    <label>Телефон</label>
                    <input
                      type="text"
                      value={pickup.contact_phone}
                      onChange={e => setPickup(p => ({ ...p, contact_phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="ukl-field">
                  <label>Коментар</label>
                  <input
                    type="text"
                    value={pickup.comment}
                    onChange={e => setPickup(p => ({ ...p, comment: e.target.value }))}
                    placeholder="2 поверх, зателефонувати"
                  />
                </div>
              </div>

              {/* ── Тип продукту ── */}
              <div className="ukl-product-toggle">
                <button
                  className={`ukl-product-btn ${product === 'car' ? 'ukl-product-btn--active' : ''}`}
                  onClick={() => setProduct('car')}
                >
                  АВТО
                </button>
                <button
                  className={`ukl-product-btn ${product === 'courier' ? 'ukl-product-btn--active' : ''}`}
                  onClick={() => setProduct('courier')}
                >
                  КУР'ЄР
                </button>
              </div>

              {/* ── Доставка (мультидоставка) ── */}
              {dropoffs.map((dropoff, idx) => (
                <div className="ukl-section" key={idx}>
                  <div className="ukl-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ДОСТАВКА{dropoffs.length > 1 ? ` ${idx + 1}` : ''}</span>
                    {dropoffs.length > 1 && (
                      <button
                        className="ukl-dropoff-remove"
                        onClick={() => removeDropoff(idx)}
                        title="Видалити адресу"
                      >✕</button>
                    )}
                  </div>

                  {/* Місто — показуємо тільки в першому dropoff */}
                  {idx === 0 && cities.length > 0 && (
                    <div className="ukl-field">
                      <label>Місто</label>
                      <select
                        value={city}
                        onChange={e => setCity(Number(e.target.value))}
                      >
                        {cities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="ukl-field">
                    <label>Адреса</label>
                    <UklonAddressInput
                      value={dropoff.address}
                      onChange={val => updateDropoff(idx, 'address', val)}
                      onAddressSelect={({ name, lat, lng }) => updateDropoffFull(idx, {
                        address: name, lat: lat || dropoff.lat, lng: lng || dropoff.lng,
                      })}
                      placeholder="Адреса доставки"

                    />
                  </div>
                  <input type="hidden" value={dropoff.lat} />
                  <input type="hidden" value={dropoff.lng} />
                  <div className="ukl-field-row">
                    <div className="ukl-field ukl-field--half">
                      <label>Отримувач</label>
                      <input
                        type="text"
  
                        value={dropoff.contact_name}
                        onChange={e => updateDropoff(idx, 'contact_name', e.target.value)}
                      />
                    </div>
                    <div className="ukl-field ukl-field--half">
                      <label>Телефон</label>
                      <input
                        type="tel"
  
                        value={dropoff.contact_phone}
                        onChange={e => updateDropoff(idx, 'contact_phone', e.target.value)}
                        onBlur={e => {
                          let v = e.target.value.replace(/\s/g, '');
                          if (/^0\d{9}$/.test(v)) v = '+38' + v;
                          else if (/^38\d{10}$/.test(v)) v = '+' + v;
                          if (v !== dropoff.contact_phone) updateDropoff(idx, 'contact_phone', v);
                        }}
                      />
                    </div>
                  </div>
                  <div className="ukl-field">
                    <label>Коментар</label>
                    <input
                      type="text"
                      value={dropoff.comment}
                      onChange={e => updateDropoff(idx, 'comment', e.target.value)}
                      placeholder="Офіс 305, домофон 12"
                    />
                  </div>
                </div>
              ))}

              {/* Кнопка додати адресу */}
              {dropoffs.length < 9 && (
                <div className="ukl-add-dropoff" onClick={addDropoff}>
                  <span>+ ДОДАТИ АДРЕСУ</span>
                  <span className="ukl-add-dropoff-hint">(до {9 - dropoffs.length} ще)</span>
                </div>
              )}

              {/* ── Параметри ── */}
              <div className="ukl-section">
                <div className="ukl-section-title">ПАРАМЕТРИ</div>
                <div className="ukl-field-row">
                  <div className="ukl-field ukl-field--third">
                    <label>Вага (кг)</label>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                    />
                  </div>
                  <div className="ukl-field ukl-field--third">
                    <label>Страхування</label>
                    <input
                      type="number"
                      min={0}
                      value={insurance}
                      onChange={e => setInsurance(e.target.value)}
                      placeholder="грн"
                    />
                  </div>
                  <div className="ukl-field ukl-field--third">
                    <label>Викуп (COD)</label>
                    <input
                      type="number"
                      min={0}
                      max={2000}
                      value={codAmount}
                      onChange={e => setCodAmount(e.target.value)}
                      placeholder="до 2000"
                    />
                  </div>
                </div>
                <div className="ukl-field-row">
                  <div className="ukl-field ukl-field--half">
                    <label>Відкладена доставка</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, position: 'relative', zIndex: 100 }}>
                        <DatePicker
                          value={scheduledAt ? scheduledAt.split('T')[0] : ''}
                          onChange={date => {
                            const time = scheduledAt ? scheduledAt.split('T')[1] || '12:00' : '12:00';
                            setScheduledAt(date ? `${date}T${time}` : '');
                          }}
                          placeholder="дд.мм.рррр"
                        />
                      </div>
                      <div style={{ width: '5.5rem' }}>
                        <input
                          type="time"
                          className="ukl-time-input"
                          value={scheduledAt ? (scheduledAt.split('T')[1] || '') : ''}
                          onChange={e => {
                            const date = scheduledAt ? scheduledAt.split('T')[0] : dateToISO(new Date());
                            setScheduledAt(e.target.value ? `${date}T${e.target.value}` : '');
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Верифікація віку прибрана — не потрібна для друкарні */}
                </div>
              </div>

              {/* ── Estimate ── */}
              {estimate && (() => {
                // Шукаємо помилку (з estimated_products)
                const ep = estimate?.estimated_products;
                const pe = ep?.[product] || ep?.car || ep?.courier;
                const errCode = pe?.error?.sub_code;

                if (errCode) {
                  return (
                    <div className="ukl-estimate" style={{ background: 'var(--adminlightred, #fde8e5)' }}>
                      <span style={{ color: 'var(--admincoral, #e74c3c)' }}>
                        {errCode === 'no_active_couriers_in_radius'
                          ? 'Немає активних кур\'єрів/водіїв поблизу'
                          : errCode}
                      </span>
                    </div>
                  );
                }

                // Ціна: estimated_products.car.estimation.cost АБО .cost АБО корінь
                const costObj = pe?.estimation?.cost || pe?.cost || (typeof estimate?.cost === 'object' ? estimate.cost : null);
                const currency = pe?.currency || estimate?.currency || 'грн';

                if (costObj && (costObj.recommended || costObj.minimum)) {
                  const min = costObj.minimum;
                  const rec = costObj.recommended;
                  const max = costObj.maximum;
                  return (
                    <div className="ukl-estimate">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span className="ukl-estimate-label">Вартість доставки</span>
                          {min && min !== rec && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--admingrey)' }}>
                              від {min} до {max || rec} {currency}
                            </span>
                          )}
                        </div>
                        <span className="ukl-estimate-price">{rec || min} {currency}</span>
                      </div>
                    </div>
                  );
                }

                // Fallback — число
                const simplePrice = typeof estimate?.cost === 'number' ? estimate.cost : estimate?.price;
                if (simplePrice) {
                  return (
                    <div className="ukl-estimate">
                      <span className="ukl-estimate-label">Вартість:</span>
                      <span className="ukl-estimate-price">{simplePrice} {currency}</span>
                    </div>
                  );
                }

                // Останній fallback
                return (
                  <div className="ukl-estimate">
                    <span className="ukl-estimate-label" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      {JSON.stringify(estimate).substring(0, 200)}
                    </span>
                  </div>
                );
              })()}

              {/* ── Ціна для клієнта ── */}
              {estimate && (() => {
                const dp = calcDeliveryPrice(estimate);
                const threshold = parseFloat(settings.freeDeliveryThreshold);
                const orderTotal = parseFloat(thisOrder?.allPrice || thisOrder?.price || 0);
                const isFree = threshold && orderTotal >= threshold;

                return dp ? (
                  <div style={{ padding: '0.4rem 0.7rem', background: isFree ? 'var(--adminlightgreen, #e8f5e9)' : 'transparent', borderRadius: 6, marginTop: 4, fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--admingrey)' }}>Для клієнта: </span>
                    <span style={{ fontWeight: 700, color: isFree ? 'var(--admingreen)' : '#333' }}>
                      {dp} грн
                    </span>
                    {isFree && (
                      <span style={{ color: 'var(--admingreen)', fontSize: '0.75rem', marginLeft: 6 }}>
                        (замовлення від {threshold} грн)
                      </span>
                    )}
                  </div>
                ) : null;
              })()}

              {/* ── Error ── */}
              {error && (
                <div className="ukl-error">{error}</div>
              )}

              {/* ── Actions ── */}
              <div className="ukl-actions">
                <button
                  className="ukl-btn ukl-btn--estimate"
                  onClick={handleEstimate}
                  disabled={estimating}
                >
                  {estimating ? 'Розрахунок...' : 'РОЗРАХУВАТИ'}
                </button>
                <button
                  type="submit"
                  className="ukl-btn ukl-btn--primary"
                  disabled={loading}
                >
                  {loading ? 'Створення...' : 'ДОСТАВИТИ'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
