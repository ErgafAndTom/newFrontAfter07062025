import React, {useEffect, useState, useRef} from "react";
import axios from '../../../api/axiosInstance';
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";


const Materials2 = ({
                      material,
                      setMaterial,
                      count,
                      setCount,
                      prices,
                      type,
                      name,
                      buttonsArr,
                      selectArr,
                      typeUse,
                      size
                    }) => {
  const [paper, setPaper] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const [open, setOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState("auto");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const measureRef = useRef(null);

  let handleClick = (e) => {
    if (e === "Самоклеючі") {
      setMaterial({
        type: "Плівка",
        thickness: e,
        material: material.material,
        materialId: material.materialId,
        typeUse: e
      });
    } else {
      setMaterial({
        type: "Папір",
        thickness: e,
        material: material.material,
        materialId: material.materialId,
        typeUse: e
      });
    }
  };

  const handleSelect = (item) => {
    setMaterial({
      ...material,
      material: item.name,
      materialId: item.id,
      a: item.thickness,
    });
    setOpen(false);
  };

  useEffect(() => {
    let data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: {
        column: "id",
        reverse: false,
      },
      size: size,
      material: material,
    };
    setLoad(true);
    setError(null);
    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        setPaper(response.data.rows);
        setLoad(false);
        setMaterial({
          ...material,
          material: "Немає",
          materialId: 0,
        });
      })
      .catch((error) => {
        setLoad(false);
        setError(error.message);
        if (error.response && error.response.status === 403) {
          navigate("/login");
        }
      });
  }, [material.thickness, material.type, size]);

  // 📏 Вимірюємо найбільший елемент для автоширини
// 📏 Вимірюємо найбільший елемент для автоширини
  useEffect(() => {
    if (measureRef.current) {
      const widths = Array.from(measureRef.current.children).map(
        (el) => el.getBoundingClientRect().width
      );
      if (widths.length > 0) {
        const maxWidth = Math.ceil(Math.max(...widths)) + 30; // 👈 трохи запасу
        setDropdownWidth(`${maxWidth}px`);
      }
    }
  }, [paper]);


  // Закриття при кліку поза
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="d-flex allArtemElem" style={{ marginLeft: "2vw"  }}>
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex" }}>
          {buttonsArr.map((item, index) => (
            <div
              className={item === material.thickness ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
              key={index}
              onClick={() => handleClick(item)}
            >
              <div style={{
                height: "100%",
                opacity: item === material.thickness ? "100%" : "50%",
              }}>
                {item}
              </div>
            </div>
          ))}
        </div>

        {/* CUSTOM SELECT */}
        <div
          className="custom-select-container selectArtem "
          ref={dropdownRef}
          style={{ marginLeft: "1vw", minWidth: dropdownWidth, }}
        >
          <div
            className="custom-select-header"
            style={{ marginLeft: "0vw" }}

            onClick={() => setOpen(!open)}
          >
            {material.material && material.material !== "Немає"
              ? material.material
              : "Виберіть матеріал"}
            <span className="gsm-sub">
              {material.a &&
                <sub>{material.a} г/м<sub>2</sub></sub>
              }
                  </span>
            <span className={`arrow ${open ? "up" : "down"}`} style={{color:"#3c60a6", fontSize:"3vh"}}>▾</span>
          </div>

          {open && (
            <div className="custom-select-dropdown " style={{       // 👈 було 100%
              minWidth: dropdownWidth, }}>
              {paper.map((item, i) => (
                <div
                  key={i}
                  className={`custom-option ${
                    item.name === material.material ? "active" : ""
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="name">{item.name}</span>
                  <span className="gsm-sub">
                      <sub>{item.thickness} г/м<sub>2</sub></sub>
                  </span>
                  {/*{(material.type === "Плівка" ||*/}
                  {/*  material.type === "Папір" ||*/}
                  {/*  material.type === "Папір FactoryWide" ||*/}
                  {/*  material.type === "Папір Широкоформат" ||*/}
                  {/*  material.type === "Плівка FactoryWide" ||*/}
                  {/*  material.type === "Баннер FactoryWide") && (*/}
                  {/*  <span className="gsm-sub">*/}
                  {/*    <sub>{item.thickness} г/м<sub>2</sub></sub>*/}
                  {/*  </span>*/}
                  {/*)}*/}
                </div>
              ))}
            </div>
          )}

          {/* Прихований блок для вимірювання ширини */}
          <div
            ref={measureRef}
            style={{
              position: "absolute",
              visibility: "hidden",
              whiteSpace: "nowrap",
              // left: "-9999px",
            }}
          >
            {paper.map((item, i) => (
              <div key={i} style={{ fontSize: "15px", padding: "8px 12px" }}>
                {item.name} {item.thickness}gsm
              </div>
            ))}
          </div>

          {load && <Spinner animation="border" variant="danger" size="sm" />}
          {error && <div>{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Materials2;
