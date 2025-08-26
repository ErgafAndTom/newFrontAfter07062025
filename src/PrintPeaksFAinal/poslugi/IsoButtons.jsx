// src/components/IsoButtons.jsx
import React, {useEffect, useState} from "react";
import "./isoButtons.css";
import NewSheetCut from "./NewSheetCut";

const CELLS = [
  { id:"A1", top:0,     left:0,   wPct:100,   hPct:50,   w:594, h:841, name: "A1 (594 x 841 мм)", x: 594, y: 841  },
  { id:"A2", top:50,    left:0,    wPct:50,   hPct:50,   w:420, h:594, name: "A2 (420 x 594 мм)", x: 420, y: 594  },
  { id:"A3", top:50,    left:50,   wPct:50,   hPct:25,   w:297, h:420, name: "А3 (297 х 420 мм)", x: 297, y: 420  },
  { id:"A4", top:75,    left:50,   wPct:25,   hPct:25,   w:210, h:297, name: "A4 (210 x 297 мм)", x: 210, y: 297  },
  { id:"A5", top:75,    left:75,   wPct:25,   hPct:12.5, w:148, h:210, name: "A5 (148 х 210 мм)", x: 148, y: 210  },
  { id:"A6", top:87.5,  left:75,   wPct:12.5, hPct:12.5, w:105, h:148, name: "А6 (105 х 148 мм)", x: 105, y: 148  },
  { id:"A7", top:87.5,  left:87.5, wPct:12.5, hPct:6.25, w:74,  h:105,   },
  { id:"A8", top:93.75, left:87.5, wPct:6.25, hPct:6.25, w:52,  h:74,    },
  { id:"A9", top:93.75, left:93.75,wPct:6.25, hPct:6.25, w:37,  h:52,    },
];

const CORNER_RADIUS = {
  A1: { borderTopLeftRadius:"9px", borderTopRightRadius:"9px", borderTop: "9px"},
  A2: { borderBottomLeftRadius:"9px" },
  A9: { borderBottomRightRadius:"9px" },
};

const ROTATE_IDS = new Set(['A6','A7','A8','A9','A5','A4','A3','A2','A1']);

export default function IsoButtons({size, setSize}) {
  const [thisSize, setThisSize] = useState("0");

  useEffect(() => {
    let thisItem = 0;
    CELLS.forEach(item => {
      if(item.x === size.x && item.y === size.y) {
        thisItem = item.id
      }
    })
    setThisSize(thisItem)
  }, [size])

  return (
    <div className="iso-wrapper">
      {/* коло A0 */}
      <button className="circle-a0" title="841×1189">
        <span className="rot270">A0</span>
      </button>

      {CELLS.map(c => {
        const rightPct  = c.left + c.wPct;
        const bottomPct = c.top  + c.hPct;

        const style = {
          position:"absolute",
          top:`${c.top}%`,
          left:`${c.left}%`,
          width:`${c.wPct}%`,
          height:`${c.hPct}%`,

          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          background:"#dcd9ce",
          font:"400 0.7rem/1 Inter, sans-serif",
          cursor:"pointer",

          borderTop:    c.top   === 0     ? "none" : "0.5px  solid #dcd9ce",
          borderLeft:   c.left  === 0     ? "none" : "0.5px  solid #dcd9ce",
          borderRight:  rightPct  === 100 ? "0.5px solid #dcd9ce" : "none",
          borderBottom: bottomPct === 100 ? "0.5px  solid #dcd9ce" : "none",

          ...CORNER_RADIUS[c.id],
        };

        const content = ROTATE_IDS.has(c.id)
          ? <span className="rot270">{c.id}</span>
          : c.id;

        return (
          thisSize !== c.id
            ? <button key={c.id} style={style} title={`${c.w}×${c.h}`}>{content}</button>
            : <button key={c.id} style={{...style, background:"#f5a400"}} title={`${c.w}×${c.h}`}>{content}</button>
        );
      })}
    </div>
  );
}
