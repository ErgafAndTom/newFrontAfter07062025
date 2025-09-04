import React, {useEffect, useRef, useState} from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {Form, ListGroup, Spinner} from "react-bootstrap";
import find from "../../components/find.svg";
import {useSelector} from "react-redux";

function DropDownList({ showAddPay, setShowAddPay, formData, setFormData, data, setData, showAddPayView, setShowAddPayView, showAddPayWriteId, setShowAddPayWriteId }) {
  const [load, setLoad] = useState(false);
  const [loadSearch, setLoadSearch] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [contrAgentSearch, setContrAgentSearch] = useState('');
  const [showContrAgentDropdown, setShowContrAgentDropdown] = useState(false);
  const contrAgentRef = useRef(null);
  const [filteredContrAgents, setFilteredContrAgents] = useState([]);

  // const handleClose = () => {
  //   setIsAnimating(false); // Начинаем анимацию закрытия
  //   setTimeout(() => {
  //     setIsVisible(false)
  //     setShowAddPay(false);
  //   }, 300); // После завершения анимации скрываем модальное окно
  // }
  //
  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: type === 'checkbox'
  //       ? (checked ? "true" : "false")
  //       : value,
  //   }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  // Обробники вибору контрагента зі списку
  const handleSelectContrAgents = (company) => {
    setContrAgentSearch(company.name);
    setFormData({
      ...formData,
      companyId: company.id,
      companyName: company.name
    });
    setShowContrAgentDropdown(false);
  };

  const handleSearchContrAgents = (e) => {
    setContrAgentSearch(e.target.value);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setLoad(true);
    let dataToSend = {
      formData: formData,
    };
    axios.post(`/api/contractorsN/updatePPContractor`, dataToSend)
      .then(response => {
        // console.log(response.data);
        setData(prevData =>
          prevData.map(obj =>
            obj.id === response.data.id ? response.data : obj
          )
        );
        setError(null);
        setLoad(false);
        setShowAddPay(false)
        // setPageCount(Math.ceil(response.data.count / inPageCount));
      })
      .catch(error => {
        if (error.response.status === 403) {
          navigate('/login');
        }
        setError(error.message);
        setLoad(false);
      });
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoad(true);
    let dataToSend = {
      formData: formData,
    };
    axios.post(`/api/contractorsN/addPPContractor`, dataToSend)
      .then(response => {
        // console.log(response.data);
        setData([
          ...data,
          response.data
        ]);
        setError(null);
        setLoad(false);
        setShowAddPay(false)
        // setPageCount(Math.ceil(response.data.count / inPageCount));
      })
      .catch(error => {
        if (error.response.status === 403) {
          navigate('/login');
        }
        setError(error.message);
        setLoad(false);
      });
  };

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
      .post(`/api/company/getCompanysAdmin`, payload)
      .then((response) => {
        // console.log(response.data.rows);
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
    setContrAgentSearch(formData.companyName);
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
    <Form.Group className="mb-3">
      {/*<Form.Label>Постачальник</Form.Label>*/}
      <div ref={contrAgentRef} className="position-relative" style={{ position: 'relative' }}>
        <Form.Control
          type="text"
          value={contrAgentSearch}
          onChange={handleSearchContrAgents}
          onClick={() => setShowContrAgentDropdown(true)}
          placeholder="Назва компанії"
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
            opacity: '0.5',
            position: 'absolute',
            right: '3px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            width: "1.4vw", height: "1.4vh", marginLeft: "auto"
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
              filteredContrAgents.map(item => (
                <ListGroup.Item
                  key={item.id}
                  action
                  onClick={() => handleSelectContrAgents(item)}
                  style={{ cursor: 'pointer', padding: '8px 12px' }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                    <div style={{ marginRight: '8px' }}>ID: {item.id}</div>
                    {item.edrpou && <div style={{ marginRight: '8px' }}>ЄДРПОУ: {item.edrpou}</div>}
                    {item.taxSystem && <div style={{ marginRight: '8px' }}>Система оподаткування: {item.taxSystem}</div>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '0.75rem', color: '#555' }}>
                    {item.address && <div style={{ marginRight: '8px' }}>Адреса: {item.address}</div>}
                    {item.phone && <div style={{ marginRight: '8px' }}>Тел.: {item.phone}</div>}
                    {item.email && <div style={{ marginRight: '8px' }}>Email: {item.email}</div>}
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
  );
}

export default DropDownList;
