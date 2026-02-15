import React, {useEffect, useState, useRef} from "react";
import axios from '../../../../api/axiosInstance';
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";

const PlivkaMontajna = ({
                          plivkaMontajna,
                          setPlivkaMontajna,
                          size,
                        }) => {
  const [paper, setPaper] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const [open, setOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const measureRef = useRef(null);

  const handleSelect = (item) => {
    if (item) {
      setPlivkaMontajna((prev) => ({
        ...prev,
        material: item.name || "",
        materialId: item.id || "0",
      }));
    } else {
      // "Без накатки монтажної плівки"
      setPlivkaMontajna((prev) => ({
        ...prev,
        material: "Немає Монтажної плівки",
        materialId: "0",
        typeUse: null,
      }));
    }
    setOpen(false);
  };

  useEffect(() => {
    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: {column: "id", reverse: false},
      size: size,
      material: plivkaMontajna,
    };

    let cancelled = false;
    setLoad(true);
    setError(null);

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        if (cancelled) return;
        const rows = response?.data?.rows || [];
        setPaper(Array.isArray(rows) ? rows : []);
        setLoad(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoad(false);
        setError(err?.message || "Error");
        if (err?.response?.status === 403) navigate("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [plivkaMontajna.thickness, size, navigate]);

  // auto-width
  useEffect(() => {
    if (!measureRef.current) return;
    const widths = Array.from(measureRef.current.children).map((el) =>
      el.getBoundingClientRect().width
    );
    if (widths.length > 0) {
      const maxWidth = Math.ceil(Math.max(...widths)) + 30;
      setDropdownWidth(`${maxWidth}px`);
    }
  }, [paper]);

  // click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isNone = !plivkaMontajna?.materialId || plivkaMontajna.materialId === "0" || plivkaMontajna.materialId === 0;
  const title = isNone
    ? "Без накатки монтажної плівки"
    : plivkaMontajna?.material || "Виберіть плівку";

  return (
    <div className="d-flex flex-row justify-content-between align-items-center w-100 gap-3">
      {/* SELECT */}
      <div
        className={`custom-select-container selectArtem selectArtemBefore${!isNone ? " sc-has-value" : ""}`}
        ref={dropdownRef}
        style={{minWidth: dropdownWidth}}
      >
        {/* tapping hand loader */}
        {isNone && (
          <div className="sc-hand">
            <div className="sc-hand-finger"/>
            <div className="sc-hand-finger"/>
            <div className="sc-hand-finger"/>
            <div className="sc-hand-finger"/>
            <div className="sc-hand-palm"/>
            <div className="sc-hand-thumb"/>
          </div>
        )}
        <div
          className="custom-select-header"
          onClick={() => setOpen(!open)}
        >
          {title}
        </div>

        {open && (
          <div className="custom-select-dropdown" style={{minWidth: dropdownWidth}}>
            {/* Default: без плівки */}
            <div
              className={`custom-option ${isNone ? "active" : ""}`}
              onClick={() => handleSelect(null)}
            >
              <span className="name">Без накатки монтажної плівки</span>
            </div>

            {paper.map((item) => (
              <div
                key={item.id}
                className={`custom-option ${
                  String(item.id) === String(plivkaMontajna?.materialId) ? "active" : ""
                }`}
                onClick={() => handleSelect(item)}
              >
                <span className="name">{item.name}</span>
                {item.x && item.y && (
                  <span className="gsm-sub">
                    <sub style={{marginRight: "0.8vw"}}>
                      {item.x}x{item.y}
                    </sub>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* hidden measure */}
        <div
          ref={measureRef}
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{fontSize: "15px", padding: "8px 12px"}}>
            Без накатки монтажної плівки
          </div>
          {paper.map((item) => (
            <div key={item.id} style={{fontSize: "15px", padding: "8px 12px"}}>
              {item.name} {item.x}x{item.y}
            </div>
          ))}
        </div>

        {load && <Spinner animation="border" variant="danger" size="sm"/>}
        {error && <div>{error}</div>}
      </div>
    </div>
  );
};

export default PlivkaMontajna;