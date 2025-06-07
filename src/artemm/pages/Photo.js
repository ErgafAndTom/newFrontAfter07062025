import { Switch, FormControlLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Photo.css";

const Photo = () => {
  const navigate = useNavigate();

  const onPhotoGClick = () => {
    navigate("/plus-prod");
  };

  return (
    <div className="photo">
      <div className="fon13">
        <div className="fon14" />
      </div>
      <div className="fon4">
        <div className="fon5" />
      </div>
      <div className="photoa">
        <b className="print-peaks-erp2247">
          <li className="print7">PRINT</li>
          <li className="print7">PEAKS</li>
          <li className="print7">
            <span>ERP</span>
            <span className="span126">2.24</span>
          </li>
        </b>
      </div>
      <button className="photoc" autoFocus={true}>
        <div className="div499" />
        <div className="plus-zam-text3">Додати до замовлення</div>
      </button>
      <button className="photog" autoFocus={true} onClick={onPhotoGClick}>
        <div className="div499" />
        <div className="plus-prod-text3">Додати до пресетів</div>
      </button>
      <div className="div501">
        <div className="photoi">
          <div className="container-l-color25" />
          <div className="top-label8">
            <div className="label33">Кількість</div>
          </div>
          <div className="div502">
            <div className="input-text25">|</div>
            <div className="div503" />
            <div className="label34">шт</div>
          </div>
          <div className="chevron28">
            <div className="frame26" />
            <img className="shape-icon28" alt="" src="/shape4.svg" />
          </div>
          <div className="chevron29">
            <div className="frame26" />
            <img className="shape-icon29" alt="" src="/shape5.svg" />
          </div>
        </div>
        <div className="cpmas4">Фото на документи</div>
        <div className="div504">
          <button className="metal1" autoFocus={true}>
            <div className="r-15811" />
            <div className="metal-text1">Із зображенням клієнта</div>
          </button>
          <button className="tberd1" autoFocus={true}>
            <div className="r-15811" />
            <div className="tverd-text1">В електронному варіанті</div>
          </button>
          <button className="skoba1" autoFocus={true}>
            <div className="div499" />
            <div className="skoba-text1">З друком</div>
          </button>
        </div>
        <FormControlLabel
          className="krugr-button3"
          control={<Switch color="warning" size="medium" />}
        />
      </div>
      <div className="div507">
        <div className="photoi1">
          <div className="container-l-color25" />
          <div className="top-label8">
            <div className="label33">Кількість</div>
          </div>
          <div className="div502">
            <div className="input-text25">|</div>
            <div className="div503" />
            <div className="label34">шт</div>
          </div>
          <div className="chevron28">
            <div className="frame26" />
            <img className="shape-icon28" alt="" src="/shape4.svg" />
          </div>
          <div className="chevron29">
            <div className="frame26" />
            <img className="shape-icon29" alt="" src="/shape5.svg" />
          </div>
        </div>
        <div className="cpmas5">Бланк фото на документи</div>
        <FormControlLabel
          className="krugr-button4"
          control={<Switch color="warning" size="medium" />}
        />
      </div>
      <div className="div510">
        <div className="photoi2">
          <div className="container-l-color25" />
          <div className="top-label8">
            <div className="label33">Кількість</div>
          </div>
          <div className="div502">
            <div className="input-text25">|</div>
            <div className="div503" />
            <div className="label34">шт</div>
          </div>
          <div className="chevron28">
            <div className="frame26" />
            <img className="shape-icon28" alt="" src="/shape4.svg" />
          </div>
          <div className="chevron29">
            <div className="frame26" />
            <img className="shape-icon29" alt="" src="/shape5.svg" />
          </div>
        </div>
        <div className="cpmas6">Сканування фотографій та фотоплівки</div>
        <div className="div513">
          <button className="metal2" autoFocus={true}>
            <div className="r-15811" />
            <div className="metal-text1">Плівка 35мм</div>
          </button>
          <button className="tberd2" autoFocus={true}>
            <div className="r-15811" />
            <div className="tverd-text2">Середньоформатна плівка</div>
          </button>
          <button className="tberd3" autoFocus={true}>
            <div className="r-15811" />
            <div className="tverd-text3">Слайди</div>
          </button>
          <button className="skoba2" autoFocus={true}>
            <div className="div499" />
            <div className="skoba-text2">Фотографія</div>
          </button>
        </div>
        <FormControlLabel
          className="krugr-button5"
          control={<Switch color="warning" size="medium" />}
        />
      </div>
      <div className="div517">
        <div className="photof" />
        <div className="photof1" />
        <div className="photof2" />
        <div className="photof3" />
        <div className="tverd-text4">
          <li className="print7">
            <span className="span127">А3</span>
          </li>
          <li className="print7">
            <span className="span128">29,7 х 42</span>
            <span className="span129"> см</span>
          </li>
        </div>
        <div className="div518">
          <div className="photof4" />
          <div className="tverd-text5">
            <li className="print7">
              <span className="span127">А4</span>
            </li>
            <li className="print7">
              <span className="span128">21 х 29,7</span>
              <span className="span129"> см</span>
            </li>
          </div>
        </div>
        <div className="div519">
          <div className="photof5" />
          <div className="photof6" />
          <div className="tverd-text6">Polaroid</div>
        </div>
        <div className="div520">
          <div className="photof7" />
          <div className="tverd-text7">
            <li className="print7">
              <span className="span127">А5</span>
            </li>
            <li className="print7">
              <span className="span128">14,8 х 21</span>
              <span className="span129"> см</span>
            </li>
          </div>
        </div>
        <div className="tverd-text8">
          <li className="print7">
            <span className="span127">А6</span>
          </li>
          <li className="print7">
            <span className="span128">10,5 х 14,8</span>
            <span className="span129"> см</span>
          </li>
        </div>
        <div className="tverd-text9">
          <span className="span127">13 х 18 см</span>
          <span className="span128" />
          <span className="span141" />
        </div>
        <div className="tverd-text10">
          <span className="span127">10 х 15 см</span>
          <span className="span128" />
          <span className="span141" />
        </div>
      </div>
      <div className="div521">
        <div className="photoe">
          <img className="untitled-6-icon1" alt="" src="/untitled-61@2x.png" />
        </div>
        <div className="wideb3" />
        <div className="sum3">
          <div className="text39">
            <span>{`40 `}</span>
            <span className="span145">грн</span>
            <span>{` x 1 `}</span>
            <span className="span145">шт</span>
            <span>{` = 40 `}</span>
            <span className="span145">грн</span>
          </div>
          <div className="text40">
            <span>{`150 `}</span>
            <span className="span145">грн</span>
            <span>{` x 1 `}</span>
            <span className="span145">шт</span>
            <span>{` = 150 `}</span>
            <span className="span145">грн</span>
          </div>
          <div className="text41">
            <span>{`0 `}</span>
            <span className="span145">грн</span>
            <span>{` x 0 `}</span>
            <span className="span145">шт</span>
            <span>{` = 0 `}</span>
            <span className="span145">грн</span>
          </div>
          <div className="text42">
            <span>{`15 `}</span>
            <span className="span145">грн</span>
            <span>{` x 10 `}</span>
            <span className="span145">шт</span>
            <span>{` = 150 `}</span>
            <span className="span145">грн</span>
          </div>
          <div className="text43">Друк фотографій</div>
          <div className="text44">Фото на документи</div>
          <div className="text45">Бланк фото на документи</div>
          <div className="text46">Сканування фотографій та фотоплівки</div>
          <div className="sum-text3">Загальна вартість:</div>
          <b className="text47">
            <span>{`340 `}</span>
            <span className="span145">грн</span>
          </b>
        </div>
      </div>
      <div className="div522">
        <div className="photoh">
          <div className="div523">Розмір виробу</div>
          <div className="div524">
            <div className="field-button10" />
            <div className="text48">А4 (210 х 297 мм)</div>
            <div className="icondropdown-arrowsmall5">
              <div className="dropdownbuttoncarotdown-b3" />
              <img className="mask-icon5" alt="" src="/mask2.svg" />
            </div>
          </div>
          <div className="div525">х</div>
          <div className="div526">
            <div className="container-l-color28" />
            <div className="div527" />
            <div className="label39">мм</div>
            <div className="input-text28">297</div>
            <div className="chevron34">
              <div className="frame32" />
              <img className="shape-icon34" alt="" src="/shape8.svg" />
            </div>
            <div className="chevron35">
              <div className="frame32" />
              <img className="shape-icon35" alt="" src="/shape9.svg" />
            </div>
          </div>
          <div className="div528">
            <div className="container-l-color28" />
            <div className="div527" />
            <div className="label39">мм</div>
            <div className="input-text28">210</div>
            <div className="chevron34">
              <div className="frame32" />
              <img className="shape-icon34" alt="" src="/shape8.svg" />
            </div>
            <div className="chevron35">
              <div className="frame32" />
              <img className="shape-icon35" alt="" src="/shape9.svg" />
            </div>
          </div>
        </div>
        <div className="photoi3">
          <div className="container-l-color25" />
          <div className="top-label8">
            <div className="label33">Кількість</div>
          </div>
          <div className="div502">
            <div className="input-text25">|</div>
            <div className="div503" />
            <div className="label34">шт</div>
          </div>
          <div className="chevron28">
            <div className="frame26" />
            <img className="shape-icon28" alt="" src="/shape4.svg" />
          </div>
          <div className="chevron29">
            <div className="frame26" />
            <img className="shape-icon29" alt="" src="/shape5.svg" />
          </div>
        </div>
        <div className="cpmas7">Друк фотографій:</div>
        <FormControlLabel
          className="krugr-button6"
          control={<Switch color="warning" size="medium" />}
        />
        <div className="div532">
          <div className="field-button11" />
          <div className="text49">Фотопапір Сатін 270 г/м2</div>
          <div className="icondropdown-arrowsmall6">
            <img className="mask-icon6" alt="" src="/mask1.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photo;
