import React, {useEffect, useState, useRef} from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";

const Materials2 = ({
                      material,
                      setMaterial,
                      buttonsArr = [],
                      size,
                      editingOrderUnit,
                      typeOfPosluga,
                      disabled = false,
                      preferredMaterialName,
                      autoSelectFirst = true,
                    }) => {
  const [paper, setPaper] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const [open, setOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState("auto");
  const [dropdownStyle, setDropdownStyle] = useState({});

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const portalRef = useRef(null);
  const measureRef = useRef(null);

  const isEdit = Boolean(editingOrderUnit?.idKey || editingOrderUnit?.id);

  // ✅ зміна товщини/типу: очищаємо вибраний матеріал (особливо для new order)
  const handleClickThickness = (thickness) => {
    const isSelf = thickness === "Самоклеючі";

    setMaterial((prev) => ({
      ...prev,
      type: isSelf ? "Плівка" : "Папір",
      thickness,
      typeUse: thickness,

      // ✅ важливо: при зміні категорії — скидаємо вибір матеріалу
      material: "",
      materialId: 0,
      a: "",
      x: null,
      y: null,
    }));
  };

  const handleSelect = (item) => {
    setMaterial((prev) => ({
      ...prev,
      material: item?.name || "",
      materialId: item?.id || 0,
      a: item?.thickness || "",
      x: item?.x || "",
      y: item?.y || "",
    }));
    setOpen(false);
  };

  // ✅ Завантаження списку матеріалів (без примусового setMaterial("Немає"))
  useEffect(() => {
    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: {column: "id", reverse: false},
      typeOfPosluga: typeOfPosluga,
      size,
      material, // бек у тебе фільтрує по type/thickness
    };

    let cancelled = false;
    setLoad(true);
    setError(null);

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        if (cancelled) return;

        const rawRows = response?.data?.rows || [];
        const rows = Array.isArray(rawRows) ? rawRows : [];
        setPaper(rows);
        setLoad(false);

        // Якщо є preferredMaterialName — завжди вибирати його
        if (preferredMaterialName && rows.length > 0) {
          const preferred = rows.find((r) => r.name === preferredMaterialName);
          const target = preferred || rows[0];
          if (String(target.id) !== String(material?.materialId)) {
            setMaterial((prev) => ({
              ...prev,
              material: target.name,
              materialId: target.id,
              a: target.thickness || "",
              x: target.x || "",
              y: target.y || "",
            }));
          }
        } else {
          // Авто-вибір першого матеріалу якщо нічого не вибрано або поточний відсутній у результатах
          const currentExists = rows.some((r) => String(r.id) === String(material?.materialId));
          if (autoSelectFirst && rows.length > 0 && (!material?.materialId || material.materialId === 0 || material.materialId === "0" || !currentExists)) {
            setMaterial((prev) => ({
              ...prev,
              material: rows[0].name,
              materialId: rows[0].id,
              a: rows[0].thickness || "",
              x: rows[0].x || "",
              y: rows[0].y || "",
            }));
          }
        }
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
  }, [material?.thickness, material?.type, size, navigate, setMaterial, preferredMaterialName, autoSelectFirst]);

  // 📏 автоширина
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

  // клік поза селектом
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inContainer = dropdownRef.current?.contains(event.target);
      const inPortal = portalRef.current?.contains(event.target);
      if (!inContainer && !inPortal) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title =
    material?.material && material.material !== "Немає"
      ? material.material
      : "Виберіть матеріал";
  const hasButtons = buttonsArr.length > 0;

  return (
    <div className={`d-flex flex-row align-items-center w-100 ${hasButtons ? "justify-content-between gap-3" : "justify-content-center"}`} >

      {/* Кнопки зліва */}
      {hasButtons && (
      <div style={{display: "flex"}}>
        {buttonsArr.map((item, index) => {
          const isActive = item === material?.thickness;
          return (
            <div
              className={
                isActive
                  ? "buttonsArtem buttonsArtemActive"
                  : "buttonsArtem"
              }
              key={index}
              onClick={() => handleClickThickness(item)}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* SELECT справа */}
      <div
        className={`custom-select-container selectArtem selectArtemBefore${material?.materialId && material.materialId !== 0 && material.materialId !== "0" ? " sc-has-value" : ""}`}
        ref={dropdownRef}
        style={{ minWidth: hasButtons ? dropdownWidth : "100%", width: hasButtons ? undefined : "100%" }}
      >
        {/* tapping hand loader */}
        {!(material?.materialId && material.materialId !== 0 && material.materialId !== "0") && (
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
          onClick={() => {
            if (disabled) return;
            if (!open && dropdownRef.current) {
              const rect = dropdownRef.current.getBoundingClientRect();
              setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 2,
                left: rect.left,
                width: rect.width,
                zIndex: 99999,
              });
            }
            setOpen(!open);
          }}
          style={disabled ? { pointerEvents: "none", opacity: 0.7 } : undefined}
        >
          {title}
          <span className="gsm-sub" style={{marginRight: "0.8vw"}}>
          <sub style={{marginRight: "0.8vw"}}>
            {material.x && material.y && (
              <sub>
                {material.x}x{material.y}
              </sub>
            )}
          </sub>
            {material?.a ? (
              <sub>
                {material.a} г/м<sub>2</sub>
              </sub>
            ) : null}
        </span>
        </div>

        {open && ReactDOM.createPortal(
          <div ref={portalRef} className="custom-select-dropdown" style={{ ...dropdownStyle, minWidth: hasButtons ? dropdownWidth : dropdownStyle.width }}>
            {paper.map((item) => (
              <div
                key={item.id}
                className={`custom-option ${
                  String(item.id) === String(material?.materialId) ? "active" : ""
                }`}
                onClick={() => handleSelect(item)}
              >
                <span className="name">{item.name}</span>
                <span className="gsm-sub">
                <sub style={{marginRight: "0.8vw"}}>
                  {item.x && item.y && (
                    <sub>
                      {item.x}x{item.y}
                    </sub>
                  )}
                </sub>
                <sub>
                  {item.thickness} г/м<sub>2</sub>
                </sub>
              </span>
              </div>
            ))}
          </div>,
          document.body
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
          {paper.map((item) => (
            <div key={item.id} style={{fontSize: "15px", padding: "8px 12px"}}>
              {item.name} {item.x}x{item.y} {item.thickness}gsm
            </div>
          ))}
        </div>

        {load && <Spinner animation="border" variant="danger" size="sm"/>}
        {error && <div>{error}</div>}
      </div>

    </div>
  );

};

export default Materials2;
