import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axiosInstance";
import { loadSetting, saveSetting } from "../../hooks/useUserSettings";
import NovaPoshtaButton from "./novaPoshta/NovaPoshtaButton";
import NovaPoshtaAddressButton from "./novaPoshta/NovaPoshtaAddressButton";
import NovaPoshtaThermalButton from "../novaPoshta/NovaPoshtaThermalButton";
import {
  NpHeader,
  NpCheck,
  NpSegment,
  NpAlert,
  NpFieldError,
  npInvalid,
  focusNpField,
  clientDisplayName,
  fmtNum,
  formatTtn,
  NP_DESCRIPTION_MAX,
  NP_DEFAULT_DESCRIPTION,
} from "../novaPoshta/NpBrand";
import {
  describeNpError,
  describeFieldErrors,
  fieldErrorsOf,
  validateWaybill,
} from "../novaPoshta/npErrors";
import "../novaPoshta/NovaPoshta.css";

// НП приймає опис до 36 символів, додаткову інформацію — до 100 (решту обрізає бекенд)
const DESCRIPTION_PRESETS = ["Друкована продукція", "Поліграфічна продукція", "Документи"];

// Підпис збереженої адреси у списку
const savedAddrLabel = (a) =>
  a.addressType === 'address'
    ? `${a.cityDescription || 'Київ'} — ${a.street || ''}${a.building ? ', ' + a.building : ''}`
    : a.shortName
      ? `${a.cityDescription || 'Київ'} — ${a.shortName}`
      : a.label || `${a.cityDescription} — ${a.description}`;

// Об'ємна вага НП, кг: Д×Ш×В (мм → см) / 4000
const volWeightMm = (l, w, h) =>
  ((parseFloat(l) || 0) / 10) * ((parseFloat(w) || 0) / 10) * ((parseFloat(h) || 0) / 10) / 4000;
const round2 = (n) => Math.round(n * 100) / 100;

// Місце багатомісної ТТН. actual — фактична вага: зміна габаритів не опускає вагу нижче
// за неї, а показуємо більшу з фактичної й об'ємної — за нею НП рахує тариф.
let nextSeatId = 1;
const toSeat = (s) => {
  const actual = parseFloat(s.Weight) || 0;
  return {
    id: nextSeatId++,
    Length: String(s.Length || '1'),
    Width: String(s.Width || '1'),
    Height: String(s.Height || '1'),
    Weight: Math.max(0.1, volWeightMm(s.Length, s.Width, s.Height), actual).toFixed(2),
    actual,
    CargoType: s.CargoType || 'Cargo',
    Pack: s.Pack || '',
  };
};

