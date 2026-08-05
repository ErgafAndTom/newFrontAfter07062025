import { useCallback, useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const API_BASE = '/api/service-tabs';
const CACHE_PREFIX = 'svcTabs_';

const mapTab = (t) => ({ id: t.id, name: t.name, color: t.color || null, presets: t.presets || null, orderName: t.orderName || null, isDefault: !!t.isDefault });

/** Читати кеш з localStorage */
const readCache = (category) => {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + category);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
};

/** Записати кеш в localStorage */
const writeCache = (category, data) => {
    try {
        localStorage.setItem(CACHE_PREFIX + category, JSON.stringify(data));
    } catch { /* ignore */ }
};

/**
 * useServiceTabs — хук для завантаження та збереження назв табів послуг.
 *
 * @param {string} category — ідентифікатор калькулятора (напр. "SheetCut", "Booklet")
 * @param {string[]} defaults — дефолтні назви (використовуються для ініціалізації БД)
 * @returns {{ services: {id, name, color, presets}[], addService, removeService, updateService, loading }}
 */
export default function useServiceTabs(category, defaults = []) {
    const [services, setServices] = useState(() => {
        // Спочатку з кешу, потім дефолти
        const cached = readCache(category);
        if (cached && cached.length > 0) return cached;
        return defaults.map((name, i) => ({ id: `default-${i}`, name, color: null, presets: null, orderName: null, isDefault: false }));
    });
    const [loading, setLoading] = useState(true);
    const [mountId, setMountId] = useState(0);

    // Перезавантажити при кожному mount компонента
    useEffect(() => {
        setMountId((v) => v + 1);
    }, []);

    useEffect(() => {
        if (!category) return;

        let cancelled = false;

        (async () => {
            try {
                const { data: tabs } = await axios.get(`${API_BASE}/${category}`);
                if (cancelled) return;

                if (tabs.length > 0) {
                    const mapped = tabs.map(mapTab);
                    setServices(mapped);
                    writeCache(category, mapped);
                } else {
                    // Ініціалізуємо БД дефолтними значеннями
                    const { data: created } = await axios.post(`${API_BASE}/${category}/bulk`, { names: defaults });
                    if (cancelled) return;
                    const mapped = created.map(mapTab);
                    setServices(mapped);
                    writeCache(category, mapped);
                }
            } catch (err) {
                console.warn('[useServiceTabs] API unavailable, using cache/defaults:', err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [category, mountId]);

    const addService = useCallback(async (name) => {
        if (!name?.trim()) return null;
        const trimmed = name.trim();

        if (services.some((s) => s.name === trimmed)) {
            alert('Така назва вже існує');
            return null;
        }

        try {
            const { data: tab } = await axios.post(`${API_BASE}/${category}`, { name: trimmed });
            const newItem = mapTab(tab);
            setServices((prev) => {
                const next = [...prev, newItem];
                writeCache(category, next);
                return next;
            });
            return newItem;
        } catch (err) {
            if (err?.response?.status === 409) {
                alert('Така назва вже існує');
            } else {
                console.error('[useServiceTabs] add error:', err);
                const newItem = { id: `local-${Date.now()}`, name: trimmed, color: null, presets: null, orderName: null, isDefault: false };
                setServices((prev) => [...prev, newItem]);
                return newItem;
            }
            return null;
        }
    }, [category, services]);

    const removeService = useCallback(async (id) => {
        if (services.length <= 1) {
            alert('Повинен бути хоча б один товар');
            return;
        }

        try {
            const { data: tabs } = await axios.delete(`${API_BASE}/${category}/${id}`);
            const mapped = tabs.map(mapTab);
            setServices(mapped);
            writeCache(category, mapped);
        } catch (err) {
            console.error('[useServiceTabs] remove error:', err);
            setServices((prev) => prev.filter((s) => s.id !== id));
        }
    }, [category, services.length]);

    const updateService = useCallback(async (id, updates) => {
        try {
            const { data: tab } = await axios.put(`${API_BASE}/${category}/${id}`, updates);
            const updated = mapTab(tab);
            setServices((prev) => {
                // сервер знімає isDefault з інших табів категорії — відобразити це й локально
                const next = prev.map((s) => {
                    if (s.id === id) return updated;
                    if (updates.isDefault) return { ...s, isDefault: false };
                    return s;
                });
                writeCache(category, next);
                return next;
            });
            return updated;
        } catch (err) {
            if (err?.response?.status === 409) {
                alert('Така назва вже існує');
            } else {
                console.error('[useServiceTabs] update error:', err);
            }
            return null;
        }
    }, [category]);

    const reorderServices = useCallback(async (orderedIds) => {
        // Оптимістичне оновлення локально
        setServices((prev) => {
            const byId = new Map(prev.map((s) => [s.id, s]));
            const reordered = orderedIds.map((id) => byId.get(id)).filter(Boolean);
            // Додати елементи, яких не було в orderedIds (якщо раптом)
            prev.forEach((s) => { if (!orderedIds.includes(s.id)) reordered.push(s); });
            writeCache(category, reordered);
            return reordered;
        });
        try {
            const { data: tabs } = await axios.put(`${API_BASE}/${category}/reorder`, { ids: orderedIds });
            const mapped = tabs.map(mapTab);
            setServices(mapped);
            writeCache(category, mapped);
        } catch (err) {
            console.error('[useServiceTabs] reorder error:', err);
        }
    }, [category]);

    return { services, addService, removeService, updateService, reorderServices, loading };
}
