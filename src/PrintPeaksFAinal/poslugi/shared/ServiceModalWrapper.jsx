import React from "react";
import "./ServiceModal.css";

/**
 * Wrapper component for all service modals with BW design
 *
 * @param {boolean} show - Whether to show the modal
 * @param {Function} onClose - Callback to close the modal
 * @param {React.ReactNode} leftContent - Content for left column (form fields)
 * @param {React.ReactNode} rightContent - Content for right column (pricing)
 * @param {React.ReactNode} bottomContent - Content below columns (product tabs, action button)
 * @param {string|null} error - Error message to display
 * @param {string} className - Additional class for modal variant (e.g., "service-wide", "service-photo")
 * @param {Function} setEditingOrderUnit - Optional setter to clear editing state on close
 */
const ServiceModalWrapper = ({
  show,
  onClose,
  leftContent,
  rightContent,
  bottomContent,
  error,
  className = "",
  setEditingOrderUnit,
}) => {
  if (!show) return null;

  const handleOverlayClick = () => {
    if (setEditingOrderUnit) {
      setEditingOrderUnit(null);
    }
    onClose();
  };

  return (
    <>
      {/* Overlay with blur */}
      <div className="bw-overlay" onClick={handleOverlayClick} />

      {/* Modal container */}
      <div className={`bw-modal ${className}`}>
        <div className="bw-modal" onClick={(e) => e.stopPropagation()}>
          {/* Content area with left/right columns */}
          <div className="bw-content">
            <div className="bw-layout">
              {/* Left column - form fields */}
              <div className="bw-left">{leftContent}</div>
            </div>

            {/* Right column - pricing summary */}
            <div className="bw-right">{rightContent}</div>
          </div>

          {/* Error display */}
          {typeof error === "string" && error && (
            <div className="bw-error">{error}</div>
          )}

          {/* Bottom content (tabs + action button) */}
          {bottomContent}
        </div>
      </div>
    </>
  );
};

export default ServiceModalWrapper;