function NP({ showNP, setShowNP, thisOrder, setThisOrder, prefillData, onCloseAll }) {
  const [formData, setFormData] = useState({
    SenderWarehouseIndex: '',
    CitySender: 'Київ',
    SenderCityName: 'Київ',
    SenderAddress: '',
    SendersPhone: '+38 067 750 96 76',
    SenderName: 'Пилипенко Артем Юрійович',
    RecipientWarehouseIndex: '',
    CityRecipient: 'Київ',
    RecipientCityName: 'Київ',
    RecipientAddress: '',
    RecipientsPhone: prefillData?.RecipientsPhone || thisOrder?.User?.phoneNumber || '+38',
    RecipientName: (() => {
      const u = thisOrder?.User;
      if (!u) return '';
      const parts = [u.familyName, u.firstName, u.lastName].filter(Boolean);
      return parts.length > 0 ? parts.join(' ') : (u.username || u.name || '');
    })(),
    ServiceType: 'WarehouseWarehouse',
    PaymentMethod: 'Cash',
    PayerType: 'Recipient',
    Cost: prefillData?.Cost || '1',
    CargoType: prefillData?.CargoType || 'Cargo',
    Weight: (() => {
      const lCm = (parseFloat(prefillData?.Length) || 1) / 10;
      const wCm = (parseFloat(prefillData?.Width) || 1) / 10;
      const hCm = (parseFloat(prefillData?.Height) || 1) / 10;
      const vw = lCm * wCm * hCm / 4000;
      const prefillW = parseFloat(prefillData?.Weight) || 0;
      return Math.max(0.1, vw, prefillW).toFixed(2);
    })(),
    SeatsAmount: prefillData?.SeatsAmount || '1',
    Description: prefillData?.Description || NP_DEFAULT_DESCRIPTION,
    // Перелік позицій з калькулятора — у формі не показується, але друкується в накладній
    AdditionalInformation: prefillData?.AdditionalInformation || '',
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
      return parseFloat(v.toFixed(4)) > 0 ? v.toFixed(4) : '';
    })(),
    departmentId: null,
    // Address delivery fields
    RecipientAddressStreet: '',
    RecipientAddressBuilding: '',
    RecipientAddressFlat: '',
  });
  const [result, setResult] = useState(null);
  // error — опис помилки сервера/НП (describeNpError); serverErrors — її прив'язка
  // до полів { поле: { text, sig } }: тримається, поки значення поля те саме
  const [error, setError] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  // Після першої спроби відправити поля перевіряються наживо
  const [submitted, setSubmitted] = useState(false);
  const [thermalError, setThermalError] = useState(null);
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [senderAddresses, setSenderAddresses] = useState([]);
  const [senderAddressesLoading, setSenderAddressesLoading] = useState(false);
  const [savedSenderAddresses, setSavedSenderAddresses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [savedRecipientAddresses, setSavedRecipientAddresses] = useState([]);
  const [allRecipientAddresses, setAllRecipientAddresses] = useState([]);
  const [selectedRecipientSavedId, setSelectedRecipientSavedId] = useState('');
  const [savedRecipientContact, setSavedRecipientContact] = useState(null);
  const [allRecipientContacts, setAllRecipientContacts] = useState([]);
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
  const [autoFilledFrom, setAutoFilledFrom] = useState(null);
  const lastWidgetDescription = useRef('');
  const lastRecipientWidgetData = useRef({});
  const phoneLookupTimer = useRef(null);
  const lastLookupTail = useRef('');
  const autoFilledRef = useRef(false);
  const recipientNameRef = useRef('');
  recipientNameRef.current = formData.RecipientName;

  // Назад до посилок
  const handleClose = () => setShowNP(false);
  // Хрестик закриває все вікно НП (якщо його відкрили з калькулятора посилок)
  const handleCloseAll = () => (onCloseAll ? onCloseAll() : setShowNP(false));

  // Блок відправника згорнутий у картку, поки адреса вже обрана
  const [senderOpen, setSenderOpen] = useState(false);
  const [ttnCopied, setTtnCopied] = useState(false);
  // Фактична вага: зміна габаритів не може опустити вагу нижче за неї
  const actualWeightRef = useRef(parseFloat(prefillData?.Weight) || 0);
  // Кілька місць однієї ТТН (посилки з калькулятора). Порожньо — одне місце в полях Length/Width/Height/Weight
  const [seats, setSeats] = useState(() =>
    Array.isArray(prefillData?.Seats) && prefillData.Seats.length > 1 ? prefillData.Seats.map(toSeat) : []
  );
  const isMultiSeat = seats.length > 1;

  const [senderMode, setSenderMode] = useState('warehouse'); // 'warehouse' | 'address'
  const [recipientMode, setRecipientMode] = useState('warehouse'); // 'warehouse' | 'address'
  const [recipientType, setRecipientType] = useState('PrivatePerson'); // 'PrivatePerson' | 'Organization'

  // Спосіб оплати за замовчуванням: організація-одержувач платить безготівкою
  // (за договором з НП), фізособа-одержувач — лише готівкою. Тип одержувача
  // ставиться і вручну, і з контакту/автопідстановки — тому ефект, а не onChange.
  useEffect(() => {
    const method = formData.PayerType === 'Recipient' && recipientType === 'Organization' ? 'NonCash' : 'Cash';
    setFormData((prev) => (prev.PaymentMethod === method ? prev : { ...prev, PaymentMethod: method }));
  }, [recipientType, formData.PayerType]);

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
    const shortName = allData?.shortName || allData?.name || '';
    const cityName = allData?.addressParts?.city || allData?.cityName || 'Київ';
    lastRecipientWidgetData.current = {
      cityDescription: cityName,
      shortName,
      description: shortName || description || '',
    };
    setSelectedRecipientSavedId('');
    setFormData((prev) => ({
      ...prev,
      CityRecipient: cityRef,
      RecipientCityName: cityName,
      RecipientAddress: departmentRef,
      Recipient: departmentId,
    }));
  };

  const lastWidgetData = useRef({});
  const handleDepartmentSelect1 = (departmentId, allData, description, cityRef, departmentRef) => {
    const shortName = allData?.shortName || allData?.name || '';
    lastWidgetDescription.current = shortName || description || '';
    const cityName = allData?.addressParts?.city || allData?.cityName || 'Київ';
    lastWidgetData.current = {
      cityDescription: cityName,
      description: shortName || description || '',
      shortName,
    };
    setSelectedSavedId('');
    setFormData((prev) => ({
      ...prev,
      CitySender: cityRef,
      SenderCityName: cityName,
      SenderAddress: departmentRef,
      SenderAddressRef: '',
      Sender: departmentId,
    }));
  };

  const handleSenderAddressSelect = ({ city, street, building, flat, cityRef, streetRef }) => {
    setSelectedSavedId('');
    setFormData((prev) => ({
      ...prev,
      CitySender: cityRef || prev.CitySender,
      SenderCityName: city || prev.SenderCityName,
      SenderAddressStreet: street,
      SenderAddressBuilding: building,
      SenderAddressFlat: flat,
      SenderStreetRef: streetRef || '',
      SenderAddressRef: '',
    }));
  };

  const handleAddressSelect = ({ city, street, building, flat, cityRef, streetRef }) => {
    setSelectedRecipientSavedId('');
    setFormData((prev) => ({
      ...prev,
      CityRecipient: cityRef || prev.CityRecipient,
      RecipientCityName: city || prev.RecipientCityName,
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

  // ── Підстановка ПІБ одержувача за номером телефону ──
  const phoneTail = (p) => String(p || '').replace(/\D/g, '').slice(-9);

  const SOURCE_LABEL = {
    saved: 'зі збережених контактів',
    client: 'з бази клієнтів',
    waybill: 'з попередніх ТТН',
    np: 'з кабінету НП',
  };

  const applyRecipientSuggestion = (s, auto = false) => {
    setFormData((prev) => ({
      ...prev,
      RecipientName: s.name,
      RecipientEDRPOU: s.edrpou || prev.RecipientEDRPOU || '',
    }));
    if (s.recipientType === 'Organization' || s.recipientType === 'PrivatePerson') {
      setRecipientType(s.recipientType);
    }
    autoFilledRef.current = true;
    setAutoFilledFrom(s.source || (auto ? 'client' : null));
  };

  const lookupRecipientByPhone = async (digits) => {
    const tail = digits.slice(-9);
    // 1. Локально: збережені контакти та адреси одержувачів
    const local = [];
    allRecipientContacts.forEach((c) => {
      if (c.name && phoneTail(c.phone) === tail) {
        local.push({ name: c.name, phone: c.phone, edrpou: c.edrpou, recipientType: c.recipientType, source: 'saved' });
      }
    });
    allRecipientAddresses.forEach((a) => {
      if (a.recipientName && phoneTail(a.recipientPhone) === tail) {
        local.push({ name: a.recipientName, phone: a.recipientPhone, source: 'saved' });
      }
    });

    // 2. Сервер: клієнти в базі → історія ТТН → кабінет НП
    let remote = [];
    setPhoneLookupLoading(true);
    try {
      const { data } = await axios.get('/novaposhta/recipient-by-phone', { params: { phone: digits } });
      remote = data?.suggestions || [];
    } catch (e) {
      console.warn('[NP] Phone lookup failed:', e.message);
    } finally {
      setPhoneLookupLoading(false);
    }

    const merged = [];
    const seen = new Set();
    [...local, ...remote].forEach((s) => {
      const key = (s.name || '').trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      merged.push(s);
    });
    setPhoneSuggestions(merged);

    // Автопідстановка — лише якщо поле порожнє або туди вже підставляли автоматично
    const current = (recipientNameRef.current || '').trim();
    if (merged.length > 0 && (!current || autoFilledRef.current)) {
      applyRecipientSuggestion(merged[0], true);
    }
  };

  useEffect(() => {
    const digits = String(formData.RecipientsPhone || '').replace(/\D/g, '');
    const tail = digits.slice(-9);
    if (tail.length < 9) {
      setPhoneSuggestions([]);
      setAutoFilledFrom(null);
      lastLookupTail.current = '';
      return;
    }
    if (lastLookupTail.current === tail) return;
    clearTimeout(phoneLookupTimer.current);
    phoneLookupTimer.current = setTimeout(() => {
      lastLookupTail.current = tail;
      lookupRecipientByPhone(digits);
    }, 450);
    return () => clearTimeout(phoneLookupTimer.current);
  }, [formData.RecipientsPhone, allRecipientContacts, allRecipientAddresses]); // eslint-disable-line

  // Load sender addresses from NP account + locally saved
  useEffect(() => {
    (async () => {
      setSenderAddressesLoading(true);
      let apiAddrs = [];
      let savedAddrs = [];
      try {
        const res = await axios.get('/novaposhta/sender-addresses');
        apiAddrs = res.data?.data || [];
        setSenderAddresses(apiAddrs);
      } catch (e) {
        console.warn('[NP] Failed to load sender addresses:', e.message);
      }
      try {
        const saved = await loadSetting('np_sender_addresses', { addresses: [] });
        savedAddrs = Array.isArray(saved?.addresses) ? saved.addresses : [];
        setSavedSenderAddresses(savedAddrs);
      } catch (e) {
        console.warn('[NP] Failed to load saved sender addresses:', e.message);
      }
      // Auto-select лише збережених. Адреси з кабінету НП — курʼєрські (двері), а не
      // відділення: підставлена сама, така адреса мовчки змінила б тип доставки
      if (!formData.SenderAddress) {
        if (savedAddrs.length > 0) {
          const first = savedAddrs[0];
          setSelectedSavedId(first.id);
          if (first.addressType === 'address') {
            setSenderMode('address');
            setFormData(prev => ({
              ...prev,
              CitySender: first.cityRef || prev.CitySender,
              SenderCityName: first.cityDescription || prev.SenderCityName,
              SenderAddress: '',
              SenderAddressStreet: first.street || '',
              SenderAddressBuilding: first.building || '',
              SenderAddressFlat: first.flat || '',
              SenderStreetRef: first.streetRef || '',
              SenderName: first.senderName || prev.SenderName,
              SendersPhone: first.sendersPhone || prev.SendersPhone,
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              CitySender: first.cityRef || prev.CitySender,
              SenderCityName: first.cityDescription || prev.SenderCityName,
              SenderAddress: first.warehouseRef,
              SenderName: first.senderName || prev.SenderName,
              SendersPhone: first.sendersPhone || prev.SendersPhone,
            }));
          }
        }
      }
      setSenderAddressesLoading(false);
    })();
  }, []); // eslint-disable-line

  // Load saved recipient addresses for this client
  const clientId = thisOrder?.User?.id || thisOrder?.userId || thisOrder?.UserId || '0';
  useEffect(() => {
    (async () => {
      try {
        const saved = await loadSetting('np_recipient_addresses', { addresses: [] });
        const all = Array.isArray(saved?.addresses) ? saved.addresses : [];
        setAllRecipientAddresses(all);
        const forClient = clientId ? all.filter(a => String(a.clientId) === String(clientId)) : [];
        setSavedRecipientAddresses(forClient);
        // Auto-select першу збережену адресу для цього клієнта
        if (forClient.length > 0) {
          const first = forClient[0];
          setSelectedRecipientSavedId(first.id);
          if (first.addressType === 'address') {
            setRecipientMode('address');
            setFormData(prev => ({
              ...prev,
              CityRecipient: first.cityRef || prev.CityRecipient,
              RecipientCityName: first.cityDescription || prev.RecipientCityName,
              RecipientAddress: '',
              RecipientAddressStreet: first.street || '',
              RecipientAddressBuilding: first.building || '',
              RecipientAddressFlat: first.flat || '',
              RecipientStreetRef: first.streetRef || '',
              RecipientName: first.recipientName || prev.RecipientName,
              RecipientsPhone: first.recipientPhone || prev.RecipientsPhone,
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              CityRecipient: first.cityRef || prev.CityRecipient,
              RecipientCityName: first.cityDescription || prev.RecipientCityName,
              RecipientAddress: first.warehouseRef,
              RecipientName: first.recipientName || prev.RecipientName,
              RecipientsPhone: first.recipientPhone || prev.RecipientsPhone,
            }));
          }
        }
      } catch (e) {
        console.warn('[NP] Failed to load saved recipient addresses:', e.message);
      }
      // Завантажити збережені контакти одержувача
      try {
        const savedC = await loadSetting('np_recipient_contacts', { contacts: [] });
        const allC = Array.isArray(savedC?.contacts) ? savedC.contacts : [];
        setAllRecipientContacts(allC);
        const contact = allC.find(c => String(c.clientId) === String(clientId));
        if (contact) {
          setSavedRecipientContact(contact);
          setFormData(prev => ({
            ...prev,
            RecipientName: contact.name || prev.RecipientName,
            RecipientsPhone: contact.phone || prev.RecipientsPhone,
            RecipientEDRPOU: contact.edrpou || prev.RecipientEDRPOU || '',
          }));
          if (contact.recipientType) setRecipientType(contact.recipientType);
        }
      } catch (e) {
        console.warn('[NP] Failed to load saved recipient contacts:', e.message);
      }
    })();
  }, [clientId]); // eslint-disable-line

  const handleSenderAddressChange = (e) => {
    const val = e.target.value;
    if (!val) {
      // "Інша адреса..." — скидаємо щоб показати віджет
      setSelectedSavedId('');
      setFormData(prev => ({
        ...prev,
        SenderAddress: '',
        SenderAddressRef: '',
        SenderAddressStreet: '',
        SenderAddressBuilding: '',
        SenderAddressFlat: '',
        SenderStreetRef: '',
        SenderCityName: prev.SenderCityName || 'Київ',
      }));
      return;
    }
    // Шукаємо в збережених по id
    const savedAddr = savedSenderAddresses.find(a => a.id === val);
    if (savedAddr) {
      setSelectedSavedId(savedAddr.id);
      if (savedAddr.addressType === 'address') {
        setSenderMode('address');
        setFormData(prev => ({
          ...prev,
          CitySender: savedAddr.cityRef || prev.CitySender,
          SenderCityName: savedAddr.cityDescription || prev.SenderCityName,
          SenderAddress: '',
          SenderAddressRef: '',
          SenderAddressStreet: savedAddr.street || '',
          SenderAddressBuilding: savedAddr.building || '',
          SenderAddressFlat: savedAddr.flat || '',
          SenderStreetRef: savedAddr.streetRef || '',
          SenderName: savedAddr.senderName || prev.SenderName,
          SendersPhone: savedAddr.sendersPhone || prev.SendersPhone,
          ServiceType: deriveServiceType('address', recipientMode),
        }));
      } else {
        setSenderMode('warehouse');
        setFormData(prev => ({
          ...prev,
          CitySender: savedAddr.cityRef || prev.CitySender,
          SenderCityName: savedAddr.cityDescription || prev.SenderCityName,
          SenderAddress: savedAddr.warehouseRef,
          SenderAddressRef: '',
          SenderName: savedAddr.senderName || prev.SenderName,
          SendersPhone: savedAddr.sendersPhone || prev.SendersPhone,
          ServiceType: deriveServiceType('warehouse', recipientMode),
        }));
      }
      return;
    }
    // Потім адреси з кабінету НП — курʼєрські (двері): Ref іде окремим полем
    // SenderAddressRef, бекенд бере його як є, без створення дубля адреси в НП
    setSelectedSavedId('');
    const addr = senderAddresses.find(a => a.ref === val);
    if (addr) {
      const door = addr.addressType === 'address';
      const mode = door ? 'address' : 'warehouse';
      setSenderMode(mode);
      setFormData(prev => ({
        ...prev,
        CitySender: addr.cityRef,
        SenderCityName: addr.cityDescription || prev.SenderCityName,
        SenderAddress: door ? '' : addr.ref,
        SenderAddressRef: door ? addr.ref : '',
        SenderAddressStreet: door ? addr.streetDescription || '' : '',
        SenderAddressBuilding: door ? addr.building || '' : '',
        SenderAddressFlat: door ? addr.flat || '' : '',
        SenderStreetRef: '',
        ServiceType: deriveServiceType(mode, recipientMode),
      }));
    }
  };

  // Перевірка чи поточна адреса (warehouse або address) вже збережена
  const getCurrentSavedAddr = () => {
    // обрано адресу з кабінету НП — локальних збережених вона не стосується
    if (formData.SenderAddressRef) return null;
    if (senderMode === 'address') {
      const street = formData.SenderAddressStreet || '';
      const bld = formData.SenderAddressBuilding || '';
      if (!street) return null;
      return savedSenderAddresses.find(a =>
        a.addressType === 'address' && a.street === street && a.building === bld
      );
    }
    if (!formData.SenderAddress) return null;
    return savedSenderAddresses.find(a => a.warehouseRef === formData.SenderAddress);
  };

  // Перевірка чи є що зберігати
  const canSaveAddress = () => {
    // адреса з кабінету НП уже збережена там; локальна копія без StreetRef не пройшла б перевірку
    if (formData.SenderAddressRef) return false;
    if (senderMode === 'address') {
      return !!(formData.SenderAddressStreet);
    }
    return !!formData.SenderAddress;
  };

  const handleSaveCurrentAddress = async () => {
    const isAddr = senderMode === 'address';
    const cityDescription = formData.SenderCityName || lastWidgetData.current?.cityDescription || '';

    if (isAddr) {
      // Зберігаємо адресну доставку
      const street = formData.SenderAddressStreet || '';
      const bld = formData.SenderAddressBuilding || '';
      if (!street) return;
      // Перевірка дублікатів
      if (savedSenderAddresses.find(a => a.addressType === 'address' && a.street === street && a.building === bld)) return;

      const label = `${cityDescription} — ${street}${bld ? ', ' + bld : ''}`;
      const newAddr = {
        id: Date.now().toString(),
        label,
        shortName: '',
        cityRef: formData.CitySender,
        cityDescription,
        warehouseRef: '',
        description: label,
        addressType: 'address',
        street,
        building: bld,
        flat: formData.SenderAddressFlat || '',
        streetRef: formData.SenderStreetRef || '',
        senderName: formData.SenderName,
        sendersPhone: formData.SendersPhone,
        savedAt: new Date().toISOString(),
      };
      const updated = [...savedSenderAddresses, newAddr];
      setSavedSenderAddresses(updated);
      setSelectedSavedId(newAddr.id);
      await saveSetting('np_sender_addresses', { addresses: updated });
    } else {
      // Зберігаємо відділення
      if (!formData.SenderAddress) return;
      if (savedSenderAddresses.find(a => a.warehouseRef === formData.SenderAddress)) return;

      const apiAddr = senderAddresses.find(a => a.ref === formData.SenderAddress);
      const shortName = lastWidgetData.current?.shortName
        || lastWidgetDescription.current
        || apiAddr?.description
        || '';
      const cdesc = lastWidgetData.current?.cityDescription
        || apiAddr?.cityDescription
        || cityDescription
        || '';
      const description = lastWidgetData.current?.description || shortName;

      const label = shortName
        ? `${cdesc} — ${shortName}`
        : `${cdesc} — ${formData.SenderAddress.substring(0, 8)}...`;

      const newAddr = {
        id: Date.now().toString(),
        label,
        shortName,
        cityRef: formData.CitySender,
        cityDescription: cdesc,
        warehouseRef: formData.SenderAddress,
        description,
        addressType: 'warehouse',
        senderName: formData.SenderName,
        sendersPhone: formData.SendersPhone,
        savedAt: new Date().toISOString(),
      };
      const updated = [...savedSenderAddresses, newAddr];
      setSavedSenderAddresses(updated);
      setSelectedSavedId(newAddr.id);
      await saveSetting('np_sender_addresses', { addresses: updated });
    }
  };

  const handleDeleteSavedAddress = async (id) => {
    const updated = savedSenderAddresses.filter(a => a.id !== id);
    setSavedSenderAddresses(updated);
    setSelectedSavedId('');
    setFormData(prev => ({ ...prev, SenderAddress: '' }));
    await saveSetting('np_sender_addresses', { addresses: updated });
  };

  // ── Recipient saved addresses ──

  const handleRecipientAddressChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setSelectedRecipientSavedId('');
      setFormData(prev => ({
        ...prev,
        RecipientAddress: '',
        RecipientAddressStreet: '',
        RecipientAddressBuilding: '',
        RecipientAddressFlat: '',
        RecipientStreetRef: '',
      }));
      return;
    }
    const savedAddr = savedRecipientAddresses.find(a => a.id === val);
    if (savedAddr) {
      setSelectedRecipientSavedId(savedAddr.id);
      if (savedAddr.addressType === 'address') {
        setRecipientMode('address');
        setFormData(prev => ({
          ...prev,
          CityRecipient: savedAddr.cityRef || prev.CityRecipient,
          RecipientCityName: savedAddr.cityDescription || prev.RecipientCityName,
          RecipientAddress: '',
          RecipientAddressStreet: savedAddr.street || '',
          RecipientAddressBuilding: savedAddr.building || '',
          RecipientAddressFlat: savedAddr.flat || '',
          RecipientStreetRef: savedAddr.streetRef || '',
          RecipientName: savedAddr.recipientName || prev.RecipientName,
          RecipientsPhone: savedAddr.recipientPhone || prev.RecipientsPhone,
          ServiceType: deriveServiceType(senderMode, 'address'),
        }));
      } else {
        setRecipientMode('warehouse');
        setFormData(prev => ({
          ...prev,
          CityRecipient: savedAddr.cityRef || prev.CityRecipient,
          RecipientCityName: savedAddr.cityDescription || prev.RecipientCityName,
          RecipientAddress: savedAddr.warehouseRef,
          RecipientName: savedAddr.recipientName || prev.RecipientName,
          RecipientsPhone: savedAddr.recipientPhone || prev.RecipientsPhone,
          ServiceType: deriveServiceType(senderMode, 'warehouse'),
        }));
      }
      return;
    }
    setSelectedRecipientSavedId('');
  };

  const getRecipientCurrentSaved = () => {
    if (recipientMode === 'address') {
      const street = formData.RecipientAddressStreet || '';
      if (!street) return null;
      return savedRecipientAddresses.find(a =>
        a.addressType === 'address' && a.street === street && a.building === (formData.RecipientAddressBuilding || '')
      );
    }
    if (!formData.RecipientAddress) return null;
    return savedRecipientAddresses.find(a => a.warehouseRef === formData.RecipientAddress);
  };

  const canSaveRecipientAddress = () => {
    if (recipientMode === 'address') return !!(formData.RecipientAddressStreet);
    return !!formData.RecipientAddress;
  };

  const handleSaveRecipientAddress = async () => {
    const isAddr = recipientMode === 'address';
    const cityDescription = formData.RecipientCityName || lastRecipientWidgetData.current?.cityDescription || '';

    if (isAddr) {
      const street = formData.RecipientAddressStreet || '';
      const bld = formData.RecipientAddressBuilding || '';
      if (!street) return;
      if (savedRecipientAddresses.find(a => a.addressType === 'address' && a.street === street && a.building === bld)) return;

      const label = `${cityDescription} — ${street}${bld ? ', ' + bld : ''}`;
      const newAddr = {
        id: Date.now().toString(),
        clientId: String(clientId),
        label,
        shortName: '',
        cityRef: formData.CityRecipient,
        cityDescription,
        warehouseRef: '',
        description: label,
        addressType: 'address',
        street,
        building: bld,
        flat: formData.RecipientAddressFlat || '',
        streetRef: formData.RecipientStreetRef || '',
        recipientName: formData.RecipientName,
        recipientPhone: formData.RecipientsPhone,
        savedAt: new Date().toISOString(),
      };
      const updatedForClient = [...savedRecipientAddresses, newAddr];
      setSavedRecipientAddresses(updatedForClient);
      setSelectedRecipientSavedId(newAddr.id);
      const updatedAll = [...allRecipientAddresses.filter(a => String(a.clientId) !== String(clientId)), ...updatedForClient];
      setAllRecipientAddresses(updatedAll);
      await saveSetting('np_recipient_addresses', { addresses: updatedAll });
    } else {
      if (!formData.RecipientAddress) return;
      if (savedRecipientAddresses.find(a => a.warehouseRef === formData.RecipientAddress)) return;

      const shortName = lastRecipientWidgetData.current?.shortName || '';
      const cdesc = lastRecipientWidgetData.current?.cityDescription || cityDescription || '';
      const description = lastRecipientWidgetData.current?.description || shortName;
      const label = shortName
        ? `${cdesc} — ${shortName}`
        : `${cdesc} — ${formData.RecipientAddress.substring(0, 8)}...`;

      const newAddr = {
        id: Date.now().toString(),
        clientId: String(clientId),
        label,
        shortName,
        cityRef: formData.CityRecipient,
        cityDescription: cdesc,
        warehouseRef: formData.RecipientAddress,
        description,
        addressType: 'warehouse',
        recipientName: formData.RecipientName,
        recipientPhone: formData.RecipientsPhone,
        savedAt: new Date().toISOString(),
      };
      const updatedForClient = [...savedRecipientAddresses, newAddr];
      setSavedRecipientAddresses(updatedForClient);
      setSelectedRecipientSavedId(newAddr.id);
      const updatedAll = [...allRecipientAddresses.filter(a => String(a.clientId) !== String(clientId)), ...updatedForClient];
      setAllRecipientAddresses(updatedAll);
      await saveSetting('np_recipient_addresses', { addresses: updatedAll });
    }
  };

  const handleDeleteRecipientAddress = async (id) => {
    const updatedForClient = savedRecipientAddresses.filter(a => a.id !== id);
    setSavedRecipientAddresses(updatedForClient);
    setSelectedRecipientSavedId('');
    setFormData(prev => ({ ...prev, RecipientAddress: '' }));
    const updatedAll = allRecipientAddresses.filter(a => a.id !== id);
    setAllRecipientAddresses(updatedAll);
    await saveSetting('np_recipient_addresses', { addresses: updatedAll });
  };

  // ── Recipient contact save/delete ──

  const isContactChanged = () => {
    if (!savedRecipientContact) return !!(formData.RecipientName || formData.RecipientsPhone?.length > 3);
    return (
      formData.RecipientName !== savedRecipientContact.name ||
      formData.RecipientsPhone !== savedRecipientContact.phone ||
      (formData.RecipientEDRPOU || '') !== (savedRecipientContact.edrpou || '') ||
      recipientType !== savedRecipientContact.recipientType
    );
  };

  const handleSaveRecipientContact = async () => {
    const contact = {
      clientId: String(clientId),
      name: formData.RecipientName,
      phone: formData.RecipientsPhone,
      edrpou: formData.RecipientEDRPOU || '',
      recipientType,
      savedAt: new Date().toISOString(),
    };
    setSavedRecipientContact(contact);
    const updatedAll = [
      ...allRecipientContacts.filter(c => String(c.clientId) !== String(clientId)),
      contact,
    ];
    setAllRecipientContacts(updatedAll);
    await saveSetting('np_recipient_contacts', { contacts: updatedAll });
  };

  const handleDeleteRecipientContact = async () => {
    setSavedRecipientContact(null);
    const updatedAll = allRecipientContacts.filter(c => String(c.clientId) !== String(clientId));
    setAllRecipientContacts(updatedAll);
    await saveSetting('np_recipient_contacts', { contacts: updatedAll });
  };

  // Об'ємна вага для показу у формі (кг, не м³) — L×W×H(cm) / 4000.
  // Бекенд поле Volume не використовує: VolumeGeneral у м³ рахує сам із габаритів.
  const calcVolume = (l, w, h) => {
    const lCm = (parseFloat(l) || 0) / 10;
    const wCm = (parseFloat(w) || 0) / 10;
    const hCm = (parseFloat(h) || 0) / 10;
    const vol = lCm * wCm * hCm / 4000;
    return parseFloat(vol.toFixed(4)) > 0 ? vol.toFixed(4) : '';
  };

  // Volumetric weight in kg: same formula, min 0.1 (NP minimum)
  const calcVolWeight = (l, w, h) => {
    const lCm = (parseFloat(l) || 0) / 10;
    const wCm = (parseFloat(w) || 0) / 10;
    const hCm = (parseFloat(h) || 0) / 10;
    const vw = lCm * wCm * hCm / 4000;
    return Math.max(0.1, vw).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'RecipientName') {
      // Ручне редагування — більше не перезаписуємо ПІБ автопідстановкою
      autoFilledRef.current = false;
      setAutoFilledFrom(null);
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (['Length', 'Width', 'Height'].includes(name)) {
        const l = name === 'Length' ? value : prev.Length;
        const w = name === 'Width' ? value : prev.Width;
        const h = name === 'Height' ? value : prev.Height;
        next.Volume = calcVolume(l, w, h);
        // НП тарифікує за більшою з фактичної та об'ємної ваги
        next.Weight = Math.max(parseFloat(calcVolWeight(l, w, h)), actualWeightRef.current || 0).toFixed(2);
      }
      if (name === 'Weight') {
        actualWeightRef.current = parseFloat(value) || 0;
      }
      if (name === 'Cost' && prev.BackwardDelivery) {
        next.BackwardDeliverySum = value;
      }
      return next;
    });
    if (name === 'ServiceType') {
      setSenderMode(value.startsWith('Doors') ? 'address' : 'warehouse');
      setRecipientMode(value.endsWith('Doors') ? 'address' : 'warehouse');
    }
  };

  // ── Місця багатомісної ТТН ──
  const editSeat = (id, name, value) => {
    setSeats((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const next = { ...s, [name]: value };
      if (['Length', 'Width', 'Height'].includes(name)) {
        next.Weight = Math.max(parseFloat(calcVolWeight(next.Length, next.Width, next.Height)), s.actual || 0).toFixed(2);
      }
      if (name === 'Weight') next.actual = parseFloat(value) || 0;
      return next;
    }));
  };

  // Нове місце — копія останнього: найчастіше це ще одна така сама коробка
  const addSeat = () => {
    if (isMultiSeat) {
      const last = seats[seats.length - 1];
      setSeats([...seats, { ...last, id: nextSeatId++ }]);
      return;
    }
    const single = {
      id: nextSeatId++,
      Length: formData.Length,
      Width: formData.Width,
      Height: formData.Height,
      Weight: formData.Weight,
      actual: actualWeightRef.current,
      CargoType: formData.CargoType,
      Pack: '',
    };
    setSeats([single, { ...single, id: nextSeatId++ }]);
  };

  const removeSeat = (id) => {
    const rest = seats.filter((s) => s.id !== id);
    if (rest.length > 1) {
      setSeats(rest);
      return;
    }
    // Лишилось одне місце — назад до звичайних полів габаритів і ваги
    const [only] = rest;
    actualWeightRef.current = only.actual || 0;
    setFormData((prev) => ({
      ...prev,
      Length: only.Length,
      Width: only.Width,
      Height: only.Height,
      Weight: only.Weight,
      Volume: calcVolume(only.Length, only.Width, only.Height),
    }));
    setSeats([]);
  };

  const seatsWeight = round2(seats.reduce((sum, s) => sum + (parseFloat(s.Weight) || 0), 0));
  const seatsVolWeight = round2(seats.reduce((sum, s) => sum + volWeightMm(s.Length, s.Width, s.Height), 0));

  // ── Помилки полів ──
  const validationOpts = { senderMode, recipientMode, recipientType, seats, isMultiSeat };

  // «Відбиток» значення поля: помилка від НП зникає, щойно поле змінили
  const fieldSig = (field) => {
    const f = formData;
    switch (field) {
      case 'senderAddress':
        return JSON.stringify([senderMode, f.SenderAddress, f.SenderAddressStreet, f.SenderStreetRef, f.CitySender, selectedSavedId]);
      case 'recipientAddress':
        return JSON.stringify([recipientMode, f.RecipientAddress, f.RecipientAddressStreet, f.RecipientStreetRef, f.CityRecipient, selectedRecipientSavedId]);
      case 'dims':
        return JSON.stringify([f.Length, f.Width, f.Height, seats.map((s) => [s.Length, s.Width, s.Height])]);
      case 'seats':
        return JSON.stringify(seats.map((s) => [s.Length, s.Width, s.Height, s.Weight]));
      case 'payment':
        return JSON.stringify([f.PayerType, f.PaymentMethod]);
      case 'RecipientName':
        return JSON.stringify([f.RecipientName, recipientType]);
      default:
        return JSON.stringify(f[field] ?? '');
    }
  };

  const clientErrors = submitted ? validateWaybill(formData, validationOpts) : {};
  const liveServerErrors = {};
  Object.entries(serverErrors).forEach(([field, { text, sig }]) => {
    if (fieldSig(field) === sig) liveServerErrors[field] = text;
  });
  const fieldErrors = { ...liveServerErrors, ...clientErrors };
  const senderHasErrors = ['SenderName', 'SendersPhone', 'senderAddress'].some((f) => fieldErrors[f]);

  // Блок унизу: спершу незаповнені поля, інакше — відповідь сервера/НП
  // без пунктів, які вже виправлено
  const footAlert = (() => {
    if (Object.keys(clientErrors).length) return { ...describeFieldErrors(clientErrors, 'create'), compact: true };
    if (!error) return null;
    const items = error.items.filter((i) => !i.field || liveServerErrors[i.field]);
    if (error.items.length && !items.length) return null;
    // «виправте позначені поля» не лишаємо, коли позначених полів уже немає
    const fieldsFixed = error.items.some((i) => i.field) && !items.some((i) => i.field);
    return { ...error, items, hint: fieldsFixed ? '' : error.hint };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setSubmitted(true);
    const invalid = validateWaybill(formData, validationOpts);
    if (Object.keys(invalid).length) {
      setError(null);
      setServerErrors({});
      if (['SenderName', 'SendersPhone', 'senderAddress'].some((f) => invalid[f])) setSenderOpen(true);
      // поле з'явиться після рендера (картка відправника могла бути згорнута)
      const first = Object.keys(invalid)[0];
      setTimeout(() => focusNpField(first), 30);
      return;
    }
    setLoading(true);
    setError(null);
    setServerErrors({});
    setResult(null);
    // Помилку сервера чи НП — у блок, а її поля — під самі поля
    const fail = (errOrData) => {
      const described = describeNpError(errOrData, 'create');
      const byField = fieldErrorsOf(described);
      const sigs = {};
      Object.entries(byField).forEach(([field, text]) => { sigs[field] = { text, sig: fieldSig(field) }; });
      setError(described);
      setServerErrors(sigs);
      if (['SenderName', 'SendersPhone', 'senderAddress'].some((f) => byField[f])) setSenderOpen(true);
    };
    // Кілька місць — масивом Seats (мм, кг), загальна вага = сума; одне місце — старим форматом
    const shipment = isMultiSeat
      ? {
          Seats: seats.map(({ Length, Width, Height, Weight, CargoType }) => ({ Length, Width, Height, Weight, CargoType })),
          SeatsAmount: String(seats.length),
          Weight: String(seatsWeight),
          Length: seats[0].Length,
          Width: seats[0].Width,
          Height: seats[0].Height,
        }
      : { SeatsAmount: '1' };
    try {
      const response = await axios.post('/novaposhta/create', {
        ...formData,
        ...shipment,
        orderId: thisOrder?.id || null,
        RecipientType: recipientType,
        senderMode,
        recipientMode,
      }, { timeout: 60000 });
      if (response.data?.success) {
        setResult(response.data);
        // Якщо наложений платіж — оновити Payment в thisOrder
        if (formData.BackwardDelivery && formData.BackwardDeliverySum && thisOrder?.id) {
          setThisOrder(prev => prev ? ({
            ...prev,
            Payment: {
              ...prev?.Payment,
              orderId: thisOrder.id,
              status: 'CREATED',
              method: 'cod',
              amount: Math.round(parseFloat(formData.BackwardDeliverySum) * 100),
            },
          }) : prev);
        }
      } else {
        console.error('[NP] TTN rejected:', response.data);
        fail(response.data || 'Нова Пошта не повернула відповіді');
      }
    } catch (err) {
      console.error('[NP] TTN creation error:', err.message, err.response?.data);
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  if (!showNP) return null;

  const clientName = clientDisplayName(thisOrder?.User);
  const setField = (name, value) => handleChange({ target: { name, value } });

  // ── Відправник: поки адресу обрано, показуємо картку замість форми ──
  const senderAddrLabel = (() => {
    if (selectedSavedId) {
      const a = savedSenderAddresses.find((x) => x.id === selectedSavedId);
      if (a) return savedAddrLabel(a);
    }
    if (senderMode === 'address') {
      const fromNp = formData.SenderAddressRef && senderAddresses.find((x) => x.ref === formData.SenderAddressRef);
      if (fromNp) return `${fromNp.cityDescription} — ${fromNp.description}`;
      return formData.SenderAddressStreet
        ? `${formData.SenderCityName || ''} — ${formData.SenderAddressStreet}${formData.SenderAddressBuilding ? ', ' + formData.SenderAddressBuilding : ''}`
        : '';
    }
    if (formData.SenderAddress) {
      const a = senderAddresses.find((x) => x.ref === formData.SenderAddress);
      if (a) return `${a.cityDescription} — ${a.description}`;
      const wd = lastWidgetData.current;
      return wd?.shortName
        ? `${wd.cityDescription || formData.SenderCityName} — ${wd.shortName}`
        : `${formData.SenderCityName} — відділення обрано`;
    }
    return '';
  })();
  const senderReady = !!(formData.SenderName && formData.SendersPhone && senderAddrLabel);
  // помилка в полях відправника розгортає картку, інакше її не видно
  const showSenderEditor = senderOpen || (!senderAddressesLoading && !senderReady) || senderHasErrors;

  const isOrg = recipientType === 'Organization';
  const descLen = (formData.Description || '').length;
  const descTooLong = descLen > NP_DESCRIPTION_MAX;
  const payStatus = thisOrder?.Payment?.status;
  const codDisabled = payStatus === 'PAID' || payStatus === 'CREATED';
  const codReason = payStatus === 'PAID' ? 'замовлення оплачено' : payStatus === 'CREATED' ? 'очікується оплата' : '';
  // Безготівкою одержувач платить лише як організація з договором НП
  const nonCashForbidden = formData.PayerType === 'Recipient' && !isOrg;
  const nonCashBlocked = formData.PaymentMethod === 'NonCash' && nonCashForbidden;
  const seatsCount = isMultiSeat ? seats.length : 1;
  const ttn = result?.data?.[0];

  const PAYER_LABEL = { Sender: 'Відправник', Recipient: 'Одержувач', ThirdPerson: 'Третя особа' };

  const copyTtn = () => {
    const raw = String(ttn?.IntDocNumber || '');
    if (!raw || !navigator.clipboard) return;
    navigator.clipboard.writeText(raw).then(() => {
      setTtnCopied(true);
      setTimeout(() => setTtnCopied(false), 1600);
    }).catch(() => {});
  };

  // Підказки ПІБ за номером телефону
  const phoneHint = (() => {
    const current = (formData.RecipientName || '').trim().toLowerCase();
    const others = phoneSuggestions.filter(s => (s.name || '').trim().toLowerCase() !== current);
    if (!phoneLookupLoading && !autoFilledFrom && others.length === 0) return null;
    return (
      <div className="npw-phone-hint">
        {phoneLookupLoading && (
          <span className="npw-phone-hint-label">Шукаю ПІБ за номером…</span>
        )}
        {!phoneLookupLoading && autoFilledFrom && (
          <span className="npw-phone-hint-label">
            ПІБ підставлено {SOURCE_LABEL[autoFilledFrom] || ''}
          </span>
        )}
        {!phoneLookupLoading && others.length > 0 && (
          <>
            <span className="npw-phone-hint-label">{autoFilledFrom ? 'Інші:' : 'Знайдено за номером:'}</span>
            {others.slice(0, 4).map((s, i) => (
              <button type="button" key={`sug-${i}-${s.name}`}
                className="npw-chip-btn"
                title={`Підставити: ${s.name}${SOURCE_LABEL[s.source] ? ' (' + SOURCE_LABEL[s.source] + ')' : ''}`}
                onClick={() => applyRecipientSuggestion(s)}>
                {s.name}
              </button>
            ))}
          </>
        )}
      </div>
    );
  })();

  // Запам'ятати / забути контакт одержувача для цього клієнта
  const contactAction = isContactChanged() ? (
    <button type="button" className="npw-link-btn"
      onClick={handleSaveRecipientContact}
      title="Зберегти ПІБ і телефон одержувача для цього клієнта">
      Запам'ятати контакт
    </button>
  ) : savedRecipientContact ? (
    <span className="npw-saved-flag">
      ✓ Контакт збережено
      <button type="button" className="npw-link-btn npw-link-btn--danger"
        onClick={handleDeleteRecipientContact}
        title="Видалити збережені контактні дані">
        Забути
      </button>
    </span>
  ) : null;

  const deliveryOptions = [
    { value: 'warehouse', label: 'Відділення / поштомат' },
    { value: 'address', label: 'Адресна доставка' },
  ];

  return (
    <div className="npw-overlay">
      <div className="npw-modal npw-modal--ttn" role="dialog" aria-modal="true"
        aria-label="Нова Пошта — накладна" onClick={(e) => e.stopPropagation()}>
        <NpHeader
          step={1}
          onStep={handleClose}
          orderId={thisOrder?.id}
          clientName={clientName}
          onClose={handleCloseAll}
          closeTitle={onCloseAll ? 'Закрити' : 'Назад до посилок'}
        />

        {result?.success ? (
          <div className="npw-body">
            <div className="npw-done">
              <span className="npw-done-mark" aria-hidden="true">✓</span>
              <div className="npw-done-title">Накладну створено</div>
              <button type="button" className="npw-ttn-num npw-ttn-num--big"
                onClick={copyTtn} title="Скопіювати номер ТТН">
                {formatTtn(ttn?.IntDocNumber) || '—'}
                <span className="npw-ttn-copy">{ttnCopied ? 'скопійовано' : 'копіювати'}</span>
              </button>
              <dl className="npw-stats npw-stats--center">
                <div className="npw-stat">
                  <dt>Доставка</dt>
                  <dd>{ttn?.CostOnSite ?? '—'} <small>грн</small></dd>
                </div>
                {ttn?.EstimatedDeliveryDate && (
                  <div className="npw-stat">
                    <dt>Орієнтовно</dt>
                    <dd>{ttn.EstimatedDeliveryDate}</dd>
                  </div>
                )}
              </dl>
              <div className="npw-done-actions">
                {ttn?.Ref && (
                  <NovaPoshtaThermalButton
                    waybillRef={ttn.Ref}
                    intDocNumber={ttn.IntDocNumber}
                    className="npw-btn npw-btn--primary"
                    onError={setThermalError}
                  />
                )}
                <button type="button" className="npw-btn" onClick={handleClose}>
                  До посилок
                </button>
              </div>
              {thermalError && (
                <div className="npw-done-alert">
                  <NpAlert error={thermalError} onClose={() => setThermalError(null)} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <form className="npw-form" onSubmit={handleSubmit} ref={formRef} noValidate>
            <div className="npw-body">
              <div className="npw-cols">
                {/* ═══════════ ХТО Й КУДИ ═══════════ */}
                <div className="npw-col">
                  {/* Відправник */}
                  <section className="npw-section">
                    <div className="npw-label-row">
                      <h2 className="npw-label">Відправник</h2>
                      {senderReady && (
                        <button type="button" className="npw-link-btn"
                          onClick={() => setSenderOpen((v) => !v)}>
                          {showSenderEditor ? 'Згорнути' : 'Змінити'}
                        </button>
                      )}
                    </div>

                    {!showSenderEditor ? (
                      <button type="button" className="npw-party"
                        onClick={() => setSenderOpen(true)} title="Змінити відправника">
                        <span className="npw-party-line">
                          <span className="npw-party-name">{formData.SenderName}</span>
                          <span className="npw-party-phone">{formData.SendersPhone}</span>
                        </span>
                        <span className="npw-party-addr">
                          <span className="npw-party-kind">{senderMode === 'address' ? 'Адреса' : 'Відділення'}</span>
                          <span className="npw-party-addr-text">
                            {senderAddrLabel || 'Завантаження адрес…'}
                          </span>
                        </span>
                      </button>
                    ) : (
                      <div className="npw-stack">
                        <div className="npw-grid npw-grid--sender">
                          <label className="npw-field" data-np-field="SenderName">
                            <span className="npw-field-label">ПІБ</span>
                            <input {...npInvalid(fieldErrors, 'SenderName')} type="text" name="SenderName"
                              value={formData.SenderName} onChange={handleChange} required />
                            <NpFieldError field="SenderName">{fieldErrors.SenderName}</NpFieldError>
                          </label>
                          <label className="npw-field" data-np-field="SendersPhone">
                            <span className="npw-field-label">Телефон</span>
                            <input {...npInvalid(fieldErrors, 'SendersPhone', 'npw-input npw-input--mono')} type="tel" name="SendersPhone"
                              value={formData.SendersPhone} onChange={handlePhone} required />
                            <NpFieldError field="SendersPhone">{fieldErrors.SendersPhone}</NpFieldError>
                          </label>
                        </div>

                        {(senderAddresses.length > 0 || savedSenderAddresses.length > 0) && (
                          <div className="npw-field">
                            <span className="npw-field-label">Збережені адреси</span>
                            <div className="npw-select-row">
                              <select className="npw-input npw-select"
                                value={selectedSavedId || formData.SenderAddressRef || formData.SenderAddress || ''}
                                onChange={handleSenderAddressChange}>
                                {savedSenderAddresses.length > 0 && (
                                  <optgroup label="Мої збережені">
                                    {savedSenderAddresses.map(a => (
                                      <option key={`saved-${a.id}`} value={a.id}>
                                        {a.addressType === 'address' ? '🏠 ' : '📦 '}{savedAddrLabel(a)}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                {senderAddresses.length > 0 && (
                                  <optgroup label="З кабінету НП">
                                    {senderAddresses.map(a => (
                                      <option key={a.ref} value={a.ref}>
                                        {a.addressType === 'address' ? '🏠 ' : '📦 '}{a.cityDescription} — {a.description}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                <option value="">Інша адреса…</option>
                              </select>
                              {canSaveAddress() && !getCurrentSavedAddr() && (
                                <button type="button" className="npw-icon-btn npw-icon-btn--add"
                                  onClick={handleSaveCurrentAddress}
                                  title="Запам'ятати поточну адресу" aria-label="Запам'ятати адресу">+</button>
                              )}
                              {getCurrentSavedAddr() && (
                                <button type="button" className="npw-icon-btn npw-icon-btn--danger"
                                  onClick={() => {
                                    const addr = getCurrentSavedAddr();
                                    if (addr) handleDeleteSavedAddress(addr.id);
                                  }}
                                  title="Видалити збережену адресу" aria-label="Видалити збережену адресу">−</button>
                              )}
                            </div>
                          </div>
                        )}

                        {!selectedSavedId && !formData.SenderAddressRef && (!formData.SenderAddress ||
                          (!senderAddresses.find(a => a.ref === formData.SenderAddress))) && (
                          <>
                            <NpSegment value={senderMode} onChange={handleSenderMode} options={deliveryOptions} />
                            <div className={`npw-picker${fieldErrors.senderAddress ? ' is-invalid' : ''}`} data-np-field="senderAddress">
                              {!isSenderDoor ? (
                                <NovaPoshtaButton onDepartmentSelect={handleDepartmentSelect1} />
                              ) : (
                                <NovaPoshtaAddressButton
                                  onAddressSelect={handleSenderAddressSelect}
                                  cityName={formData.SenderCityName}
                                />
                              )}
                            </div>
                          </>
                        )}
                        <NpFieldError field="senderAddress">{fieldErrors.senderAddress}</NpFieldError>

                        {canSaveAddress() && !getCurrentSavedAddr() &&
                          senderAddresses.length === 0 && savedSenderAddresses.length === 0 && (
                          <button type="button" className="npw-btn npw-btn--sm npw-btn--ghost npw-save-btn"
                            onClick={handleSaveCurrentAddress}>
                            + Запам'ятати адресу відправника
                          </button>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Одержувач */}
                  <section className="npw-section">
                    <div className="npw-label-row">
                      <h2 className="npw-label">Одержувач</h2>
                      {clientName && (
                        <span className="npw-label-aside" title="Клієнт замовлення">
                          {clientName}{clientId && clientId !== '0' ? ` · #${clientId}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="npw-stack">
                      <NpSegment
                        value={recipientType}
                        onChange={setRecipientType}
                        options={[
                          { value: 'PrivatePerson', label: 'Фізична особа' },
                          { value: 'Organization', label: 'Організація' },
                        ]}
                      />
                      <div className={`npw-grid ${isOrg ? 'npw-grid--org' : 'npw-grid--contact'}`}>
                        <label className="npw-field" data-np-field="RecipientsPhone">
                          <span className="npw-field-label">Телефон</span>
                          <input {...npInvalid(fieldErrors, 'RecipientsPhone', 'npw-input npw-input--mono')} type="tel" name="RecipientsPhone"
                            value={formData.RecipientsPhone} onChange={handlePhone} required />
                          <NpFieldError field="RecipientsPhone">{fieldErrors.RecipientsPhone}</NpFieldError>
                        </label>
                        {isOrg && (
                          <label className="npw-field" data-np-field="RecipientEDRPOU">
                            <span className="npw-field-label">ЄДРПОУ</span>
                            <input {...npInvalid(fieldErrors, 'RecipientEDRPOU', 'npw-input npw-input--mono')} type="text" name="RecipientEDRPOU"
                              inputMode="numeric" value={formData.RecipientEDRPOU || ''} onChange={handleChange} />
                            <NpFieldError field="RecipientEDRPOU">{fieldErrors.RecipientEDRPOU}</NpFieldError>
                          </label>
                        )}
                        <label className="npw-field npw-field--name" data-np-field="RecipientName">
                          <span className="npw-field-label">{isOrg ? 'Назва організації' : 'ПІБ'}</span>
                          <input {...npInvalid(fieldErrors, 'RecipientName')} type="text" name="RecipientName"
                            value={formData.RecipientName} onChange={handleChange} required />
                          <NpFieldError field="RecipientName">{fieldErrors.RecipientName}</NpFieldError>
                        </label>
                      </div>
                      {(phoneHint || contactAction) && (
                        <div className="npw-hint-row">
                          {phoneHint || <span />}
                          {contactAction}
                        </div>
                      )}

                      {savedRecipientAddresses.length > 0 && (
                        <div className="npw-field">
                          <span className="npw-field-label">Збережені адреси клієнта</span>
                          <div className="npw-select-row">
                            <select className="npw-input npw-select"
                              value={selectedRecipientSavedId || ''}
                              onChange={handleRecipientAddressChange}>
                              {savedRecipientAddresses.map(a => (
                                <option key={`rcpt-${a.id}`} value={a.id}>
                                  {a.addressType === 'address' ? '🏠 ' : '📦 '}{savedAddrLabel(a)}
                                </option>
                              ))}
                              <option value="">Інша адреса…</option>
                            </select>
                            {canSaveRecipientAddress() && !getRecipientCurrentSaved() && (
                              <button type="button" className="npw-icon-btn npw-icon-btn--add"
                                onClick={handleSaveRecipientAddress}
                                title="Запам'ятати поточну адресу" aria-label="Запам'ятати адресу">+</button>
                            )}
                            {getRecipientCurrentSaved() && (
                              <button type="button" className="npw-icon-btn npw-icon-btn--danger"
                                onClick={() => {
                                  const addr = getRecipientCurrentSaved();
                                  if (addr) handleDeleteRecipientAddress(addr.id);
                                }}
                                title="Видалити збережену адресу" aria-label="Видалити збережену адресу">−</button>
                            )}
                          </div>
                        </div>
                      )}

                      {!selectedRecipientSavedId && (
                        <>
                          <NpSegment value={recipientMode} onChange={handleRecipientMode} options={deliveryOptions} />
                          <div className={`npw-picker${fieldErrors.recipientAddress ? ' is-invalid' : ''}`} data-np-field="recipientAddress">
                            {!isDoorDelivery ? (
                              <NovaPoshtaButton onDepartmentSelect={handleDepartmentSelect} />
                            ) : (
                              <NovaPoshtaAddressButton
                                onAddressSelect={handleAddressSelect}
                                cityName={formData.RecipientCityName}
                              />
                            )}
                          </div>
                        </>
                      )}
                      <NpFieldError field="recipientAddress">{fieldErrors.recipientAddress}</NpFieldError>

                      {canSaveRecipientAddress() && !getRecipientCurrentSaved() &&
                        savedRecipientAddresses.length === 0 && (
                        <button type="button" className="npw-btn npw-btn--sm npw-btn--ghost npw-save-btn"
                          onClick={handleSaveRecipientAddress}>
                          + Запам'ятати адресу для клієнта
                        </button>
                      )}
                    </div>
                  </section>

                  {/* ═══════════ ОПЛАТА — у лівій колонці під одержувачем ═══════════ */}
                  <section className="npw-section npw-pay">
                    <h2 className="npw-label">Оплата доставки</h2>
                    <div className="npw-pay-row">
                      <div className="npw-field">
                        <span className="npw-field-label">Платник</span>
                        <NpSegment
                          value={formData.PayerType}
                          onChange={(v) => setField('PayerType', v)}
                          options={[
                            { value: 'Sender', label: 'Відправник' },
                            { value: 'Recipient', label: 'Одержувач' },
                            { value: 'ThirdPerson', label: 'Третя особа' },
                          ]}
                        />
                      </div>
                      <div className="npw-field">
                        <span className="npw-field-label">Спосіб оплати</span>
                        <NpSegment
                          value={formData.PaymentMethod}
                          onChange={(v) => setField('PaymentMethod', v)}
                          options={[
                            { value: 'Cash', label: 'Готівка' },
                            {
                              value: 'NonCash',
                              label: 'Безготівка',
                              disabled: nonCashForbidden,
                              title: nonCashForbidden
                                ? 'Одержувач-фізособа платить лише готівкою'
                                : undefined,
                            },
                          ]}
                        />
                      </div>
                      <div className="npw-field">
                        <span className="npw-field-label">Додатково</span>
                        <div className="npw-pay-checks">
                          <NpCheck
                            checked={formData.BackwardDelivery}
                            disabled={codDisabled}
                            hint={codReason}
                            onChange={(c) => setFormData(prev => ({
                              ...prev,
                              BackwardDelivery: c,
                              BackwardDeliverySum: c ? prev.Cost : '',
                            }))}
                          >
                            Накладений платіж
                          </NpCheck>
                          <NpCheck
                            checked={formData.IsFragile}
                            onChange={(c) => setFormData(prev => ({ ...prev, IsFragile: c }))}
                          >
                            Крихке
                          </NpCheck>
                        </div>
                      </div>
                    </div>
                    <NpFieldError field="payment">{fieldErrors.payment}</NpFieldError>
                    {formData.BackwardDelivery && (
                      <div className="npw-grid npw-grid--cod">
                        <label className="npw-field" data-np-field="BackwardDeliverySum">
                          <span className="npw-field-label">Сума накладеного платежу, грн</span>
                          <input {...npInvalid(fieldErrors, 'BackwardDeliverySum', 'npw-input npw-input--num')} type="number" step="0.01"
                            value={formData.BackwardDeliverySum}
                            onChange={e => setFormData(prev => ({ ...prev, BackwardDeliverySum: e.target.value }))}
                            required />
                          <NpFieldError field="BackwardDeliverySum">{fieldErrors.BackwardDeliverySum}</NpFieldError>
                        </label>
                        <div className="npw-field">
                          <span className="npw-field-label">Повернення коштів оплачує</span>
                          <NpSegment
                            value={formData.BackwardDeliveryPayer}
                            onChange={(v) => setFormData(prev => ({ ...prev, BackwardDeliveryPayer: v }))}
                            options={[
                              { value: 'Recipient', label: 'Одержувач' },
                              { value: 'Sender', label: 'Відправник' },
                            ]}
                          />
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                {/* ═══════════ ЩО Й ЯК ═══════════ */}
                <div className="npw-col">
                  <section className="npw-section">
                    <h2 className="npw-label">Відправлення</h2>
                    <div className="npw-stack">
                      <div className="npw-field">
                        <span className="npw-field-label">Тип</span>
                        <NpSegment
                          value={formData.CargoType}
                          onChange={(v) => setField('CargoType', v)}
                          options={[
                            { value: 'Cargo', label: 'Вантаж' },
                            { value: 'Documents', label: 'Документи' },
                          ]}
                        />
                      </div>

                      {isMultiSeat ? (
                        <div className="npw-field" data-np-field="seats">
                          <span className="npw-field-label">Місця · Д × Ш × В, мм · вага, кг</span>
                          <div className="npw-seats">
                            {seats.map((s, i) => (
                              <div className="npw-seat" key={s.id}>
                                <span className="npw-seat-no">{i + 1}</span>
                                <div className="npw-dims">
                                  <input className="npw-input npw-input--num" type="number" min="0" step="any"
                                    aria-label={`Місце ${i + 1}: довжина, мм`} value={s.Length}
                                    onChange={(e) => editSeat(s.id, 'Length', e.target.value)} />
                                  <span className="npw-dims-x">×</span>
                                  <input className="npw-input npw-input--num" type="number" min="0" step="any"
                                    aria-label={`Місце ${i + 1}: ширина, мм`} value={s.Width}
                                    onChange={(e) => editSeat(s.id, 'Width', e.target.value)} />
                                  <span className="npw-dims-x">×</span>
                                  <input className="npw-input npw-input--num" type="number" min="0" step="any"
                                    aria-label={`Місце ${i + 1}: висота, мм`} value={s.Height}
                                    onChange={(e) => editSeat(s.id, 'Height', e.target.value)} />
                                </div>
                                <input className="npw-input npw-input--num npw-seat-weight" type="number" step="0.01" min="0"
                                  required aria-label={`Місце ${i + 1}: вага, кг`} value={s.Weight}
                                  onChange={(e) => editSeat(s.id, 'Weight', e.target.value)} />
                                <button type="button" className="npw-icon-btn npw-icon-btn--danger"
                                  onClick={() => removeSeat(s.id)}
                                  title="Прибрати місце" aria-label={`Прибрати місце ${i + 1}`}>
                                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" fill="none" />
                                  </svg>
                                </button>
                                <span className="npw-seat-meta">
                                  {[s.Pack, `об'ємна ${fmtNum(volWeightMm(s.Length, s.Width, s.Height))} кг`].filter(Boolean).join(' · ')}
                                </span>
                              </div>
                            ))}
                          </div>
                          <NpFieldError field="seats">{fieldErrors.seats || fieldErrors.dims || fieldErrors.Weight}</NpFieldError>
                        </div>
                      ) : (
                        <div className="npw-field" data-np-field="dims">
                          <span className="npw-field-label">Довжина × ширина × висота, мм</span>
                          <div className="npw-dims">
                            <input {...npInvalid(fieldErrors, 'dims', 'npw-input npw-input--num')} type="number" name="Length" min="0" step="any"
                              aria-label="Довжина, мм" value={formData.Length} onChange={handleChange} />
                            <span className="npw-dims-x">×</span>
                            <input {...npInvalid(fieldErrors, 'dims', 'npw-input npw-input--num')} type="number" name="Width" min="0" step="any"
                              aria-label="Ширина, мм" value={formData.Width} onChange={handleChange} />
                            <span className="npw-dims-x">×</span>
                            <input {...npInvalid(fieldErrors, 'dims', 'npw-input npw-input--num')} type="number" name="Height" min="0" step="any"
                              aria-label="Висота, мм" value={formData.Height} onChange={handleChange} />
                          </div>
                          <NpFieldError field="dims">{fieldErrors.dims}</NpFieldError>
                        </div>
                      )}

                      <div className="npw-grid npw-grid--3">
                        {isMultiSeat ? (
                          <div className="npw-field">
                            <span className="npw-field-label">Загальна вага</span>
                            <span className="npw-readout">{fmtNum(seatsWeight)} <small>кг</small></span>
                          </div>
                        ) : (
                          <label className="npw-field" data-np-field="Weight">
                            <span className="npw-field-label">Вага, кг</span>
                            <input {...npInvalid(fieldErrors, 'Weight', 'npw-input npw-input--num')} type="number" name="Weight" step="0.01" min="0"
                              value={formData.Weight} onChange={handleChange} required />
                            <NpFieldError field="Weight">{fieldErrors.Weight}</NpFieldError>
                          </label>
                        )}
                        <div className="npw-field" title="Довжина × ширина × висота (см) / 4000 — НП рахує тариф за більшою з двох ваг">
                          <span className="npw-field-label">Об'ємна вага</span>
                          <span className="npw-readout">
                            {isMultiSeat ? fmtNum(seatsVolWeight) : formData.Volume ? fmtNum(formData.Volume) : '—'} <small>кг</small>
                          </span>
                        </div>
                        <div className="npw-field">
                          <span className="npw-field-label">Місць</span>
                          <div className="npw-seat-count">
                            <span className="npw-readout">{seatsCount}</span>
                            <button type="button" className="npw-icon-btn npw-icon-btn--add" onClick={addSeat}
                              title="Додати місце — копію останнього" aria-label="Додати місце">
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <label className="npw-field" data-np-field="Description">
                        <span className="npw-field-label">
                          Опис вантажу
                          <span className={`npw-counter${descTooLong ? ' is-over' : ''}`}>
                            {descLen}/{NP_DESCRIPTION_MAX}
                          </span>
                        </span>
                        <input {...npInvalid(fieldErrors, 'Description')} type="text" name="Description"
                          value={formData.Description} onChange={handleChange} />
                        <NpFieldError field="Description">{fieldErrors.Description}</NpFieldError>
                      </label>
                      <div className="npw-chips-row">
                        <span className={`npw-chips-note${descTooLong ? ' is-over' : ''}`}>
                          {descTooLong ? `НП обріже після ${NP_DESCRIPTION_MAX} символів:` : 'Коротко:'}
                        </span>
                        {DESCRIPTION_PRESETS.map((p) => (
                          <button type="button" key={p}
                            className={`npw-chip-btn${formData.Description === p ? ' is-active' : ''}`}
                            onClick={() => setField('Description', p)}>
                            {p}
                          </button>
                        ))}
                      </div>

                      <label className="npw-field" data-np-field="Cost">
                        <span className="npw-field-label">Оголошена вартість, грн</span>
                        <input {...npInvalid(fieldErrors, 'Cost', 'npw-input npw-input--num')} type="number" step="0.01" name="Cost"
                          value={formData.Cost} onChange={handleChange} required />
                        <NpFieldError field="Cost">{fieldErrors.Cost}</NpFieldError>
                      </label>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <footer className="npw-foot">
              {(nonCashBlocked || footAlert) && (
                <div className="npw-foot-notes">
                  {nonCashBlocked && (
                    <div className="npw-note npw-note--warn">
                      Одержувач-фізособа платить лише готівкою. Змініть спосіб оплати на «Готівка», тип одержувача на «Організація» або платника на «Відправник».
                    </div>
                  )}
                  <NpAlert
                    error={footAlert}
                    compact={footAlert?.compact}
                    onRetry={() => formRef.current?.requestSubmit()}
                    onClose={footAlert?.compact ? undefined : () => setError(null)}
                  />
                </div>
              )}
              <dl className="npw-stats">
                <div className="npw-stat">
                  <dt>Маршрут</dt>
                  <dd className="npw-route">
                    {senderMode === 'address' ? 'Адреса' : 'Відділення'}
                    <span className="npw-route-arrow" aria-hidden="true">→</span>
                    {recipientMode === 'address' ? 'Адреса' : 'Відділення'}
                  </dd>
                </div>
                <div className="npw-stat">
                  <dt>Вага</dt>
                  <dd>{fmtNum(isMultiSeat ? seatsWeight : formData.Weight)} <small>кг</small></dd>
                </div>
                <div className="npw-stat">
                  <dt>Доставку оплачує</dt>
                  <dd>
                    {PAYER_LABEL[formData.PayerType] || '—'}
                    <small>{formData.PaymentMethod === 'NonCash' ? ' · безготівка' : ' · готівка'}</small>
                  </dd>
                </div>
                <div className="npw-stat">
                  <dt>Оголошена</dt>
                  <dd>{fmtNum(formData.Cost)} <small>грн</small></dd>
                </div>
              </dl>
              <button className="npw-btn npw-btn--primary npw-btn--cta" type="submit"
                disabled={loading || nonCashBlocked}>
                {loading ? 'Створюю…' : 'Створити накладну'}
                {!loading && (
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <path d="M3 9h11M10 4.5L14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
                  </svg>
                )}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

export default NP;
