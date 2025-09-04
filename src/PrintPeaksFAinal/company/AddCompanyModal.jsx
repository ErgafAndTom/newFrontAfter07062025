import React, {useEffect, useRef, useState} from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {Form, ListGroup, Spinner} from "react-bootstrap";
import find from "../../components/find.svg";
import {useSelector} from "react-redux";

function AddCompanyModal({ showAddCompany, setShowAddCompany, formData }) {
  const [load, setLoad] = useState(false);
  const [loadSearch, setLoadSearch] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [contrAgentSearch, setContrAgentSearch] = useState('');
  const [showContrAgentDropdown, setShowContrAgentDropdown] = useState(false);
  const contrAgentRef = useRef(null);
  const [filteredContrAgents, setFilteredContrAgents] = useState([]);

  const handleClose = () => {
    setIsAnimating(false); // Начинаем анимацию закрытия
    setTimeout(() => {
      setIsVisible(false)
      setShowAddCompany(false);
    }, 300); // После завершения анимации скрываем модальное окно
  }

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: type === 'checkbox'
  //       ? (checked ? "true" : "false")
  //       : value,
  //   }));
  // };
  //
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  // };
  //
  // // Обробники вибору контрагента зі списку
  // const handleSelectContrAgents = (contractor) => {
  //   setContrAgentSearch(contractor.name);
  //   setFormData({
  //     ...formData,
  //     contractorId: contractor.id,
  //     contractorName: contractor.name
  //   });
  //   setShowContrAgentDropdown(false);
  // };
  //
  // const handleSearchContrAgents = (e) => {
  //   setContrAgentSearch(e.target.value);
  // };
  //
  // const handleSubmitUpdate = async (e) => {
  //   e.preventDefault();
  //   setLoad(true);
  //   let dataToSend = {
  //     formData: formData,
  //   };
  //   axios.post(`/api/contractorsN/updatePPContractor`, dataToSend)
  //     .then(response => {
  //       // console.log(response.data);
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
  //       // console.log(response.data);
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
      .post(`/api/contractorsN/getContractorsAdmin`, payload)
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

  // useEffect(() => {
  //   setContrAgentSearch(formData.companyName);
  // }, [formData]);

  useEffect(() => {
    if (showAddCompany) {
      setIsVisible(true); // Сначала показываем модальное окно
      setTimeout(() => setIsAnimating(true), 100); // После короткой задержки запускаем анимацию появления
    } else {
      setIsAnimating(false); // Начинаем анимацию закрытия
      setTimeout(() => setIsVisible(false), 300); // После завершения анимации скрываем модальное окно
    }
  }, [showAddCompany]);

  return (
    <div>
      <div className="" onClick={handleClose} style={{
        width: "150vw",
        zIndex: "101",
        height: "150vh",
        background: "rgba(0, 0, 44, 0.2)",
        opacity: isAnimating ? 1 : 0, // для анимации прозрачности
        transition: "opacity 0.3s ease-in-out", // плавная анимация
        position: "fixed",
        // transform: isAnimating ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.8)", // анимация масштаба
        left: "-50vw",
        bottom: "-15vh"
      }}>
      </div>
      <div style={{
        zIndex: "101",
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
        awdawdawd
      </div>
    </div>
  );
}

export default AddCompanyModal;
