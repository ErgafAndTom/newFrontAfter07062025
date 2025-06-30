import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "../../api/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import {Form, ListGroup, Spinner} from "react-bootstrap";
import { FiSearch } from "react-icons/fi";

function CardInfoInputList({ openCardData, setServerData }) {
  const [contrAgentSearch, setContrAgentSearch] = useState('');
  const [showContrAgentDropdown, setShowContrAgentDropdown] = useState(false);
  const [filteredContrAgents, setFilteredContrAgents] = useState([]);
  const [loadSearch, setLoadSearch] = useState(false);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const contrAgentRef = useRef(null);

  // Ініціалізуємо поле пошуку з поточним призначеним користувачем
  useEffect(() => {
    if (openCardData && openCardData.assignedTo) {
      const user = openCardData.assignedTo;
      setContrAgentSearch(`${user.username} ${user.firstName} ${user.lastName} ${user.familyName} ${user.email}`);
    }
  }, [openCardData]);

  // Завантаження списку користувачів при зміні пошукового запиту
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
        setFilteredContrAgents(response.data.rows);
        setError(null);
        setLoadSearch(false);
      })
      .catch(handleAxiosError);
  }, [contrAgentSearch]);

  const handleAxiosError = (error) => {
    if (error.response?.status === 403) navigate("/login");
    setError(error.message);
    setLoadSearch(false);
  };

  const handleSearchContrAgents = (e) => {
    setContrAgentSearch(e.target.value);
    setShowContrAgentDropdown(true);
  };

  const handleSelectContrAgents = async (contractor) => {
    setContrAgentSearch(`${contractor.username} ${contractor.firstName} ${contractor.lastName} ${contractor.familyName} ${contractor.email}`);
    setShowContrAgentDropdown(false);

    // Відразу оновлюємо призначеного користувача
    setLoad(true);
    try {
      const dataToSend = {
        userId: contractor.id,
        cardId: openCardData.id,
      };

      const response = await axios.post(`/trello/updateCardAssignetUser`, dataToSend);

      // Оновлюємо серверні дані
      setServerData(prevLists =>
        prevLists.map(list => ({
          ...list,
          Cards: list.Cards.map(card =>
            card.id === openCardData.id
              ? { ...card, assignedTo: contractor }
              : card
          )
        }))
      );

      setError(null);
    } catch (error) {
      if (error.response?.status === 403) {
        navigate('/login');
      }
      setError(error.message);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div style={{ width: "100%", marginBottom: "1vh" }}>

      <div
        ref={contrAgentRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1vh",
          position: "relative",
        }}
      >
        <h5 style={{ fontSize: "1.1rem", margin: 0, whiteSpace: "nowrap", color: "#333" }}>
          Завдання для
        </h5>

        <div style={{ flexGrow: 1, marginLeft: "1vw", position: "relative" }}>
          <Form.Control
            type="text"
            value={contrAgentSearch}
            onChange={handleSearchContrAgents}
            onClick={() => setShowContrAgentDropdown(true)}
            placeholder="Введіть ім'я або email"
            style={{
              fontSize: "0.9rem",
              padding: "0.5rem 2rem 0.5rem 0.5rem",
              width: "100%",
            }}
          />

          {/* Спінер пошуку */}
          {loadSearch ? (
            <Spinner
              animation="border"
              variant="dark"
              style={{
                position: "absolute",
                top: "50%",
                right: "0.6rem",
                width: "1rem",
                height: "1rem",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          ) : (
            <FiSearch
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                fontSize: '1.2rem',
                color: '#555'
              }}
            />
          )}

          {/* Випадаючий список */}
          {showContrAgentDropdown && (
            <ListGroup
              className="position-absolute w-100"
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                backgroundColor: "white",
                top: "100%",
                marginTop: "0.3rem",
              }}
            >
              {filteredContrAgents.map((contractor) => (
                <ListGroup.Item
                  key={contractor.id}
                  action
                  onClick={() => handleSelectContrAgents(contractor)}
                  style={{ cursor: "pointer", padding: "8px 12px" }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                    {contractor.username} {contractor.firstName} {contractor.lastName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#555" }}>
                    ID: {contractor.id} | Email: {contractor.email}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </div>

      {/* Завантаження або помилка */}
      {load && (
        <div style={{ textAlign: "center", marginTop: "0.5vh" }}>
          <Spinner animation="border" variant="primary" size="sm" />
          <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }}>Оновлення...</span>
        </div>
      )}
      {error && (
        <div style={{ color: "red", fontSize: "0.8rem", marginTop: "0.5vh" }}>{error}</div>
      )}


    </div>
  );
}

export default CardInfoInputList;
