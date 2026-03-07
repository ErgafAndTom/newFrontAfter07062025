import React, { useEffect } from "react";
import "./UserSettingsModal.css";
import Profile from "../../PrintPeaksFAinal/user/profile/Profile";

export default function UserSettingsModal({ onClose }) {

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="usm-overlay" onClick={onClose}>
      <div className="usm-panel usm-panel--full" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <header className="usm-header">
          <div className="usm-header-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <span className="usm-header-title">Налаштування профілю</span>
          <button className="usm-close" onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        {/* Content — existing Profile component with all tabs */}
        <div className="usm-content">
          <Profile />
        </div>

      </div>
    </div>
  );
}
