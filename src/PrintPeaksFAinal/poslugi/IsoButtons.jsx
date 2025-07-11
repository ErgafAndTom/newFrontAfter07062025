import React from "react";
import "./isoButtons.css";

/* прямокутники A1-A9 (A0 буде окремим кругом) */
const CELLS = [
  { id:"A1", top:0,     left:0,   wPct:100,   hPct:50,   w:594, h:841  },
  { id:"A2", top:50,    left:0,    wPct:50,   hPct:50,   w:420, h:594  },
  { id:"A3", top:50,    left:50,   wPct:50,   hPct:25,   w:297, h:420  },
  { id:"A4", top:75,    left:50,   wPct:25,   hPct:25,   w:210, h:297  },
  { id:"A5", top:75,    left:75,   wPct:25,   hPct:12.5, w:148, h:210  },
  { id:"A6", top:87.5,  left:75,   wPct:12.5, hPct:12.5, w:105, h:148  },
  { id:"A7", top:87.5,  left:87.5, wPct:12.5, hPct:6.25, w:74,  h:105  },
  { id:"A8", top:93.75, left:87.5, wPct:6.25, hPct:6.25, w:52,  h:74   },
  { id:"A9", top:93.75, left:93.75,wPct:6.25, hPct:6.25, w:37,  h:52   },
];

export default function IsoButtons() {
  return (
    <div className="iso-wrapper">
      {/* центральний круг A0 поверх усіх елементів */}
      <button className="circle-a0" title="841×1189">A0</button>

      {/* решта форматів */}
      {CELLS.map(c => {
        const rightPct  = c.left + c.wPct;
        const bottomPct = c.top  + c.hPct;

        return (
          <button
            key={c.id}
            title={`${c.w}×${c.h}`}
            style={{
              position:"absolute",
              top:`${c.top}%`,
              left:`${c.left}%`,
              width:`${c.wPct}%`,
              height:`${c.hPct}%`,

              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              background:"#dcd9ce",
              font:"400 0.8rem/1 Inter, sans-serif",
              cursor:"pointer",

              /* внутрішня сітка—лише 1-px лінія */
              borderTop:    c.top   === 0     ? "none":"1px solid #000",
              borderLeft:   c.left  === 0     ? "none":"1px solid #000",
              borderRight:  rightPct  === 100 ? "1px solid #000":"none",
              borderBottom: bottomPct === 100 ? "1px solid #000":"none",
            }}
          >
            {c.id}
          </button>
        );
      })}
    </div>
  );
}
