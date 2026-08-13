import { useCallback, useEffect, useRef, useState } from 'react';
import axios from '../api/axiosInstance';

const LS_PREFIX = 'printpeaks_';
const API_BASE = '/api/user-settings';

// Маппінг localStorage ключів → API ключів
const KEY_MAP = {
    'printpeaks_file_settings': 'file_settings',
    'printpeaks_niimbot_settings': 'niimbot_settings',
    'printpeaks_barcode_printer_settings': 'barcode_printer_settings',
    'printpeaks_qztray_settings': 'qztray_settings',
    'printpeaks_uklon_settings': 'uklon_settings',
    'printpeaks_np_sender_addresses': 'np_sender_addresses',
    'printpeaks_np_recipient_addresses': 'np_recipient_addresses',
    'printpeaks_np_recipient_contacts': 'np_recipient_contacts',
};

const API_KEY_TO_LS = {};
Object.entries(KEY_MAP).forEach(([ls, api]) => { API_KEY_TO_LS[api] = ls; });

/**
 * Завантажити налаштування: спробувати з API, fallback на localStorage.
 * Результат кешується в localStorage для офлайн доступу.
 */
export async function loadSetting(apiKey, defaults = {}) {
    const lsKey = API_KEY_TO_LS[apiKey] || `${LS_PREFIX}${apiKey}`;

    // Спочатку пробуємо з API (сервер = джерело правди)
    try {
        const { data } = await axios.get(`${API_BASE}/${apiKey}`);
        if (data.value != null) {
            // Зберігаємо в localStorage як кеш
            localStorage.setItem(lsKey, JSON.stringify(data.value));
            return { ...defaults, ...data.value };
        }
    } catch (e) {
        // API недоступне — fallback на localStorage
    }

    // Fallback: localStorage
    try {
        const raw = localStorage.getItem(lsKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...defaults, ...parsed };
        }
    } catch {}

    return defaults;
}

/**
 * Зберегти налаштування: записує в API + localStorage кеш.
 */
export async function saveSetting(apiKey, value) {
    const lsKey = API_KEY_TO_LS[apiKey] || `${LS_PREFIX}${apiKey}`;

    // Завжди зберігаємо в localStorage (швидкий доступ + офлайн)
    localStorage.setItem(lsKey, JSON.stringify(value));

    // Зберігаємо на сервер (не блокуємо UI)
    try {
        await axios.put(`${API_BASE}/${apiKey}`, { value });
    } catch (e) {
        console.warn(`[UserSettings] Failed to save ${apiKey} to server:`, e.message);
    }
}

/**
 * Міграція: якщо в localStorage є дані, а на сервері немає — завантажити на сервер.
 * Викликається один раз при логіні.
 */
export async function migrateLocalStorageToServer() {
    for (const [lsKey, apiKey] of Object.entries(KEY_MAP)) {
        try {
            const raw = localStorage.getItem(lsKey);
            if (!raw) continue;

            const { data } = await axios.get(`${API_BASE}/${apiKey}`);
            if (data.value != null) continue; // На сервері вже є — не перезаписуємо

            const parsed = JSON.parse(raw);
            await axios.put(`${API_BASE}/${apiKey}`, { value: parsed });
            console.log(`[UserSettings] Migrated ${lsKey} → server`);
        } catch (e) {
            console.warn(`[UserSettings] Migration failed for ${lsKey}:`, e.message);
        }
    }
}

/**
 * Прогрів кеша в зворотний бік: сервер → localStorage, усі ключі одним запитом.
 *
 * Потрібен тому, що сервіси друку читають налаштування СИНХРОННО з localStorage
 * (niimbotPrintService.getSettings, qzTrayService), а отже не вміють чекати на
 * відповідь сервера. Коли кеш порожній — новий браузер, інший origin після
 * деплою, очищені дані сайту — вони мовчки беруть DEFAULTS і друк іде на
 * дефолтний IP принтера. Раніше кеш наповнювався лише як побічний ефект
 * відкриття вкладки налаштувань принтера, звідки й брався симптом
 * «після білда принтер не відповідає, поки не зайдеш у налаштування».
 *
 * @returns {Promise<number>} скільки ключів прогріто
 */
export async function warmUpSettingsCache() {
    try {
        const { data } = await axios.get(API_BASE);
        let warmed = 0;
        for (const [apiKey, value] of Object.entries(data || {})) {
            // Тільки ключі з KEY_MAP: у решти (напр. dock_layout — там
            // printpeaks_dock_layout_v1 і власна синхронізація в PPDock)
            // localStorage-ключ інший, і вгадувати його не можна
            const lsKey = API_KEY_TO_LS[apiKey];
            if (!lsKey || value == null) continue;
            localStorage.setItem(lsKey, JSON.stringify(value));
            warmed++;
        }
        if (warmed) console.log(`[UserSettings] Прогріто з сервера: ${warmed} конфіг(ів)`);
        return warmed;
    } catch (e) {
        // Сервер недоступний — лишаємо те, що вже є в localStorage
        console.warn('[UserSettings] Прогрів кеша не вдався:', e.message);
        return 0;
    }
}

/**
 * React хук для налаштувань.
 * @param {string} apiKey — ключ конфігу (file_settings, niimbot_settings, qztray_settings)
 * @param {object} defaults — значення за замовчуванням
 */
export function useUserSettings(apiKey, defaults = {}) {
    const [settings, setSettings] = useState(defaults);
    const [loaded, setLoaded] = useState(false);
    const saveTimer = useRef(null);

    useEffect(() => {
        loadSetting(apiKey, defaults).then(val => {
            setSettings(val);
            setLoaded(true);
        });
    }, [apiKey]); // eslint-disable-line

    const save = useCallback((newSettings) => {
        setSettings(newSettings);
        // Debounce: зберігаємо через 300ms після останньої зміни
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            saveSetting(apiKey, newSettings);
        }, 300);
    }, [apiKey]);

    return { settings, setSettings: save, loaded };
}
