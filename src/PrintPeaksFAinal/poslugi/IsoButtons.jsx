import React from "react";
import "./IsoButtons.css";

const SIZES = [
  { id: "A0",  w: 841, h: 1189, top: 0,    left: 0,    wPct: 100, hPct: 100   },
  { id: "A1",  w: 594, h: 841,  top: 0,    left: 50,   wPct: 50,  hPct: 50    },
  { id: "A2",  w: 420, h: 594,  top: 50,   left: 50,   wPct: 50,  hPct: 25    },
  { id: "A3",  w: 297, h: 420,  top: 50,   left: 75,   wPct: 25,  hPct: 25    },
  { id: "A4",  w: 210, h: 297,  top: 75,   left: 75,   wPct: 25,  hPct: 12.5  },
  { id: "A5",  w: 148, h: 210,  top: 87.5, left: 75,   wPct: 25,  hPct: 12.5  },
  { id: "A6",  w: 105, h: 148,  top: 87.5, left: 87.5, wPct: 12.5,hPct: 6.25 },
  { id: "A7",  w:  74, h: 105,  top: 93.75,left: 87.5, wPct: 12.5,hPct: 6.25 },
  { id: "A8",  w:  52, h:  74,  top: 93.75,left: 93.75,wPct: 6.25,hPct: 3.125},
  { id: "A9",  w:  37, h:  52,  top: 96.875,left:93.75,wPct: 6.25,hPct: 3.125}
];

export default function IsoButtons() {
  return (
    <div className="iso-wrapper">
      <img src="/assets/isoA.png" alt="ISO A scheme" className="iso-bg" />
      {SIZES.map(s => (
        <button
          key={s.id}
          className="adminButtonAdd"
          style={{
            top:  `${s.top}%`,
            left: `${s.left}%`,
            width:  `${s.wPct}%`,
            height: `${s.hPct}%`
          }}
        >
          {s.id}
          <span className="dims">{s.w}×{s.h}</span>
        </button>
      ))}
    </div>
  );
}
