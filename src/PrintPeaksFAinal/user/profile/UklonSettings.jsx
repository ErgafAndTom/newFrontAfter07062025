import React, { useState, useCallback, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import { loadSetting, saveSetting } from "../../../hooks/useUserSettings";
import UklonAddressInput from "../../userInNewUiArtem/UklonAddressInput";
import "./NovaPoshtaSettings.css"; // Reuse nps-* styles

const DEFAULTS = {
  clientId: '',
  clientSecret: '',
  appUid: '',
  apiUrl: 'https://deliverygateway.uklon.com.ua',
  pickupAddress: '',
  pickupLat: '',
  pickupLng: '',
  pickupPhone: '+38 067 750 96 76',
  pickupName: 'PrintPeaks',
  pickupComment: '',
  defaultWeight: '1',
  defaultInsurance: '',
  verificationRequired: false,
  freeDeliveryThreshold: '',  // сума замовлення від якої доставка 1 грн
};

export default function UklonSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [dirtyFields, setDirtyFields] = useState(new Set());
  const [apiStatus, setApiStatus] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');


  useEffect(() => {
    loadSetting('uklon_settings', DEFAULTS).then(val => {
      setSettings(val);
      setLoaded(true);
    });
  }, []);

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirtyFields(prev => new Set(prev).add(key));
  }, []);

  const saveField = useCallback((field) => {
    saveSetting('uklon_settings', settings);
    setDirtyFields(prev => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, [settings]);

  const saveAll = useCallback(() => {
    saveSetting('uklon_settings', settings);
    setDirtyFields(new Set());
  }, [settings]);

  const reset = useCallback(() => {
    setSettings(DEFAULTS);
    saveSetting('uklon_settings', DEFAULTS);
    setDirtyFields(new Set());
  }, []);

  const handleCheckApi = async () => {
    setApiLoading(true);
    try {
      // Спочатку зберігаємо поточні налаштування в БД (як fallback)
      await saveSetting('uklon_settings', settings);
      setDirtyFields(new Set());
      const { data } = await axios.get('/api/uklon/status');
      setApiStatus(data);
    } catch (err) {
      setApiStatus({ ok: false, msg: err?.response?.data?.error || err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const [webhookNote, setWebhookNote] = useState('');

  const handleRegisterWebhook = async () => {
    setWebhookLoading(true);
    setWebhookNote('');
    try {
      const { data } = await axios.post('/api/uklon/webhook/register');
      setWebhookStatus(data.success ? 'ok' : 'error');
      if (data.url) setWebhookUrl(data.url);
      if (data.note) setWebhookNote(data.note);
    } catch (err) {
      setWebhookStatus('error');
    } finally {
      setWebhookLoading(false);
    }
  };

  // Завантажити webhook URL з бекенду
  useEffect(() => {
    axios.get('/api/uklon/webhook/status').then(r => {
      if (r.data?.url) setWebhookUrl(r.data.url);
    }).catch(() => {});
  }, []);

  // Перевірити чи .env має пріоритет
  const [envActive, setEnvActive] = useState(false);
  useEffect(() => {
    axios.get('/api/uklon/env-status').then(r => {
      if (r.data?.envActive) setEnvActive(true);
    }).catch(() => {});
  }, []);

  const SaveBtn = ({ field }) =>
    dirtyFields.has(field) ? (
      <button className="nps-btn nps-btn--field-save" onClick={() => saveField(field)}>✓</button>
    ) : null;

  return (
    <div className="nps-wrap">
      {/* ── Заголовок ── */}
      <div className="nps-header">
        <span className="nps-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/uklon-logo.png"
            alt="Uklon"
            style={{ height: '1.5rem', width: 'auto' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          Uklon Delivery
        </span>
      </div>

      {/* ── API Credentials ── */}
      <div className="nps-section nps-section--full">
        <div className="nps-section-title">API Авторизація</div>
        {envActive && (
          <div className="nps-row" style={{ background: 'var(--adminlightgreen, #e8f5e9)', padding: '0.5rem 1rem', borderRadius: 6, marginBottom: 8 }}>
            <span style={{ color: 'var(--admingreen)', fontSize: '0.85rem' }}>
              ✓ Креденшали беруться з .env (пріоритет над налаштуваннями нижче)
            </span>
          </div>
        )}
        <div className="nps-row">
          <label className="nps-label">Client ID</label>
          <input
            className="nps-input nps-input--wide"
            type="text"
            value={settings.clientId}
            onChange={e => update('clientId', e.target.value)}
            placeholder="Вставте Client ID від Uklon"
          />
          <SaveBtn field="clientId" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Client Secret</label>
          <div className="nps-api-key-row">
            <input
              className="nps-input nps-input--wide"
              type={showSecret ? 'text' : 'password'}
              value={settings.clientSecret}
              onChange={e => update('clientSecret', e.target.value)}
              placeholder="Вставте Client Secret від Uklon"
            />
            <button
              className="nps-toggle-vis"
              onClick={() => setShowSecret(!showSecret)}
              title={showSecret ? 'Сховати' : 'Показати'}
            >
              {showSecret ? '🙈' : '👁'}
            </button>
          </div>
          <SaveBtn field="clientSecret" />
        </div>
        <div className="nps-row">
          <label className="nps-label">App UID</label>
          <input
            className="nps-input nps-input--wide"
            type="text"
            value={settings.appUid}
            onChange={e => update('appUid', e.target.value)}
            placeholder="App UID (якщо надали окремо)"
          />
          <SaveBtn field="appUid" />
        </div>
        <div className="nps-row">
          <label className="nps-label">API URL</label>
          <input
            className="nps-input nps-input--wide"
            type="text"
            value={settings.apiUrl}
            onChange={e => update('apiUrl', e.target.value)}
            placeholder="https://business-api.uklon.com.ua"
          />
          <SaveBtn field="apiUrl" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Статус</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {apiStatus ? (
              <span className="nps-value" style={{ color: apiStatus.ok ? 'var(--admingreen)' : 'var(--adminred)' }}>
                {apiStatus.msg}
              </span>
            ) : (
              <span className="nps-value">Не перевірено</span>
            )}
            <button
              className="nps-btn nps-btn--test"
              onClick={handleCheckApi}
              disabled={apiLoading || !settings.clientId || !settings.clientSecret}
              style={{ minWidth: 100 }}
            >
              {apiLoading ? 'Перевірка...' : 'Перевірити'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Webhook ── */}
      <div className="nps-section nps-section--full">
        <div className="nps-section-title">Webhook</div>
        <div className="nps-row">
          <label className="nps-label">URL</label>
          <input
            className="nps-input nps-input--wide"
            type="text"
            value={webhookUrl || 'Натисніть "Зареєструвати"'}
            readOnly
            style={{ color: webhookUrl ? 'inherit' : 'var(--admingrey)', cursor: 'default' }}
          />
        </div>
        <div className="nps-row">
          <label className="nps-label">Статус</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="nps-value" style={{ color: webhookStatus === 'ok' ? 'var(--admingreen)' : webhookStatus === 'error' ? 'var(--adminred)' : 'var(--admingrey)' }}>
              {webhookStatus === 'ok' ? '✓ Зареєстровано' : webhookStatus === 'error' ? '✗ Помилка' : 'Не зареєстровано'}
            </span>
            <button
              className="nps-btn nps-btn--test"
              onClick={handleRegisterWebhook}
              disabled={webhookLoading}
              style={{ minWidth: 120 }}
            >
              {webhookLoading ? 'Реєстрація...' : 'Зареєструвати'}
            </button>
          </div>
        </div>
        {webhookNote && (
          <div className="nps-row" style={{ background: 'var(--adminlightyellow, #fff8e1)', padding: '0.5rem 1rem', borderRadius: 6 }}>
            <span style={{ color: 'var(--adminorange, #f59e0b)', fontSize: '0.85rem' }}>
              ⚠ {webhookNote}
            </span>
          </div>
        )}
      </div>

      {/* ── Адреса забору (за замовчуванням) ── */}
      <div className="nps-section nps-section--full">
        <div className="nps-section-title">Адреса забору (за замовчуванням)</div>
        <div className="nps-row">
          <label className="nps-label">Адреса</label>
          <UklonAddressInput
            value={settings.pickupAddress}
            className="nps-input nps-input--wide"
            onChange={val => update('pickupAddress', val)}
            onAddressSelect={({ name, lat, lng }) => {
              update('pickupAddress', name);
              if (lat) update('pickupLat', lat);
              if (lng) update('pickupLng', lng);
              // Автозбереження
              setTimeout(() => {
                saveSetting('uklon_settings', {
                  ...settings,
                  pickupAddress: name,
                  pickupLat: lat || settings.pickupLat,
                  pickupLng: lng || settings.pickupLng,
                });
                setDirtyFields(new Set());
              }, 100);
            }}
            placeholder="вул. Велика Васильківська 24, Київ"
          />
          <SaveBtn field="pickupAddress" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Lat</label>
          <input
            className="nps-input"
            type="text"
            value={settings.pickupLat}
            onChange={e => update('pickupLat', e.target.value)}
            placeholder="50.4501"
            style={{ width: 120 }}
          />
          <SaveBtn field="pickupLat" />
          <label className="nps-label" style={{ marginLeft: '1rem' }}>Lng</label>
          <input
            className="nps-input"
            type="text"
            value={settings.pickupLng}
            onChange={e => update('pickupLng', e.target.value)}
            placeholder="30.5234"
            style={{ width: 120 }}
          />
          <SaveBtn field="pickupLng" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Контакт</label>
          <input
            className="nps-input nps-input--wide"
            type="text"
            value={settings.pickupName}
            onChange={e => update('pickupName', e.target.value)}
            placeholder="PrintPeaks"
          />
          <SaveBtn field="pickupName" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Телефон</label>
          <input
            className="nps-input nps-input--wide"
            type="text"
            value={settings.pickupPhone}
            onChange={e => update('pickupPhone', e.target.value)}
            placeholder="+38 067 750 96 76"
          />
          <SaveBtn field="pickupPhone" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Коментар</label>
          <input
            className="nps-input nps-input--wide"
            type="text"
            value={settings.pickupComment}
            onChange={e => update('pickupComment', e.target.value)}
            placeholder="2 поверх, ліфт"
          />
          <SaveBtn field="pickupComment" />
        </div>
      </div>

      {/* ── Параметри доставки ── */}
      <div className="nps-section">
        <div className="nps-section-title">Параметри за замовчуванням</div>
        <div className="nps-row">
          <label className="nps-label">Вага (кг)</label>
          <input
            className="nps-input"
            type="number"
            min={0.1}
            step={0.1}
            value={settings.defaultWeight}
            onChange={e => update('defaultWeight', e.target.value)}
          />
          <SaveBtn field="defaultWeight" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Страхова вартість</label>
          <input
            className="nps-input"
            type="number"
            min={0}
            value={settings.defaultInsurance}
            onChange={e => update('defaultInsurance', e.target.value)}
            placeholder="0"
          />
          <span className="nps-value">грн</span>
          <SaveBtn field="defaultInsurance" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Верифікація</label>
          <button
            className={`nps-btn ${settings.verificationRequired ? 'nps-btn--save' : 'nps-btn--reset'}`}
            style={{ minWidth: 80 }}
            onClick={() => update('verificationRequired', !settings.verificationRequired)}
          >
            {settings.verificationRequired ? 'Увімк.' : 'Вимк.'}
          </button>
          <SaveBtn field="verificationRequired" />
        </div>
        <div className="nps-row">
          <label className="nps-label">Безкоштовна доставка від</label>
          <input
            className="nps-input"
            type="number"
            min={0}
            value={settings.freeDeliveryThreshold}
            onChange={e => update('freeDeliveryThreshold', e.target.value)}
            placeholder="напр. 1000"
          />
          <span className="nps-value">грн (доставка = 1 грн)</span>
          <SaveBtn field="freeDeliveryThreshold" />
        </div>
      </div>

      {/* ── Інформація ── */}
      <div className="nps-section">
        <div className="nps-section-title">Можливості</div>
        <div className="nps-row">
          <label className="nps-label">Доставка</label>
          <span className="nps-value">від адреси до адреси</span>
        </div>
        <div className="nps-row">
          <label className="nps-label">Мультидоставка</label>
          <span className="nps-value">до 9 адрес</span>
        </div>
        <div className="nps-row">
          <label className="nps-label">Викуп (COD)</label>
          <span className="nps-value">до 2 000 грн</span>
        </div>
        <div className="nps-row">
          <label className="nps-label">Додаткова вага</label>
          <span className="nps-value">до 50 кг</span>
        </div>
        <div className="nps-row">
          <label className="nps-label">Верифікація</label>
          <span className="nps-value">отримувач по коду</span>
        </div>
        <div className="nps-row">
          <label className="nps-label">Трекінг</label>
          <span className="nps-value">онлайн, в реальному часі</span>
        </div>
      </div>

      {/* ── Кнопки ── */}
      <div className="nps-actions">
        {dirtyFields.size > 0 && (
          <button className="nps-btn nps-btn--save" onClick={saveAll}>
            ✓ Зберегти все
          </button>
        )}
        <button className="nps-btn nps-btn--reset" onClick={reset}>
          Скинути все
        </button>
      </div>
    </div>
  );
}
