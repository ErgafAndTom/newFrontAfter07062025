import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import NovaPoshtaButton from "./novaPoshta/NovaPoshtaButton";
import NovaPoshtaAddressButton from "./novaPoshta/NovaPoshtaAddressButton";
import "./NP.css";

function NP({ showNP, setShowNP, thisOrder, setThisOrder, prefillData }) {
  const [formData, setFormData] = useState({
    SenderWarehouseIndex: '',
    CitySender: 'Київ',
    SenderAddress: '',
    SendersPhone: '+38 067 750 96 76',
    SenderName: 'Пилипенко Артем Юрійович',
    RecipientWarehouseIndex: '',
    CityRecipient: 'Київ',
    RecipientAddress: '',
    RecipientsPhone: prefillData?.RecipientsPhone || thisOrder?.User?.phoneNumber || '+38',
    RecipientName: '',
    ServiceType: 'WarehouseWarehouse',
    PaymentMethod: 'Cash',
    PayerType: 'Recipient',
    Cost: prefillData?.Cost || '1',
    CargoType: prefillData?.CargoType || 'Cargo',
    Weight: prefillData?.Weight || '1',
    SeatsAmount: prefillData?.SeatsAmount || '1',
    Description: prefillData?.Description || '',
    BackwardDelivery: false,
    BackwardDeliverySum: '',
    BackwardDeliveryPayer: 'Recipient',
    IsFragile: false,
    Length: prefillData?.Length || '1',
    Width: prefillData?.Width || '1',
    Height: prefillData?.Height || '1',
    Volume: (() => {
      const lCm = (parseFloat(prefillData?.Length) || 1) / 10;
      const wCm = (parseFloat(prefillData?.Width) || 1) / 10;
      const hCm = (parseFloat(prefillData?.Height) || 1) / 10;
      const v = lCm * wCm * hCm / 4000;
      return v > 0 ? v.toFixed(4) : '';
    })(),
    departmentId: null,
    // Address delivery fields
    RecipientAddressStreet: '',
    RecipientAddressBuilding: '',
    RecipientAddressFlat: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [senderAddresses, setSenderAddresses] = useState([]);
  const [senderAddressesLoading, setSenderAddressesLoading] = useState(false);

  const handleClose = () => setShowNP(false);

  const [senderMode, setSenderMode] = useState('warehouse'); // 'warehouse' | 'address'
  const [recipientMode, setRecipientMode] = useState('warehouse'); // 'warehouse' | 'address'
  const [recipientType, setRecipientType] = useState('PrivatePerson'); // 'PrivatePerson' | 'Organization'

  const deriveServiceType = (sMod, rMod) => {
    const s = sMod === 'address' ? 'Doors' : 'Warehouse';
    const r = rMod === 'address' ? 'Doors' : 'Warehouse';
    return `${s}${r}`;
  };

  const handleSenderMode = (mode) => {
    setSenderMode(mode);
    setFormData((prev) => ({
      ...prev,
      ServiceType: deriveServiceType(mode, recipientMode),
    }));
  };

  const handleRecipientMode = (mode) => {
    setRecipientMode(mode);
    setFormData((prev) => ({
      ...prev,
      ServiceType: deriveServiceType(senderMode, mode),
    }));
  };

  const isSenderDoor = senderMode === 'address';
  const isDoorDelivery = recipientMode === 'address';

  const handleDepartmentSelect = (departmentId, allData, description, cityRef, departmentRef) => {
    setFormData((prev) => ({
      ...prev,
      CityRecipient: cityRef,
      RecipientAddress: departmentRef,
      Recipient: departmentId,
    }));
  };

  const handleDepartmentSelect1 = (departmentId, allData, description, cityRef, departmentRef) => {
    setFormData((prev) => ({
      ...prev,
      CitySender: cityRef,
      SenderAddress: departmentRef,
      Sender: departmentId,
    }));
  };

  const handleSenderAddressSelect = ({ city, street, building, flat, cityRef, streetRef }) => {
    setFormData((prev) => ({
      ...prev,
      CitySender: cityRef || prev.CitySender,
      SenderAddressStreet: street,
      SenderAddressBuilding: building,
      SenderAddressFlat: flat,
      SenderStreetRef: streetRef || '',
    }));
  };

  const handleAddressSelect = ({ city, street, building, flat, cityRef, streetRef }) => {
    setFormData((prev) => ({
      ...prev,
      CityRecipient: cityRef || prev.CityRecipient,
      RecipientAddressStreet: street,
      RecipientAddressBuilding: building,
      RecipientAddressFlat: flat,
      RecipientStreetRef: streetRef || '',
    }));
  };

  const handlePhone = (e) => {
    const { name, value } = e.target;
    const prefix = '+38';
    if (!value.startsWith(prefix)) {
      const digits = value.replace(/[^\d]/g, '');
      const cleaned = digits.startsWith('38') ? '+' + digits : prefix + digits;
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Load sender addresses from NP account
  useEffect(() => {
    (async () => {
      setSenderAddressesLoading(true);
      try {
        const res = await axios.get('/novaposhta/sender-addresses');
        const addrs = res.data?.data || [];
        setSenderAddresses(addrs);
        // Auto-select first address if nothing set
        if (addrs.length > 0 && !formData.SenderAddress) {
          setFormData(prev => ({
            ...prev,
            CitySender: addrs[0].cityRef,
            SenderAddress: addrs[0].ref,
          }));
        }
      } catch (e) {
        console.warn('[NP] Failed to load sender addresses:', e.message);
      }
      setSenderAddressesLoading(false);
    })();
  }, []); // eslint-disable-line

  const handleSenderAddressChange = (e) => {
    const ref = e.target.value;
    const addr = senderAddresses.find(a => a.ref === ref);
    if (addr) {
      setFormData(prev => ({
        ...prev,
        CitySender: addr.cityRef,
        SenderAddress: addr.ref,
      }));
      setSenderMode('warehouse');
    }
  };

  // Auto-calculate volume: (L_mm/10 × W_mm/10 × H_mm/10) / 4000 (мм→см→м³, Nova Poshta formula)
  const calcVolume = (l, w, h) => {
    const lCm = (parseFloat(l) || 0) / 10;
    const wCm = (parseFloat(w) || 0) / 10;
    const hCm = (parseFloat(h) || 0) / 10;
    const vol = lCm * wCm * hCm / 4000;
    return vol > 0 ? vol.toFixed(4) : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (['Length', 'Width', 'Height'].includes(name)) {
        next.Volume = calcVolume(
          name === 'Length' ? value : prev.Length,
          name === 'Width' ? value : prev.Width,
          name === 'Height' ? value : prev.Height
        );
      }
      if (name === 'Cost' && prev.BackwardDelivery) {
        next.BackwardDeliverySum = value;
      }
      if (name === 'PayerType') {
        next.PaymentMethod = value === 'Recipient' ? 'Cash' : 'NonCash';
      }
      return next;
    });
    if (name === 'ServiceType') {
      setSenderMode(value.startsWith('Doors') ? 'address' : 'warehouse');
      setRecipientMode(value.endsWith('Doors') ? 'address' : 'warehouse');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post('/novaposhta/create', {
        ...formData,
        orderId: thisOrder?.id || null,
        RecipientType: recipientType,
        senderMode,
        recipientMode,
      }, { timeout: 60000 });
      if (response.data?.success) {
        setResult(response.data);
      } else {
        setError((response.data?.errors || []).join(', ') || 'Невідома помилка');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.errors?.join(', ') || err.message;
      console.error('[NP] TTN creation error:', errMsg, err.response?.data);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!showNP) return null;

  return (
    <div className="np-overlay" onClick={handleClose}>
      <div className="np-modal" onClick={(e) => e.stopPropagation()}>
        {/* Body */}
        <div className="np-body">
          <form onSubmit={handleSubmit}>
            {/* Відправник */}
            <div className="np-legend">Відправник</div>
            <div className="np-fields-row">
              <div className="np-field" style={{ flex: 1.6 }}>
                <span className="np-field-label">ПІБ</span>
                <input className="np-field-input" type="text" name="SenderName"
                  value={formData.SenderName} onChange={handleChange} required />
              </div>
              <div className="np-field">
                <span className="np-field-label">Телефон</span>
                <input className="np-field-input" type="text" name="SendersPhone"
                  value={formData.SendersPhone} onChange={handlePhone} required />
              </div>
            </div>
            {senderAddresses.length > 0 && (
              <div className="np-field" style={{ marginBottom: '0.5rem' }}>
                <span className="np-field-label">Збережені адреси</span>
                <select className="np-field-select np-field-select--active"
                  value={formData.SenderAddress || ''}
                  onChange={handleSenderAddressChange}>
                  {senderAddresses.map(a => (
                    <option key={a.ref} value={a.ref}>
                      {a.cityDescription} — {a.description}
                    </option>
                  ))}
                  <option value="">Інша адреса...</option>
                </select>
              </div>
            )}
            {(!formData.SenderAddress || !senderAddresses.find(a => a.ref === formData.SenderAddress)) && (
              <>
                <div className="np-delivery-tabs">
                  <button type="button"
                    className={`np-delivery-tab${senderMode === 'warehouse' ? ' np-delivery-tab--active' : ''}`}
                    onClick={() => handleSenderMode('warehouse')}>
                    Відділення / Поштомат
                  </button>
                  <button type="button"
                    className={`np-delivery-tab${senderMode === 'address' ? ' np-delivery-tab--active' : ''}`}
                    onClick={() => handleSenderMode('address')}>
                    Адресна доставка
                  </button>
                </div>
                {!isSenderDoor && (
                  <div className="np-department">
                    <NovaPoshtaButton onDepartmentSelect={handleDepartmentSelect1} />
                  </div>
                )}
                {isSenderDoor && (
                  <div className="np-department">
                    <NovaPoshtaAddressButton
                      onAddressSelect={handleSenderAddressSelect}
                      cityName={formData.CitySender}
                    />
                  </div>
                )}
              </>
            )}

            {/* Одержувач */}
            <div className="np-legend">Одержувач</div>
            <div className="np-delivery-tabs">
              <button type="button"
                className={`np-delivery-tab${recipientType === 'PrivatePerson' ? ' np-delivery-tab--active' : ''}`}
                onClick={() => setRecipientType('PrivatePerson')}>
                Фізична особа
              </button>
              <button type="button"
                className={`np-delivery-tab${recipientType === 'Organization' ? ' np-delivery-tab--active' : ''}`}
                onClick={() => setRecipientType('Organization')}>
                Організація
              </button>
            </div>
            <div className="np-fields-row">
              {recipientType === 'Organization' && (
                <div className="np-field" style={{ flex: 0.85 }}>
                  <span className="np-field-label">ЄДРПОУ</span>
                  <input className="np-field-input" type="text" name="RecipientEDRPOU"
                    value={formData.RecipientEDRPOU || ''} onChange={handleChange} />
                </div>
              )}
              <div className="np-field" style={{ flex: 1.6 }}>
                <span className="np-field-label">{recipientType === 'Organization' ? 'Назва' : 'ПІБ'}</span>
                <input className="np-field-input" type="text" name="RecipientName"
                  value={formData.RecipientName} onChange={handleChange} required />
              </div>
              <div className="np-field" style={{ flex: 1.15 }}>
                <span className="np-field-label">Телефон</span>
                <input className="np-field-input" type="text" name="RecipientsPhone"
                  value={formData.RecipientsPhone} onChange={handlePhone} required />
              </div>
            </div>
            <div className="np-delivery-tabs">
              <button type="button"
                className={`np-delivery-tab${recipientMode === 'warehouse' ? ' np-delivery-tab--active' : ''}`}
                onClick={() => handleRecipientMode('warehouse')}>
                Відділення / Поштомат
              </button>
              <button type="button"
                className={`np-delivery-tab${recipientMode === 'address' ? ' np-delivery-tab--active' : ''}`}
                onClick={() => handleRecipientMode('address')}>
                Адресна доставка
              </button>
            </div>
            {!isDoorDelivery && (
              <div className="np-department">
                <NovaPoshtaButton onDepartmentSelect={handleDepartmentSelect} />
              </div>
            )}
            {isDoorDelivery && (
              <div className="np-department">
                <NovaPoshtaAddressButton
                  onAddressSelect={handleAddressSelect}
                  cityName={formData.CityRecipient}
                />
              </div>
            )}

            {/* Деталі */}
            <div className="np-legend">Деталі відправлення</div>
            <div className="np-fields-row">
              <div className="np-field">
                <span className="np-field-label">Тип сервісу</span>
                <select className="np-field-select" name="ServiceType"
                  value={formData.ServiceType} onChange={handleChange}>
                  <option value="WarehouseWarehouse">Відділення-Відділення</option>
                  <option value="WarehouseDoors">Відділення-Адреса</option>
                  <option value="DoorsWarehouse">Адреса-Відділення</option>
                  <option value="DoorsDoors">Адреса-Адреса</option>
                </select>
              </div>
              <div className="np-field">
                <span className="np-field-label">Спосіб оплати</span>
                <select className="np-field-select np-field-select--active" name="PaymentMethod"
                  value={formData.PaymentMethod} onChange={handleChange}>
                  <option value="NonCash">Безготівка</option>
                  <option value="Cash">Готівка</option>
                </select>
              </div>
              <div className="np-field">
                <span className="np-field-label">Платник</span>
                <select className="np-field-select np-field-select--active" name="PayerType"
                  value={formData.PayerType} onChange={handleChange}>
                  <option value="Sender">Відправник</option>
                  <option value="Recipient">Одержувач</option>
                  <option value="ThirdPerson">Третя особа</option>
                </select>
              </div>
            </div>

            <div className="np-fields-row">
              <div className="np-field">
                <span className="np-field-label">Оголошена вартість</span>
                <input className="np-field-input" type="number" name="Cost"
                  value={formData.Cost} onChange={handleChange} required />
              </div>
              <div className="np-field">
                <span className="np-field-label">Тип вантажу</span>
                <select className="np-field-select" name="CargoType"
                  value={formData.CargoType} onChange={handleChange}>
                  <option value="Cargo">Вантаж</option>
                  <option value="Documents">Документи</option>
                </select>
              </div>
            </div>

            <div className="np-fields-row">
              <div className="np-field">
                <span className="np-field-label">Вага (кг)</span>
                <input className="np-field-input" type="number" name="Weight" step="0.01"
                  value={formData.Weight} onChange={handleChange} required />
              </div>
              <div className="np-field" style={{ pointerEvents: 'none' }}>
                <span className="np-field-label">Кількість місць</span>
                <input className="np-field-input" type="number" name="SeatsAmount"
                  value={formData.SeatsAmount} readOnly
                  style={{ borderBottom: 'none', opacity: 0.5 }} />
              </div>
            </div>

            <div className="np-fields-row">
              <div className="np-field" style={{ flex: 2 }}>
                <span className="np-field-label">Опис вантажу</span>
                <input className="np-field-input" type="text" name="Description"
                  value={formData.Description} onChange={handleChange} />
              </div>
            </div>

            <div className="np-dims-row">
              <div className="np-field">
                <span className="np-field-label">Довжина (мм)</span>
                <input className="np-field-input" type="number" name="Length"
                  value={formData.Length} onChange={handleChange} />
              </div>
              <div className="np-field">
                <span className="np-field-label">Ширина (мм)</span>
                <input className="np-field-input" type="number" name="Width"
                  value={formData.Width} onChange={handleChange} />
              </div>
              <div className="np-field">
                <span className="np-field-label">Висота (мм)</span>
                <input className="np-field-input" type="number" name="Height"
                  value={formData.Height} onChange={handleChange} />
              </div>
              <div className="np-field">
                <span className="np-field-label">Об'єм (м³)</span>
                <input className="np-field-input" type="text" name="Volume"
                  value={formData.Volume} readOnly style={{ opacity: 0.7 }} />
              </div>
            </div>

            {/* Додаткові опції */}
            <div className="np-fields-row" style={{ marginTop: '0.5rem' }}>
              <div className="np-field" style={{ flex: 'none' }}>
                <label className="np-checkbox-label">
                  <input type="checkbox" checked={formData.BackwardDelivery}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      BackwardDelivery: e.target.checked,
                      BackwardDeliverySum: e.target.checked ? prev.Cost : '',
                    }))} />
                  <span>Наложений платіж</span>
                </label>
              </div>
              {formData.BackwardDelivery && (
                <>
                  <div className="np-field">
                    <span className="np-field-label">Сума (грн)</span>
                    <input className="np-field-input" type="number" step="0.01"
                      value={formData.BackwardDeliverySum}
                      onChange={e => setFormData(prev => ({ ...prev, BackwardDeliverySum: e.target.value }))}
                      required />
                  </div>
                  <div className="np-field">
                    <span className="np-field-label">Платник зворотної доставки</span>
                    <select className="np-field-select" value={formData.BackwardDeliveryPayer}
                      onChange={e => setFormData(prev => ({ ...prev, BackwardDeliveryPayer: e.target.value }))}>
                      <option value="Recipient">Одержувач</option>
                      <option value="Sender">Відправник</option>
                    </select>
                  </div>
                </>
              )}
              <div className="np-field" style={{ flex: 'none' }}>
                <label className="np-checkbox-label">
                  <input type="checkbox" checked={formData.IsFragile}
                    onChange={e => setFormData(prev => ({ ...prev, IsFragile: e.target.checked }))} />
                  <span>Крихке</span>
                </label>
              </div>
            </div>

            {formData.PaymentMethod === 'NonCash' && formData.PayerType === 'Recipient' && (
              <div className="np-warning">
                Безготівка недоступна для платника «Одержувач». Змініть спосіб оплати на «Готівка» або платника на «Відправник».
              </div>
            )}

            {!result?.success && (
              <button className="np-submit-btn" type="submit"
                disabled={loading || (formData.PaymentMethod === 'NonCash' && formData.PayerType === 'Recipient')}>
                <span>{loading ? 'Створення...' : 'Створити накладну'}</span>
              </button>
            )}
          </form>

          {result && result.success && (
            <div className="np-result">
              <div className="np-result-title">
                ТТН створено: {result.data?.[0]?.IntDocNumber || '—'}
              </div>
              <div style={{ fontSize: 'var(--fontsmall, 13px)', color: 'var(--admingrey)', marginTop: '0.3rem' }}>
                Вартість доставки: {result.data?.[0]?.CostOnSite || '—'} грн
                {result.data?.[0]?.EstimatedDeliveryDate && ` • Орієнтовна доставка: ${result.data[0].EstimatedDeliveryDate}`}
              </div>
              {result.data?.[0]?.Ref && (
                <button
                  type="button"
                  className="np-submit-btn np-print-btn"
                  onClick={() => window.open(`/novaposhta/print/${result.data[0].Ref}`, '_blank')}
                >
                  <span>Друк наліпки</span>
                </button>
              )}
            </div>
          )}
          {error && <div className="np-error">Помилка: {error}</div>}
        </div>
      </div>
    </div>
  );
}

export default NP;
