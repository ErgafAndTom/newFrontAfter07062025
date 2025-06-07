import { Switch, FormControlLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Sublim.css";

const Sublim = () => {
  const navigate = useNavigate();

  const onWideJClick = () => {
    navigate("/plus-prod");
  };

  return (
    <div className="sublim">
      <div className="fon12" />
      <div className="fon3">
        <div className="div480" />
      </div>
      <div className="widea1">
        <b className="print-peaks-erp2246">
          <li className="print6">PRINT</li>
          <li className="print6">PEAKS</li>
          <li className="print6">
            <span>ERP</span>
            <span className="span113">2.24</span>
          </li>
        </b>
      </div>
      <div className="widec1">
        <div className="div481" />
        <div className="plus-zam-text2">Додати до замовлення</div>
      </div>
      <div className="wideb2" />
      <button className="widej1" autoFocus={true} onClick={onWideJClick}>
        <div className="div481" />
        <div className="plus-prod-text2">Додати до пресетів</div>
      </button>
      <img className="image-icon" alt="" src="/image@2x.png" />
      <div className="div483">
        <div className="wideg1">
          <div className="picker-top-label1">
            <div className="placement-area1" />
            <div className="field-button7" />
            <div className="text29">Розмір</div>
            <div className="chevron17">
              <img className="shape-icon17" alt="" src="/shape7.svg" />
            </div>
            <div className="cursor-area1" />
            <div className="touch-area1" />
            <div className="field-button8" />
            <div className="text30">
              <span>З червоною ручкою 330</span>
              <span className="span114">мл</span>
            </div>
            <div className="icondropdown-arrowsmall3">
              <img className="mask-icon3" alt="" src="/mask1.svg" />
            </div>
          </div>
        </div>
        <div className="cpmas1">Друк на кружках</div>
        <div className="kilkist4">
          <div className="container-l-color20" />
          <div className="top-label5">
            <div className="label25">Кількість</div>
          </div>
          <div className="div484">
            <div className="input-text20">|</div>
            <div className="div485" />
            <div className="label26">шт</div>
          </div>
          <div className="chevron18">
            <div className="frame16" />
            <img className="shape-icon18" alt="" src="/shape4.svg" />
          </div>
          <div className="chevron19">
            <div className="frame16" />
            <img className="shape-icon19" alt="" src="/shape5.svg" />
          </div>
        </div>
        <FormControlLabel
          className="krugr-button"
          control={<Switch color="warning" size="medium" />}
        />
      </div>
      <div className="div486">
        <div className="widek1">
          <div className="div487">Розмір виробу</div>
          <div className="div488">
            <div className="field-button9" />
            <div className="text31">
              <span>{`А7 (75 х 105 `}</span>
              <span className="span113">мм</span>
              <span>)</span>
            </div>
            <div className="icondropdown-arrowsmall4">
              <div className="dropdownbuttoncarotdown-b2" />
              <img className="mask-icon4" alt="" src="/mask2.svg" />
            </div>
          </div>
          <div className="div489">х</div>
          <div className="div490">
            <div className="container-l-color21" />
            <div className="label27">мм</div>
            <div className="input-text21">105</div>
            <div className="chevron20">
              <div className="frame18" />
              <img className="shape-icon20" alt="" src="/shape8.svg" />
            </div>
            <div className="chevron21">
              <div className="frame18" />
              <img className="shape-icon21" alt="" src="/shape9.svg" />
            </div>
          </div>
          <div className="div491">
            <div className="container-l-color21" />
            <div className="label27">мм</div>
            <div className="input-text21">75</div>
            <div className="chevron20">
              <div className="frame18" />
              <img className="shape-icon20" alt="" src="/shape8.svg" />
            </div>
            <div className="chevron21">
              <div className="frame18" />
              <img className="shape-icon21" alt="" src="/shape9.svg" />
            </div>
          </div>
        </div>
        <div className="cpmas2">Друк на магнітах</div>
        <div className="kilkist5">
          <div className="container-l-color20" />
          <div className="top-label5">
            <div className="label25">Кількість</div>
          </div>
          <div className="div484">
            <div className="input-text20">|</div>
            <div className="div485" />
            <div className="label26">шт</div>
          </div>
          <div className="chevron18">
            <div className="frame16" />
            <img className="shape-icon18" alt="" src="/shape4.svg" />
          </div>
          <div className="chevron19">
            <div className="frame16" />
            <img className="shape-icon19" alt="" src="/shape5.svg" />
          </div>
        </div>
        <FormControlLabel
          className="krugr-button1"
          control={<Switch color="warning" size="medium" />}
        />
      </div>
      <div className="div494">
        <div className="cpmas3">{`Сублімаційний папір `}</div>
        <div className="kilkist6">
          <div className="container-l-color20" />
          <div className="top-label5">
            <div className="label25">Кількість</div>
          </div>
          <div className="div484">
            <div className="input-text20">|</div>
            <div className="div485" />
            <div className="label26">шт</div>
          </div>
          <div className="chevron18">
            <div className="frame16" />
            <img className="shape-icon18" alt="" src="/shape4.svg" />
          </div>
          <div className="chevron19">
            <div className="frame16" />
            <img className="shape-icon19" alt="" src="/shape5.svg" />
          </div>
        </div>
        <FormControlLabel
          className="krugr-button2"
          control={<Switch color="warning" size="medium" />}
        />
        <div className="div497">
          <div className="div498">А4</div>
        </div>
      </div>
      <div className="sum2">
        <div className="text32">
          <span>{`250 `}</span>
          <span className="span114">грн</span>
          <span>{` x 1 `}</span>
          <span className="span114">шт</span>
          <span>{` = 250 `}</span>
          <span className="span114">грн</span>
        </div>
        <div className="text33">
          <span>{`10 `}</span>
          <span className="span114">грн</span>
          <span>{` x 25 `}</span>
          <span className="span114">шт</span>
          <span>{` = 250 `}</span>
          <span className="span114">грн</span>
        </div>
        <div className="text34">
          <span>{`0 `}</span>
          <span className="span114">грн</span>
          <span>{` x 0 `}</span>
          <span className="span114">шт</span>
          <span>{` = 0 `}</span>
          <span className="span114">грн</span>
        </div>
        <div className="text35">Друк на кружках</div>
        <div className="text36">Сублімаційний папір</div>
        <div className="text37">Друк на магнітах</div>
        <div className="sum-text2">Загальна вартість:</div>
        <b className="text38">
          <span>{`500 `}</span>
          <span className="span114">грн</span>
        </b>
      </div>
    </div>
  );
};

export default Sublim;
