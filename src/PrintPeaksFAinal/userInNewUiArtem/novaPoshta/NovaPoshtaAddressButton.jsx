import './novaPoshtaButton.css';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from '../../../api/axiosInstance';
import { NpFieldError } from '../../novaPoshta/NpBrand';
import { describeNpError } from '../../novaPoshta/npErrors';

const debounce = (fn, ms) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
};

// Чому пошук міста/вулиці нічого не дав: мережа, НП чи справді немає збігів
const searchFailText = (errOrData) => {
    const d = describeNpError(errOrData, 'address');
    if (d.kind === 'network') return "Немає зв'язку з сервером — підказки не завантажились. Перевірте інтернет і спробуйте ще раз.";
    if (d.kind === 'np-down' || d.kind === 'timeout') return 'Нова Пошта не відповідає — спробуйте за хвилину.';
    return [d.title, d.items[0]?.text].filter(Boolean).join(': ');
};

const NovaPoshtaAddressButton = ({ onAddressSelect, cityName }) => {
    const [expanded, setExpanded] = useState(false);
    // { city, street, building } — тексти помилок під полями форми адреси
    const [errors, setErrors] = useState({});
    const setFieldError = (field, text) => setErrors((prev) => ({ ...prev, [field]: text }));
    const [selectedAddressText, setSelectedAddressText] = useState('');

    // City search
    const [cityQuery, setCityQuery] = useState(cityName || 'Київ');
    const [cityResults, setCityResults] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [showCityList, setShowCityList] = useState(false);

    // Street search
    const [streetQuery, setStreetQuery] = useState('');
    const [streetResults, setStreetResults] = useState([]);
    const [selectedStreet, setSelectedStreet] = useState(null);
    const [showStreetList, setShowStreetList] = useState(false);

    // Building & flat
    const [building, setBuilding] = useState('');
    const [flat, setFlat] = useState('');
    const cityAutoResolved = useRef(false);

    // Auto-resolve city on first expand
    useEffect(() => {
        if (expanded && !selectedCity && cityQuery && !cityAutoResolved.current) {
            cityAutoResolved.current = true;
            (async () => {
                try {
                    const res = await axios.post('/novaposhta/api-proxy', {
                        modelName: 'Address',
                        calledMethod: 'searchSettlements',
                        methodProperties: { CityName: cityQuery, Limit: 5 },
                    });
                    const items = res.data?.data?.[0]?.Addresses || [];
                    if (items.length > 0) {
                        setSelectedCity(items[0]);
                        setCityQuery(items[0].Present || items[0].MainDescription);
                    }
                } catch {}
            })();
        }
    }, [expanded]);

    const searchCities = useCallback(debounce(async (q) => {
        if (q.length < 2) { setCityResults([]); return; }
        try {
            const res = await axios.post('/novaposhta/api-proxy', {
                modelName: 'Address',
                calledMethod: 'searchSettlements',
                methodProperties: { CityName: q, Limit: 10 },
            });
            if (res.data?.success === false) {
                setCityResults([]);
                setFieldError('city', searchFailText(res.data));
                return;
            }
            const items = res.data?.data?.[0]?.Addresses || [];
            setCityResults(items);
            setShowCityList(true);
            setFieldError('city', items.length ? '' : `Місто «${q}» не знайдено — перевірте назву.`);
        } catch (e) {
            setCityResults([]);
            setFieldError('city', searchFailText(e));
        }
    }, 300), []);

    const searchStreets = useCallback(debounce(async (q, settlementRef) => {
        if (q.length < 2 || !settlementRef) { setStreetResults([]); return; }
        try {
            const res = await axios.post('/novaposhta/api-proxy', {
                modelName: 'Address',
                calledMethod: 'searchSettlementStreets',
                methodProperties: { StreetName: q, SettlementRef: settlementRef, Limit: 10 },
            });
            if (res.data?.success === false) {
                setStreetResults([]);
                setFieldError('street', searchFailText(res.data));
                return;
            }
            const items = res.data?.data?.[0]?.Addresses || [];
            setStreetResults(items);
            setShowStreetList(true);
            setFieldError('street', items.length ? '' : `Вулицю «${q}» не знайдено в цьому місті — перевірте назву.`);
        } catch (e) {
            setStreetResults([]);
            setFieldError('street', searchFailText(e));
        }
    }, 300), []);

    const handleCityInput = (e) => {
        const val = e.target.value;
        setCityQuery(val);
        setSelectedCity(null);
        setSelectedStreet(null);
        setStreetQuery('');
        setErrors({});
        searchCities(val);
    };

    const pickCity = (item) => {
        setCityQuery(item.Present || item.MainDescription);
        setSelectedCity(item);
        setCityResults([]);
        setShowCityList(false);
        setFieldError('city', '');
    };

    const handleStreetInput = (e) => {
        const val = e.target.value;
        setStreetQuery(val);
        setSelectedStreet(null);
        setFieldError('street', '');
        if (selectedCity) searchStreets(val, selectedCity.Ref);
    };

    const pickStreet = (item) => {
        setStreetQuery(item.Present || item.Description);
        setSelectedStreet(item);
        setStreetResults([]);
        setShowStreetList(false);
        setFieldError('street', '');
    };

    const handleConfirm = () => {
        // НП знаходить адресу лише за вулицею з її довідника — введена вручну дасть помилку при створенні ТТН
        const next = {
            city: selectedCity ? '' : 'Оберіть місто зі списку підказок.',
            street: !selectedCity ? '' : selectedStreet ? '' : 'Оберіть вулицю зі списку підказок — НП не знайде вулицю, введену вручну.',
            building: String(building).trim() ? '' : 'Вкажіть номер будинку.',
        };
        if (next.city || next.street || next.building) {
            setErrors(next);
            return;
        }
        setErrors({});
        const city = selectedCity?.MainDescription || cityQuery;
        const street = selectedStreet?.Description || streetQuery;
        const cityRef = selectedCity?.DeliveryCity || selectedCity?.Ref || '';
        const streetRef = selectedStreet?.SettlementStreetRef || selectedStreet?.Ref || '';

        const text = `${city}, ${street}${building ? ', ' + building : ''}${flat ? ', кв. ' + flat : ''}`;
        setSelectedAddressText(text);
        setExpanded(false);

        if (onAddressSelect) {
            onAddressSelect({ city, street, building, flat, fullAddress: text, cityRef, streetRef });
        }
    };

    return (
        <div>
            <div
                className={`novaPoshtaButton-nova-poshta-button novaPoshtaButton-button-horizontal novaPoshtaButton-text-row${selectedAddressText ? ' is-selected' : ''}${expanded ? ' is-open' : ''}`}
                onClick={() => setExpanded(!expanded)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
            >
                <div className="novaPoshtaButton-logo novaPoshtaButton-logo-no-margin">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.9401 16.4237H16.0596V21.271H19.2101L15.39 25.0911C14.6227 25.8585 13.3791 25.8585 12.6118 25.0911L8.79166 21.271H11.9401V16.4237ZM21.2688 19.2102V8.78972L25.091 12.6098C25.8583 13.3772 25.8583 14.6207 25.091 15.3881L21.2688 19.2102ZM16.0596 6.73099V11.5763H11.9401V6.73099H8.78958L12.6097 2.90882C13.377 2.14148 14.6206 2.14148 15.3879 2.90882L19.2101 6.73099H16.0596ZM2.90868 12.6098L6.72877 8.78972V19.2102L2.90868 15.3901C2.14133 14.6228 2.14133 13.3772 2.90868 12.6098Z" fill="#DA291C"/>
                    </svg>
                </div>
                <div className="novaPoshtaButton-angle">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.49399 1.44891L10.0835 5.68541L10.1057 5.70593C10.4185 5.99458 10.6869 6.24237 10.8896 6.4638C11.1026 6.69642 11.293 6.95179 11.4023 7.27063C11.5643 7.74341 11.5643 8.25668 11.4023 8.72946C11.293 9.0483 11.1026 9.30367 10.8896 9.53629C10.6869 9.75771 10.4184 10.0055 10.1057 10.2942L10.0835 10.3147L5.49398 14.5511L4.47657 13.4489L9.06607 9.21246C9.40722 8.89756 9.62836 8.69258 9.78328 8.52338C9.93272 8.36015 9.96962 8.28306 9.98329 8.24318C10.0373 8.08559 10.0373 7.9145 9.98329 7.7569C9.96963 7.71702 9.93272 7.63993 9.78328 7.4767C9.62837 7.3075 9.40722 7.10252 9.06608 6.78761L4.47656 2.55112L5.49399 1.44891Z" fill="#475569"/>
                    </svg>
                </div>
                <div className="novaPoshtaButton-wrapper">
                    <span className="novaPoshtaButton-text">
                        {selectedAddressText || 'Обрати адресу доставки'}
                    </span>
                </div>
            </div>

            {expanded && (
                <div className="np-address-form np-address-form--row">
                    <div className="np-address-field" style={{ flex: 1.2 }}>
                        <span className="np-address-label">Місто</span>
                        <input className={`np-address-input${errors.city ? ' is-invalid' : ''}`} value={cityQuery}
                            aria-invalid={!!errors.city || undefined}
                            onChange={handleCityInput}
                            onFocus={() => cityResults.length && setShowCityList(true)}
                            placeholder="Місто..." />
                        {showCityList && cityResults.length > 0 && (
                            <div className="np-address-dropdown">
                                {cityResults.map((c, i) => (
                                    <div key={i} className="np-address-dropdown-item"
                                        onClick={() => pickCity(c)}>
                                        {c.Present || c.MainDescription}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="np-address-field" style={{ flex: 2 }}>
                        <span className="np-address-label">Вулиця</span>
                        <input className={`np-address-input${errors.street ? ' is-invalid' : ''}`} value={streetQuery}
                            aria-invalid={!!errors.street || undefined}
                            onChange={handleStreetInput}
                            onFocus={() => streetResults.length && setShowStreetList(true)}
                            placeholder={selectedCity ? 'Вулиця...' : 'Оберіть місто'}
                            disabled={!selectedCity} />
                        {showStreetList && streetResults.length > 0 && (
                            <div className="np-address-dropdown">
                                {streetResults.map((s, i) => (
                                    <div key={i} className="np-address-dropdown-item"
                                        onClick={() => pickStreet(s)}>
                                        {s.Present || s.Description}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="np-address-field" style={{ flex: 0.5 }}>
                        <span className="np-address-label">Буд.</span>
                        <input className={`np-address-input${errors.building ? ' is-invalid' : ''}`} value={building}
                            aria-invalid={!!errors.building || undefined}
                            onChange={(e) => { setBuilding(e.target.value); setFieldError('building', ''); }} placeholder="№" />
                    </div>
                    <div className="np-address-field" style={{ flex: 0.5 }}>
                        <span className="np-address-label">Кв.</span>
                        <input className="np-address-input" value={flat}
                            onChange={(e) => setFlat(e.target.value)} placeholder="" />
                    </div>
                    <button type="button" className="np-address-confirm" onClick={handleConfirm}>
                        OK
                    </button>
                    {(errors.city || errors.street || errors.building) && (
                        <div className="np-address-errors">
                            <NpFieldError>{errors.city}</NpFieldError>
                            <NpFieldError>{errors.street}</NpFieldError>
                            <NpFieldError>{errors.building}</NpFieldError>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NovaPoshtaAddressButton;
