import React, {useEffect, useState} from "react";
import axios from '../../../../api/axiosInstance';
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";

const PlivkaMontajna = ({
                          plivkaMontajna,
                          setPlivkaMontajna,
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
  const navigate = useNavigate();
  let handleSelectChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedId = selectedOption.getAttribute('data-id') || 'default';
    const selectedValue = e.target.value || '';

    setPlivkaMontajna((prevMaterial) => ({
      ...prevMaterial,
      material: selectedValue,
      materialId: selectedId,
    }));

    // setMaterial({
    //     type: material.type,
    //     thickness: material.thickness,
    //     material: e.target.value,
    //     materialId: e.target.getAttribute("idcustom"),
    // })
  }

  useEffect(() => {
    let data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: {
        column: "id",
        reverse: false
      },
      size: size,
      material: plivkaMontajna
    }
    // console.log(data);
    setLoad(true)
    setError(null)
    axios.post(`/materials/NotAll`, data)
      .then(response => {
        console.log(response.data);
        setPaper(response.data.rows)
        setLoad(false)
        // if (response.data && response.data.rows && response.data.rows[0]) {
        //   setPlivkaMontajna({
        //     ...plivkaMontajna,
        //     material: response.data.rows[0].name,
        //     materialId: response.data.rows[0].id,
        //   })
        // } else {
        //   setPlivkaMontajna({
        //     ...plivkaMontajna,
        //     material: "Немає",
        //     materialId: 0,
        //   })
        // }
      })
      .catch(error => {
        setLoad(false)
        setError(error.message)
        if (error.response.status === 403) {
          navigate('/login');
        }
        console.log(error.message);
      })
  }, [
    plivkaMontajna.thickness,
    size
  ]);


  return (
    <div className="d-flex allArtemElem" style={{marginLeft: "2vw", marginTop: "1vh"}}>
      <div style={{display: 'flex',}}>
        {/*<div style={{display: 'flex'}}>*/}
        {/*  {buttonsArr.map((item, index) => (*/}
        {/*    <div*/}
        {/*      className={item === material.thickness ? 'buttonsArtem buttonsArtemActive' : 'buttonsArtem'}*/}
        {/*      key={index}*/}
        {/*      onClick={() => handleClick(item)}*/}
        {/*      // style={{*/}
        {/*      //     backgroundColor: item === material.thickness ? 'orange' : 'transparent',*/}
        {/*      //     border: item === material.thickness ? '0.13vw solid transparent' : '0.13vw solid transparent',*/}
        {/*      // }}*/}
        {/*    >*/}
        {/*      <div className="" style={{*/}
        {/*        height: "100%",*/}
        {/*        opacity: item === material.thickness ? '100%' : '50%',*/}

        {/*      }}>*/}
        {/*        {item}*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  ))}*/}
        {/*</div>*/}
        <div className="ArtemNewSelectContainer" style={{marginTop: "0vw", justifyContent: 'center'}}>
          <select
            name="materialSelect"
            value={plivkaMontajna.material || ""}
            onChange={(event) => handleSelectChange(event)}
            className="selectArtem"

          >
            <option
              key="default"
              className="optionInSelectArtem"
              value="Немає Монтажної плівки"
              data-id="0"
            >
              <>{"Немає Монтажної плівки"}</>
            </option>
            {paper.map((item, iter) => (
              <option
                key={item.name + iter}
                className="optionInSelectArtem"
                value={item.name}
                data-id={item.id}
              >
                {/*<>{"id:"}</>*/}
                {/*<>{item.id}</>*/}
                {/*<>{" "}</>*/}
                <>{item.name}</>
                <>{" "}</>
                <>{item.thickness} gsm</>
                {/*<>{"id:"}</>*/}
                {/*<> {item.x}</>*/}
                {/*<>x</>*/}
                {/*<>{item.y}</>*/}
                {/*<>{" "}</>*/}
              </option>
            ))}
          </select>
          {load && (
            <Spinner animation="border" variant="danger" size="sm"/>
          )}
          {error && (
            <div>{error}</div>
          )}
        </div>
      </div>
    </div>
  )
};

export default PlivkaMontajna;
