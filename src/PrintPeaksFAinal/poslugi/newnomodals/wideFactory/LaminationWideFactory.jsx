import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {Navigate, useNavigate} from "react-router-dom";
import "../../Poslugy.css";

const LaminationWideFactory = ({lamination, setLamination, prices, buttonsArr, selectArr, size, type}) => {
  const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);
  const navigate = useNavigate();

  let handleSelectChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedId = selectedOption.getAttribute('data-id') || 'default';
    setLamination({
      ...lamination,
      materialId: selectedId,
      size: e.target.value
    })
  }

  let handleToggle = (e) => {
    if (lamination.type === "Не потрібно") {
      setLamination({
        ...lamination,
        type: "",
      })
    } else {
      setLamination({
        ...lamination,
        type: "Не потрібно",
      })
    }
  }

  let handleClick = (e) => {
    // console.log(e);
    setLamination({
      ...lamination,
      materialId: e,
    })
  }

  useEffect(() => {
    if (lamination.type !== "Не потрібно") {
      const data = {
        name: "MaterialsPrices",
        inPageCount: 999999,
        currentPage: 1,
        search: "",
        columnName: { column: "id", reverse: false },
        type: type,
        material: {
          type: "Ламінація FactoryWide",
          material: lamination.material,
          materialId: lamination.materialId,
          thickness: lamination.size,
          typeUse: ""
        },
        size,
      };

      setLoad(true);
      setError(null);

      axios.post(`/materials/NotAll`, data)
        .then(response => {
          setLoad(false);
          const rows = response.data?.rows || [];
          setThisLaminationSizes(rows);

          if (rows.length > 0) {
            const first = rows[0];
            setLamination(prev => ({
              ...prev,
              material: first.name,
              materialId: Number(first.id) || 0, // 👈 ключова правка
              size: String(first.thickness || "")
            }));
          } else {
            setLamination(prev => ({
              ...prev,
              material: "",
              materialId: 0
            }));
          }
        })
        .catch(error => {
          setLoad(false);
          setError(error.message);
          if (error.response?.status === 403) navigate('/login');
          console.error("Error loading lamination materials:", error.message);
          setThisLaminationSizes([]);
        });
    }
  }, [lamination.type, size]);


  const isOn = lamination.type !== "Не потрібно";

  return (
    <div className="d-flex align-items-center">
      <label className="switch scale04ForButtonToggle">
        <input type="checkbox" checked={isOn} onChange={handleToggle} />
        <span className="switch-on"><span>Ламінація</span></span>
        <span className="slider" />
        <span className="switch-off"><span>OFF</span></span>
      </label>
      {!isOn && (
        <div className="sc-title" style={{ marginBottom: 0 }}>Ламінація</div>
      )}
      {isOn && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {thisLaminationSizes.map((item, index) => (
            <div
              className={item.id === lamination.materialId ? "buttonsArtem buttonsArtemActive" : "buttonsArtem"}
              key={index}
              onClick={() => handleClick(item.id)}
            >
              <div style={{ whiteSpace: "nowrap" }}>{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
};

export default LaminationWideFactory;
