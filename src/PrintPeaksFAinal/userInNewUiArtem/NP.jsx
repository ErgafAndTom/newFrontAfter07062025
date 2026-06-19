import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axiosInstance";
import { loadSetting, saveSetting } from "../../hooks/useUserSettings";
import NovaPoshtaButton from "./novaPoshta/NovaPoshtaButton";
import NovaPoshtaAddressButton from "./novaPoshta/NovaPoshtaAddressButton";
import NovaPoshtaThermalButton from "../novaPoshta/NovaPoshtaThermalButton";
import "./NP.css";

function NP({ showNP, setShowNP, thisOrder, setThisOrder, prefillData }) {
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
      return parseFloat(v.toFixed(4)) > 0 ? v.toFixed(4) : '';
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
  const [savedSenderAddresses, setSavedSenderAddresses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [savedRecipientAddresses, setSavedRecipientAddresses] = useState([]);
  const [allRecipientAddresses, setAllRecipientAddresses] = useState([]);
  const [selectedRecipientSavedId, setSelectedRecipientSavedId] = useState('');
  const [savedRecipientContact, setSavedRecipientContact] = useState(null);
  const [allRecipientContacts, setAllRecipientContacts] = useState([]);
  const lastWidgetDescription = useRef('');
  const lastRecipientWidgetData = useRef({});

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
      // Auto-select: спочатку saved, потім API
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
        } else if (apiAddrs.length > 0) {
          setFormData(prev => ({
            ...prev,
            CitySender: apiAddrs[0].cityRef,
            SenderCityName: apiAddrs[0].cityDescription || prev.SenderCityName,
            SenderAddress: apiAddrs[0].ref,
          }));
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
          SenderName: savedAddr.senderName || prev.SenderName,
          SendersPhone: savedAddr.sendersPhone || prev.SendersPhone,
          ServiceType: deriveServiceType('warehouse', recipientMode),
        }));
      }
      return;
    }
    // Потім в API адресах (warehouseRef)
    setSelectedSavedId('');
    const addr = senderAddresses.find(a => a.ref === val);
    if (addr) {
      setFormData(prev => ({
        ...prev,
        CitySender: addr.cityRef,
        SenderCityName: addr.cityDescription || prev.SenderCityName,
        SenderAddress: addr.ref,
      }));
      setSenderMode('warehouse');
    }
  };

  // Перевірка чи поточна адреса (warehouse або address) вже збережена
  const getCurrentSavedAddr = () => {
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

  // Auto-calculate volume (м³-equivalent) and volumetric weight (kg) — Nova Poshta formula: L×W×H(cm) / 4000
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
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (['Length', 'Width', 'Height'].includes(name)) {
        const l = name === 'Length' ? value : prev.Length;
        const w = name === 'Width' ? value : prev.Width;
        const h = name === 'Height' ? value : prev.Height;
        next.Volume = calcVolume(l, w, h);
        next.Weight = calcVolWeight(l, w, h);
      }
      if (name === 'Cost' && prev.BackwardDelivery) {
        next.BackwardDeliverySum = value;
      }
      if (name === 'PayerType') {
        next.PaymentMethod = 'Cash';
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
    <div className="np-overlay">
      <div className="np-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="np-modal-header">
          <button className="np-modal-close" onClick={handleClose} aria-label="Закрити">&#x2715;</button>
        </div>
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
            {(senderAddresses.length > 0 || savedSenderAddresses.length > 0) && (
              <div className="np-field" style={{ marginBottom: '0.5rem' }}>
                <span className="np-field-label">Збережені адреси</span>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <select className="np-field-select np-field-select--active"
                    style={{ flex: 1 }}
                    value={selectedSavedId || formData.SenderAddress || ''}
                    onChange={handleSenderAddressChange}>
                    {savedSenderAddresses.length > 0 && (
                      <optgroup label="Мої збережені">
                        {savedSenderAddresses.map(a => {
                          const displayLabel = a.addressType === 'address'
                            ? `${a.cityDescription || 'Київ'} — ${a.street || ''}${a.building ? ', ' + a.building : ''}`
                            : a.shortName
                              ? `${a.cityDescription || 'Київ'} — ${a.shortName}`
                              : a.label || `${a.cityDescription} — ${a.description}`;
                          return (
                            <option key={`saved-${a.id}`} value={a.id}>
                              {a.addressType === 'address' ? '🏠 ' : '📦 '}{displayLabel}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                    {senderAddresses.length > 0 && (
                      <optgroup label="З кабінету НП">
                        {senderAddresses.map(a => (
                          <option key={a.ref} value={a.ref}>
                            {a.cityDescription} — {a.description}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="">Інша адреса...</option>
                  </select>
                  {canSaveAddress() && !getCurrentSavedAddr() && (
                    <button type="button" className="np-save-addr-btn"
                      onClick={handleSaveCurrentAddress}
                      title="Зберегти поточну адресу">+</button>
                  )}
                  {getCurrentSavedAddr() && (
                    <button type="button" className="np-delete-addr-btn"
                      onClick={() => {
                        const addr = getCurrentSavedAddr();
                        if (addr) handleDeleteSavedAddress(addr.id);
                      }}
                      title="Видалити збережену адресу">−</button>
                  )}
                </div>
              </div>
            )}
            {!selectedSavedId && (!formData.SenderAddress ||
              (!senderAddresses.find(a => a.ref === formData.SenderAddress))) && (
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
                      cityName={formData.SenderCityName}
                    />
                  </div>
                )}
              </>
            )}
            {/* Кнопка "Зберегти адресу" — видна коли обрано адресу і її ще немає в збережених */}
            {canSaveAddress() && !getCurrentSavedAddr() && (
              <button type="button" className="np-save-addr-standalone"
                onClick={handleSaveCurrentAddress}>
                + Зберегти адресу відправника
              </button>
            )}

            {/* Одержувач */}
            <div className="np-legend">
              Одержувач
              {(() => {
                const u = thisOrder?.User;
                const clientName = u ? ([u.familyName, u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.name) : '';
                return clientName ? (
                  <span style={{ opacity: 0.6, marginLeft: '0.5rem', textTransform: 'none' }}>
                    ({clientName}, #{clientId})
                  </span>
                ) : null;
              })()}
            </div>
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
              {/* Кнопка зберегти/видалити контакт */}
              {isContactChanged() ? (
                <button type="button" className="np-save-addr-btn"
                  onClick={handleSaveRecipientContact}
                  title="Зберегти контактні дані одержувача"
                  style={{ width: 'auto', padding: '0 0.5rem', fontSize: 'var(--fontsmall, 12px)', fontWeight: 400 }}>Зберегти</button>
              ) : savedRecipientContact ? (
                <button type="button" className="np-delete-addr-btn"
                  onClick={handleDeleteRecipientContact}
                  title="Видалити збережені контактні дані">−</button>
              ) : null}
            </div>
            {/* Збережені адреси одержувача */}
            {savedRecipientAddresses.length > 0 && (
              <div className="np-field" style={{ marginBottom: '0.5rem' }}>
                <span className="np-field-label">Збережені</span>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <select className="np-field-select np-field-select--active"
                    style={{ flex: 1 }}
                    value={selectedRecipientSavedId || ''}
                    onChange={handleRecipientAddressChange}>
                    {savedRecipientAddresses.map(a => {
                      const displayLabel = a.addressType === 'address'
                        ? `${a.cityDescription || 'Київ'} — ${a.street || ''}${a.building ? ', ' + a.building : ''}`
                        : a.shortName
                          ? `${a.cityDescription || 'Київ'} — ${a.shortName}`
                          : a.label || `${a.cityDescription} — ${a.description}`;
                      return (
                        <option key={`rcpt-${a.id}`} value={a.id}>
                          {a.addressType === 'address' ? '🏠 ' : '📦 '}{displayLabel}
                        </option>
                      );
                    })}
                    <option value="">Інша адреса...</option>
                  </select>
                  {canSaveRecipientAddress() && !getRecipientCurrentSaved() && (
                    <button type="button" className="np-save-addr-btn"
                      onClick={handleSaveRecipientAddress}
                      title="Зберегти поточну адресу">+</button>
                  )}
                  {getRecipientCurrentSaved() && (
                    <button type="button" className="np-delete-addr-btn"
                      onClick={() => {
                        const addr = getRecipientCurrentSaved();
                        if (addr) handleDeleteRecipientAddress(addr.id);
                      }}
                      title="Видалити збережену адресу">−</button>
                  )}
                </div>
              </div>
            )}
            {!selectedRecipientSavedId && (
              <>
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
                      cityName={formData.RecipientCityName}
                    />
                  </div>
                )}
              </>
            )}
            {/* Кнопка зберегти адресу одержувача */}
            {canSaveRecipientAddress() && !getRecipientCurrentSaved() && (
              <button type="button" className="np-save-addr-standalone"
                onClick={handleSaveRecipientAddress}>
                + Зберегти адресу одержувача
              </button>
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
            {(() => {
              const payStatus = thisOrder?.Payment?.status;
              const codDisabled = payStatus === 'PAID' || payStatus === 'CREATED';
              const codReason = payStatus === 'PAID' ? 'Замовлення оплачено' : payStatus === 'CREATED' ? 'Очікується оплата' : '';
              return (
            <div className="np-fields-row" style={{ marginTop: '0.5rem' }}>
              <div className="np-field" style={{ flex: 'none' }}>
                <label className="np-checkbox-label" style={codDisabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
                  <input type="checkbox" checked={formData.BackwardDelivery}
                    disabled={codDisabled}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      BackwardDelivery: e.target.checked,
                      BackwardDeliverySum: e.target.checked ? prev.Cost : '',
                    }))} />
                  <span>Наложений платіж</span>
                  {codDisabled && <span style={{ fontSize: 'var(--fontsmall, 12px)', color: 'var(--adminorange)', marginLeft: '0.3rem' }}>({codReason})</span>}
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
              );
            })()}

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
                <NovaPoshtaThermalButton
                  waybillRef={result.data[0].Ref}
                  intDocNumber={result.data[0].IntDocNumber}
                  className="np-submit-btn np-print-btn"
                />
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
