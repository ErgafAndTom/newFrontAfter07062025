import { useCallback, useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const API_BASE = '/api/service-tabs';

/**
 * useServiceTabs — хук для завантаження та збереження назв табів послуг.
 *
 * @param {string} category — ідентифікатор калькулятора (напр. "SheetCut", "Booklet")
 * @param {string[]} defaults — дефолтні назви (використовуються для ініціалізації БД)
 * @returns {{ services: {id, name}[], addService: (name) => Promise, removeService: (id) => Promise, loading: boolean }}
 */
export default function useServiceTabs(category, defaults = []) {
    const [services, setServices] = useState(() => defaults.map((name, i) => ({ id: `default-${i}`, name })));
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
                    setServices(tabs.map((t) => ({ id: t.id, name: t.name })));
                } else {
                    // Ініціалізуємо БД дефолтними значеннями
                    const { data: created } = await axios.post(`${API_BASE}/${category}/bulk`, { names: defaults });
                    if (cancelled) return;
                    setServices(created.map((t) => ({ id: t.id, name: t.name })));
                }
            } catch (err) {
                console.warn('[useServiceTabs] API unavailable, using defaults:', err.message);
                // Залишаємо дефолти
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
            const newItem = { id: tab.id, name: tab.name };
            setServices((prev) => [...prev, newItem]);
            return newItem;
        } catch (err) {
            if (err?.response?.status === 409) {
                alert('Така назва вже існує');
            } else {
                console.error('[useServiceTabs] add error:', err);
                // Fallback: додаємо локально
                const newItem = { id: `local-${Date.now()}`, name: trimmed };
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
            setServices(tabs.map((t) => ({ id: t.id, name: t.name })));
        } catch (err) {
            console.error('[useServiceTabs] remove error:', err);
            // Fallback: видаляємо локально
            setServices((prev) => prev.filter((s) => s.id !== id));
        }
    }, [category, services.length]);

    return { services, addService, removeService, loading };
}
