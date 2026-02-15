import React, {useEffect, useState, useRef} from "react";
import axios from "../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";

const Materials2 = ({
                      material,
                      setMaterial,
                      buttonsArr = [],
                      size,
                      editingOrderUnit,
                      typeOfPosluga
                    }) => {
  const [paper, setPaper] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const [open, setOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
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

        const rows = response?.data?.rows || [];
        setPaper(Array.isArray(rows) ? rows : []);
        setLoad(false);

        // ✅ Реконсиляція вибору:
        // 1) Якщо є вибраний materialId і він існує в rows — нічого не робимо.
        // 2) Якщо редагування і materialId не знайдений — очищаємо (щоб не показувати "битий" вибір).
        // 3) Якщо нове замовлення — залишаємо пусто (показує "Виберіть матеріал").
        // if (material?.materialId) {
        //   const exists = rows.some((r) => String(r.id) === String(material.materialId));
        //   if (!exists) {
        //     setMaterial((prev) => ({
        //       ...prev,
        //       material: "",
        //       materialId: 0,
        //       a: "",
        //     }));
        //   }
        // } else {
        //   // new order: лишаємо пусто (нічого не сетимо)
        //   // edit: теж нічого не сетимо — бо ініціалізація має бути з optionsJson
        // }
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
  }, [material?.thickness, material?.type, size, navigate, setMaterial]); // materialId не потрібен

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title =
    material?.material && material.material !== "Немає"
      ? material.material
      : "Виберіть матеріал";

  return (
    <div className="d-flex flex-row justify-content-between align-items-center w-100 gap-3 " >

      {/* Кнопки зліва */}
      <div style={{display: "flex"}}>
        {buttonsArr.map((item, index) => {
          const isActive = item === material?.thickness;
          const isFirst = index === 0;
          const isLast = index === buttonsArr.length - 1;

          return (
            <div
              className={
                isActive
                  ? "buttonsArtem buttonsArtemActive"
                  : "buttonsArtem"
              }
              key={index}
              style={{
                backgroundColor: isActive ? "#f5a623" : "#D3D3D3",
                color: isActive ? "#FFFFFF" : "#666666",
                borderTopLeftRadius: isFirst ? "1vh" : "0",
                borderBottomLeftRadius: isFirst ? "1vh" : "0",
                borderTopRightRadius: isLast ? "1vh" : "0",
                borderBottomRightRadius: isLast ? "1vh" : "0",
              }}
              onClick={() => handleClickThickness(item)}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  color: isActive ? "white" : "var(--admingrey)",
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


      {/* SELECT справа */}
      <div
        className={`custom-select-container selectArtem selectArtemBefore${material?.materialId && material.materialId !== 0 && material.materialId !== "0" ? " sc-has-value" : ""}`}
        ref={dropdownRef}
        style={{minWidth: dropdownWidth}}
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
          onClick={() => setOpen(!open)}
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

        {open && (
          <div className="custom-select-dropdown" style={{minWidth: dropdownWidth}}>
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
