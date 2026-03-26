import { useState, useRef, useCallback, useEffect } from "react";
import axios from "../api/axiosInstance";

/**
 * Хук автодоповнення адрес Uklon
 * Повертає: { query, setQuery, suggestions, loading, showSuggestions, setShowSuggestions,
 *             handleSearch, handleSelect, wrapRef }
 *
 * handleSelect(addr) → повертає { name, lat, lng } через onSelect callback
 */
export default function useUklonAddress({ onSelect, city = 1 } = {}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sessionRef = useRef(() => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  });
  const [session] = useState(sessionRef.current);
  const timeoutRef = useRef(null);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = useCallback((value) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!value || value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/uklon/addresses/autocomplete", {
          params: { search: value, city, session },
        });
        const list = Array.isArray(data) ? data : (data?.addresses || []);
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
      } catch (err) {
        console.error("[Uklon autocomplete]", err?.response?.data || err.message);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [city, session]);

  const handleSelect = useCallback(async (addr) => {
    setShowSuggestions(false);
    setSuggestions([]);
    const displayName = addr.original_name || addr.name || addr.description || "";

    // Отримати координати
    const addrId = addr.id;
    let lat = "", lng = "";
    if (addrId) {
      try {
        const { data } = await axios.get("/api/uklon/addresses/details", {
          params: { id: addrId, city, session },
        });
        const coord = data?.coordinate || {};
        lat = coord.latitude ?? "";
        lng = coord.longitude ?? "";
      } catch (err) {
        console.error("[Uklon address details]", err?.response?.data || err.message);
      }
    }

    if (onSelect) {
      onSelect({ name: displayName, lat: String(lat), lng: String(lng) });
    }
  }, [city, session, onSelect]);

  return {
    suggestions,
    loading,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    handleSelect,
    wrapRef,
  };
}
