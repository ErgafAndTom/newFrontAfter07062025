import React, { useMemo } from "react";
import "./radical-menu.css";

function makeIcon(pathProps) {
  return function Icon({ className }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="0" y="0" width="24" height="24" rx="5" ry="5" opacity="0" />
        <path {...pathProps} />
      </svg>
    );
  };
}

const IconMono = makeIcon({ d: "M4 6h16M6 10h12M8 14h8M10 18h4" });
const IconPalette = makeIcon({ d: "M12 3a9 9 0 1 0 0 18h2a3 3 0 0 0 0-6h-1a1 1 0 0 1-1-1v-1h1a3 3 0 0 0 0-6h-1" });
const IconWide = makeIcon({ d: "M3 8h18v8H3z M6 12h12" });
const IconPhoto = makeIcon({ d: "M4 7h16v10H4z M8 10l3 3 3-2 4 4" });
const IconPostpress = makeIcon({ d: "M4 6h16M6 10h12M8 14h8m-6 3h4" });
const IconBinding = makeIcon({ d: "M7 4v16m10-16v16M10 6h4M10 10h4M10 14h4" });
const IconCut = makeIcon({ d: "M4 7l8 5-8 5M12 12l8-5M12 12l8 5M6 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" });
const IconFactory = makeIcon({ d: "M3 18h18v2H3z M5 18V9l6 3V9l6 3V8h2v10" });
const IconLamination = makeIcon({ d: "M4 6h16v8H4z m2 4h12 M6 16h12" });
const IconNote = makeIcon({ d: "M6 4h9l3 3v13H6z M14 4v5h5" });
const IconBooklet = makeIcon({ d: "M5 5h7v14H5z m7 0h7v14h-7z" });
const IconMug = makeIcon({ d: "M6 6h8v12H6z m8 3h2a2 2 0 0 1 0 6h-2" });
const IconMagnet = makeIcon({ d: "M7 6h4v6H7z m6 0h4v6h-4z M7 12a5 5 0 0 0 10 0" });
const IconScan = makeIcon({ d: "M4 7h16M5 12h14M8 17h8" });
const IconDelivery = makeIcon({ d: "M3 15h13V8H3z m13 0h4l-2-3h-2z M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" });

const CATEGORIES = [
  { key: "black", title: "BLACK", subtitle: "Sheet Printing", tone: "prod", Icon: IconMono },
  { key: "color", title: "COLOR", subtitle: "Products", tone: "prod", Icon: IconPalette },
  { key: "wide", title: "WIDE", subtitle: "Large Format", tone: "plant", Icon: IconWide },
  { key: "photo", title: "PHOTO", subtitle: "Lab & Studio", tone: "plant", Icon: IconPhoto },
  { key: "postpress", title: "POSTPRESS", subtitle: "Finish & Bind", tone: "finish", Icon: IconPostpress },
  { key: "binding", title: "BINDING", subtitle: "Spine & Glue", tone: "finish", Icon: IconBinding },
  { key: "cutting", title: "CUTTING", subtitle: "Trim & Die-cut", tone: "finish", Icon: IconCut },
  { key: "wide-factory", title: "WIDE FACTORY", subtitle: "Production Line", tone: "plant", Icon: IconFactory },
  { key: "lamination", title: "LAMINATION", subtitle: "Films & Boards", tone: "finish", Icon: IconLamination },
  { key: "note", title: "NOTE", subtitle: "Quick Tickets", tone: "service", Icon: IconNote },
  { key: "booklet", title: "BOOKLET", subtitle: "Staple & Fold", tone: "prod", Icon: IconBooklet },
  { key: "mug", title: "MUG", subtitle: "Merch & Gifts", tone: "prod", Icon: IconMug },
  { key: "magnets", title: "MAGNETS", subtitle: "Promo & Fridge", tone: "prod", Icon: IconMagnet },
  { key: "scans", title: "SCANS", subtitle: "Archive & OCR", tone: "service", Icon: IconScan },
  { key: "delivery", title: "DELIVERY", subtitle: "Ship & Pickup", tone: "service", Icon: IconDelivery },
];

export default function RadicalMenuGrid({ onPick }) {
  const items = useMemo(() => CATEGORIES, []);
  return (
    <div className="rad-grid">
      {items.map(({ key, title, subtitle, tone, Icon }) => (
        <button
          key={key}
          className={`rad-card tone-${tone}`}
          onClick={() => onPick?.(key)}
          aria-label={`${title} — ${subtitle}`}
        >
          <span className="rad-liquid" aria-hidden="true" />
          <span className="rad-face rad-front">
            <span className="rad-icon-wrap" data-parallax>
              <Icon className="rad-icon" />
            </span>
            <span className="rad-title">{title}</span>
            <span className="rad-sub">{subtitle}</span>
          </span>
          <span className="rad-face rad-back">
            <span className="rad-back-top">{title}</span>
            <span className="rad-back-bottom">Open</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export const buildHandlePick = (ctx) => {
  const map = {
    black: () => ctx?.setShowNewSheetCutBW?.(true),
    color: () => ctx?.setShowNewSheetCut?.(true),
    wide: () => ctx?.setShowNewWide?.(true),
    photo: () => ctx?.setShowNewPhoto?.(true),
    postpress: () => ctx?.setShowBigOvshik?.(true),
    binding: () => ctx?.setShowPerepletMet?.(true),
    cutting: () => ctx?.setShowVishichka?.(true),
    "wide-factory": () => ctx?.setShowWideFactory?.(true),
    lamination: () => ctx?.setShowLaminator?.(true),
    note: () => ctx?.setShowNewNote?.(true),
    booklet: () => ctx?.setShowNewBooklet?.(true),
    mug: () => ctx?.setShowNewCup?.(true),
    magnets: () => ctx?.setShowNewMagnets?.(true),
    scans: () => ctx?.setShowNewScans?.(true),
    delivery: () => ctx?.setShowDelivery?.(true),
  };
  return (key) => map[key]?.();
};
