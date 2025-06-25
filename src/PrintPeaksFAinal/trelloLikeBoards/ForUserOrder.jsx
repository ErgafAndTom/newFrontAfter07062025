import React, {useEffect, useRef, useState} from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {Form, ListGroup, Spinner} from "react-bootstrap";
import find from "../../components/find.svg";

function ForUserOrder({showAddPay, setShowAddPay}) {
  const [load, setLoad] = useState(false);
  const [loadSearch, setLoadSearch] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [typeSelect, setTypeSelect] = useState("");
  const [data2, setData2] = useState(null);
  const [contrAgentSearch, setContrAgentSearch] = useState('');
  const [showContrAgentDropdown, setShowContrAgentDropdown] = useState(false);
  const contrAgentRef = useRef(null);
  const [filteredContrAgents, setFilteredContrAgents] = useState([]);
  const [formData, setFormData] = useState({});
  const [data, setData] = useState(null);

  const handleClose = () => {
    setIsAnimating(false); // Начинаем анимацию закрытия
    setTimeout(() => {
      setIsVisible(false)
      setShowAddPay(false);
    }, 300); // После завершения анимации скрываем модальное окно
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  // Обробники вибору контрагента зі списку
  const handleSelectContrAgents = (contractor) => {
    setContrAgentSearch(contractor.name);
    setFormData({
      ...formData,
      contractorId: contractor.id,
      contractorName: contractor.name
    });
    setShowContrAgentDropdown(false);
  };

  const handleSearchContrAgents = (e) => {
    setContrAgentSearch(e.target.value);
  };

  // const handleSubmitUpdate = async (e) => {
  //   e.preventDefault();
  //   setLoad(true);
  //   let dataToSend = {
  //     formData: formData,
  //   };
  //   axios.post(`/api/contractorsN/updatePPContractor`, dataToSend)
  //     .then(response => {
  //       console.log(response.data);
  //       setData(prevData =>
  //         prevData.map(obj =>
  //           obj.id === response.data.id ? response.data : obj
  //         )
  //       );
  //       setError(null);
  //       setLoad(false);
  //       setShowAddPay(false)
  //       // setPageCount(Math.ceil(response.data.count / inPageCount));
  //     })
  //     .catch(error => {
  //       if (error.response.status === 403) {
  //         navigate('/login');
  //       }
  //       setError(error.message);
  //       setLoad(false);
  //     });
  // };

  // const handleSubmitAdd = async (e) => {
  //   e.preventDefault();
  //   setLoad(true);
  //   let dataToSend = {
  //     formData: formData,
  //   };
  //   axios.post(`/api/contractorsN/addPPContractor`, dataToSend)
  //     .then(response => {
  //       console.log(response.data);
  //       setData([
  //         ...data,
  //         response.data
  //       ]);
  //       setError(null);
  //       setLoad(false);
  //       setShowAddPay(false)
  //       // setPageCount(Math.ceil(response.data.count / inPageCount));
  //     })
  //     .catch(error => {
  //       if (error.response.status === 403) {
  //         navigate('/login');
  //       }
  //       setError(error.message);
  //       setLoad(false);
  //     });
  // };

  useEffect(() => {
    const payload = {
      inPageCount: 100,
      currentPage: 1,
      search: contrAgentSearch,
      columnName: {column: "id", reverse: true},
      startDate: "",
      endDate: "",
    };

    setLoadSearch(true);
    axios
      .post(`/api/users/getUserAdmin`, payload)
      .then((response) => {
        console.log(response.data.rows);
        setFilteredContrAgents(response.data.rows);
        // setPageCount(Math.ceil(response.data.count / inPageCount));
        setError(null);
        setLoadSearch(false);
      })
      .catch(handleAxiosError);
  }, [contrAgentSearch]);

  const handleAxiosError = (error) => {
    if (error.response?.status === 403) navigate("/login");
    setError(error.message);
    setLoad(false);
  };

  useEffect(() => {
    setContrAgentSearch(formData.contractorName);
  }, [formData]);

  useEffect(() => {
    if (showAddPay) {
      setIsVisible(true); // Сначала показываем модальное окно
      setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
    } else {
      setIsAnimating(false); // Начинаем анимацию закрытия
      setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
    }
  }, [showAddPay]);

  return (
    <div>
      <div className="" onClick={handleClose} style={{
        width: "150vw",
        zIndex: "1011",
        height: "150vh",
        background: "rgba(0, 0, 0, 0.2)",
        opacity: isAnimating ? 1 : 0, // для анимации прозрачности
        transition: "opacity 0.3s ease-in-out", // плавная анимация
        position: "fixed",
        // transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
        left: "-10vw",
        bottom: "-10vh"
      }}>
      </div>
      <div style={{
        zIndex: "1011",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        // backgroundColor: '#FBFAF6',
        backgroundColor: '#FAF8F3FF',
        left: "50%",
        top: "50%",
        transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
        opacity: isAnimating ? 1 : 0, // анимация прозрачности
        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out", // плавная анимация
        borderRadius: "1vw",
        width: "50vw",
        // height: "50vh",
        cursor: "auto",
      }}>
        <div className="d-flex">
          <div className="m-auto text-center fontProductName ">
            <h2 className="AddContractorInOrderTitle">USERS</h2>
          </div>
          <div
            className="btn btn-close btn-lg"
            style={{
              margin: "0.5vw",
            }}
            onClick={handleClose}
          >
          </div>
        </div>
        <div style={{
          border: "none",
          borderRadius: "1vw",
          marginTop: "0",
          marginLeft: "0.3vw",
        }}>

          <div style={{padding: "1vw"}}>
            {load && (
              <div className="d-flex justify-content-center align-items-center" style={{height: "100%"}}><Spinner animation="border" className="mainLoader" variant="dark" /></div>
            )}
            {!load && (

              <form className="AddContractorInOrderContainer" onSubmit={handleSubmit}>

                <h3 className="AddContractorInOrderSubtitle">Зaвьязанний USER</h3>

                <div className="AddContractorInOrderFieldGroup">
                  <Form.Group className="mb-3">
                    {/*<Form.Label>Постачальник</Form.Label>*/}
                    <div ref={contrAgentRef} className="position-relative" style={{ position: 'relative' }}>
                      <Form.Control
                        type="text"
                        value={contrAgentSearch}
                        onChange={handleSearchContrAgents}
                        onClick={() => setShowContrAgentDropdown(true)}
                        placeholder="Введіть назву постачальника або виберіть зі списку"
                      />
                      {loadSearch && (
                        <div className="d-flex justify-content-center align-items-center" style={{
                          height: "50%",
                          opacity: '1',
                          position: 'absolute',
                          left: '95%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          marginLeft: "auto"
                        }}>
                          <Spinner animation="border" variant="dark" style={{ width: "1.5vw", height: "1.5vw"}}/>
                        </div>
                      )}
                      {!loadSearch && (
                        <img style={{
                          opacity: '1',
                          position: 'absolute',
                          left: '95%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          width: "1.5vw", height: "1.5vw", marginLeft: "auto"
                        }} src={find} alt="Search Icon" className="Seaechicon"/>
                      )}

                      {showContrAgentDropdown && (
                        <ListGroup
                          className="position-absolute w-100"
                          style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {filteredContrAgents.length > 0 ? (
                            filteredContrAgents.map(contractor => (
                              <ListGroup.Item
                                key={contractor.id}
                                action
                                onClick={() => handleSelectContrAgents(contractor)}
                                style={{ cursor: 'pointer', padding: '8px 12px' }}
                              >
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{contractor.name}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                  <div style={{ marginRight: '8px' }}>ID: {contractor.id}</div>
                                  {contractor.edrpou && <div style={{ marginRight: '8px' }}>ЄДРПОУ: {contractor.edrpou}</div>}
                                  {contractor.taxSystem && <div style={{ marginRight: '8px' }}>Система оподаткування: {contractor.taxSystem}</div>}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                                  {contractor.address && <div style={{ marginRight: '8px' }}>Адреса: {contractor.address}</div>}
                                  {contractor.phone && <div style={{ marginRight: '8px' }}>Тел.: {contractor.phone}</div>}
                                  {contractor.email && <div style={{ marginRight: '8px' }}>Email: {contractor.email}</div>}
                                </div>
                              </ListGroup.Item>
                            ))
                          ) : (
                            <ListGroup.Item>Немає результатів</ListGroup.Item>
                          )}
                        </ListGroup>
                      )}
                    </div>
                  </Form.Group>
                </div>

                {/*{showAddPayView &&*/}
                {/*  <div className="AddContractorInOrderSubmitBlock">*/}
                {/*    <button className="AddContractorInOrderSubmitBtn" onClick={handleSubmitUpdate}>Редагувати</button>*/}
                {/*  </div>*/}
                {/*}*/}
                {/*{!showAddPayView &&*/}
                {/*  <div className="AddContractorInOrderSubmitBlock">*/}
                {/*    <button type="submit" className="AddContractorInOrderSubmitBtn" onClick={handleSubmitAdd}>Додати</button>*/}
                {/*  </div>*/}
                {/*}*/}

                {error && (
                  <div>{error}</div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForUserOrder;
