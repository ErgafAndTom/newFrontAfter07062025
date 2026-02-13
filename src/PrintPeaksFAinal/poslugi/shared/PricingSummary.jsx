import React from "react";

/**
 * Right-side pricing summary component for service modals
 *
 * @param {Object} pricesThis - Pricing data from API
 * @param {string} type - Type of service for custom rendering
 * @param {Object} customFields - Custom fields to display { label: value }
 */
const PricingSummary = ({ pricesThis, type = "default", customFields = {} }) => {
  if (!pricesThis) {
    return (
      <div className="bw-summary-title">
        <div className="bw-sticky">
          <div className="bwsubOP">Розрахунок завантажується...</div>
        </div>
      </div>
    );
  }

  // Laminator-specific pricing
  if (type === "Laminator") {
    return (
      <div className="bw-summary-title">
        <div className="bw-sticky">
          <div className="bwsubOP">Ламінація:</div>
          <div className="bw-calc-line">
            {(pricesThis.priceForThisUnitOfLamination || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
            <span className="bw-op">×</span>
            {pricesThis.skolko || 0}
            <span className="bw-sub">шт</span>
            <span className="bw-op">=</span>
            {(pricesThis.priceForThisAllUnitsOfLamination || 0).toFixed(2)}
            <span className="bw-sub">грн</span>
          </div>

          <div
            className="bw-calc-total d-flex justify-content-center align-content-center"
            style={{ fontWeight: "500", color: "red" }}
          >
            {pricesThis.price || 0}
            <span className="bw-sub">грн</span>
          </div>
        </div>
      </div>
    );
  }

  // Default pricing layout (SheetCut style)
  return (
    <div className="bw-summary-title">
      <div className="bw-sticky">
        {/* Printing */}
        {pricesThis.priceDrukPerSheet !== undefined && (
          <>
            <div className="bwsubOP">Друк:</div>
            <div className="bw-calc-line">
              {(pricesThis.priceDrukPerSheet || 0).toFixed(2)}
              <span className="bw-sub">грн</span>
              <span className="bw-op">×</span>
              {pricesThis.sheetCount || 0}
              <span className="bw-sub">шт</span>
              <span className="bw-op">=</span>
              {((pricesThis.priceDrukPerSheet || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}
              <span className="bw-sub">грн</span>
            </div>
          </>
        )}

        {/* Materials */}
        {pricesThis.pricePaperPerSheet !== undefined && (
          <>
            <div className="bwsubOP">Матеріали:</div>
            <div className="bw-calc-line">
              {(pricesThis.pricePaperPerSheet || 0).toFixed(2)}
              <span className="bw-sub">грн</span>
              <span className="bw-op">×</span>
              {pricesThis.sheetCount || 0}
              <span className="bw-sub">шт</span>
              <span className="bw-op">=</span>
              {((pricesThis.pricePaperPerSheet || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}
              <span className="bw-sub">грн</span>
            </div>
          </>
        )}

        {/* Lamination (if enabled) */}
        {pricesThis.priceLaminationPerSheet !== undefined && (
          <>
            <div className="bwsubOP">Ламінація:</div>
            <div className="bw-calc-line">
              {(pricesThis.priceLaminationPerSheet || 0).toFixed(2)}
              <span className="bw-sub">грн</span>
              <span className="bw-op">×</span>
              {pricesThis.sheetCount || 0}
              <span className="bw-sub">шт</span>
              <span className="bw-op">=</span>
              {((pricesThis.priceLaminationPerSheet || 0) * (pricesThis.sheetCount || 0)).toFixed(2)}
              <span className="bw-sub">грн</span>
            </div>
          </>
        )}

        {/* Custom fields */}
        {Object.entries(customFields).map(([label, value]) => (
          <React.Fragment key={label}>
            <div className="bwsubOP">{label}:</div>
            <div className="bw-calc-line">{value}</div>
          </React.Fragment>
        ))}

        {/* Total */}
        <div
          className="bw-calc-total d-flex justify-content-center align-content-center"
          style={{ fontWeight: "500", color: "red" }}
        >
          {pricesThis.price || 0}
          <span className="bw-sub">грн</span>
        </div>
      </div>
    </div>
  );
};

export default PricingSummary;
