import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const Porizka = ({porizka, setPorizka, prices, buttonsArr, selectArr}) => {
    const [thisLaminationSizes, setThisLaminationSizes] = useState([]);
    const navigate = useNavigate();

    let handleSelectChange = (e) => {
        setPorizka({
            ...porizka,
            size: e.target.value
        })
    }

    let handleToggle = (e) => {
        if (porizka.type === "Не потрібно") {
            setPorizka({
                type: "Потрібно",
                material: "",
                materialId: "",
                size: ""
            })
        } else {
            setPorizka({
                type: "Не потрібно",
                material: "",
                materialId: "",
                size: ""
            })
        }
    }

    let handleClick = (e) => {
        // if(e !== "З ламінуванням Soft Touch"){
        //     setThisLaminationSizes(["30", "80", "100", "125", "250"])
        // } else {
        //     setThisLaminationSizes(["30", "80"])
        // }
        setPorizka({
            ...porizka,
            type: e,
            material: e,
            materialId: e,
        })
    }

    return (<div className="d-flex allArtemElem">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* NEW SWITCH */}
        <label className="switch scale04ForButtonToggle"  aria-label="Порізка">
          <input
            type="checkbox"
            checked={porizka.type !== "Не потрібно"}
            onChange={handleToggle}
          />
          <span className="slider" />
        </label>

        <div className="d-flex flex-row">
    <span className="PostpressNames" style={{ marginRight: '0.633vw', width: '20vw' }}>
      Порізка (+15% к вартості):
    </span>

          {/* за потреби тут контент для активного стану */}
        </div>
      </div>

    </div>)
};

export default Porizka;
