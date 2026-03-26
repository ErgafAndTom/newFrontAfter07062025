import React from "react";
import useUklonAddress from "../../hooks/useUklonAddress";

/**
 * Інпут адреси з автодоповненням Uklon
 * Props: value, onChange(value), onSelect({name, lat, lng}), placeholder, className
 */
export default function UklonAddressInput({ value, onChange, onAddressSelect, placeholder, className, required }) {
  const {
    suggestions, loading, showSuggestions, setShowSuggestions,
    handleSearch, handleSelect, wrapRef,
  } = useUklonAddress({
    onSelect: (result) => {
      if (onChange) onChange(result.name);
      if (onAddressSelect) onAddressSelect(result);
    },
  });

  const onInputChange = (e) => {
    const val = e.target.value;
    if (onChange) onChange(val);
    handleSearch(val);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1 }}>
      <input
        type="text"
        className={className}
        value={value}
        onChange={onInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        autoComplete="off"
        required={required}
      />
      {loading && (
        <span style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          fontSize: "0.8rem", color: "var(--admingrey)",
        }}>
          ...
        </span>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9999,
          background: "#fff", border: "1px solid var(--adminborder, #ddd)",
          borderRadius: 6, maxHeight: 220, overflowY: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
          {suggestions.map((addr, i) => (
            <div
              key={addr.id || i}
              onClick={() => handleSelect(addr)}
              style={{
                padding: "8px 12px", cursor: "pointer", fontSize: "0.85rem",
                borderBottom: i < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              <span>{addr.name}</span>
              {addr.additional_info && (
                <span style={{ color: "var(--admingrey)", fontSize: "0.8rem", marginLeft: 6 }}>
                  {addr.additional_info}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
