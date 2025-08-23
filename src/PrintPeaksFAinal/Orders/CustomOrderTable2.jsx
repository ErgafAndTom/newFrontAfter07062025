import React, { useEffect, useState } from 'react';
import './CustomOrderTable.css';
import axios from "../../api/axiosInstance";
import StatusBar from "./StatusBar";
import { Link, useNavigate } from "react-router-dom";
import ModalDeleteOrder from "./ModalDeleteOrder";
import { Spinner } from "react-bootstrap";
import Barcode from 'react-barcode';
import { useSelector } from "react-redux";
import status from "./StatusBar";
import { FiFile, FiFolder, FiPhone} from 'react-icons/fi';
import { RiCalculatorLine } from 'react-icons/ri';
import TelegramAvatar from "../Messages/TelegramAvatar";
import ViberAvatar from "../Messages/ViberAvatar";
import { FiPhoneCall } from 'react-icons/fi';
import {FaTelegramPlane, FaViber} from 'react-icons/fa';
import Pagination from "../tools/Pagination";
import Vishichka from "../poslugi/Vishichka";
import FiltrOrders from "./FiltrOrders";



const CustomOrderTable2 = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeBarcodeId, setActiveBarcodeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [limit, setLimit] = useState(50);

  const [typeSelect, setTypeSelect] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statuses, setStatuses] = useState({
    status0: true,
    status1: true,
    status2: true,
    status3: true,
    status4: true,
    status5: true
  });

  const toggleOrder = (orderId) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };

  const handleOrderClickDelete = (order) => {
    setShowDeleteOrderModal(true);
    setThisOrderForDelete(order);
  };

  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        try {
          const url = currentUser.role === 'admin' || currentUser.role === 'operator' ? '/orders/all' : '/orders/my';
          // const postData = {
          //   inPageCount: limit,
          //   currentPage: currentPage,
          //   search: '',
          //   columnName: {column: 'id', reverse: true},
          //   startDate: '',
          //   endDate: '',
          //   statuses: {
          //     status0: true,
          //     status1: true,
          //     status2: true,
          //     status3: true,
          //     status4: true,
          //     status5: true,
          //   }
          // };
          const postData = {
            inPageCount: limit,
            currentPage: currentPage,
            search: '',
            columnName: {column: 'id', reverse: true},
            startDate: startDate,
            endDate: endDate,
            statuses: statuses
          };


          setLoading(true);
          const res = await axios.post(url, postData);
          setData(res.data);
          setLoading(false);
        } catch (err) {
          if (err.response?.status === 403) navigate('/login');
          setError(err.message);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [currentPage, limit, currentUser?.role, startDate, endDate, statuses.status0, statuses.status1, statuses.status2, statuses.status3, statuses.status4, statuses.status5,
  ]);


  const getStatusColor = (status, isCancelled) => {
    if (isCancelled) return '#ee3c23'; // червоний для скасованих

    switch (parseInt(status)) {
      case 0: return '#fbfaf6';       // сірий — оформлення
      case 4: return '#008249';       // зелений — друк
      case 1: return '#8b4513';       // коричневий — постпрес
      case 2: return '#3c60a6';       // синій — готове
      case 3: return '#f075aa';       // рожевий — віддали
      default: return '#fbfaf6';      // дефолтний
    }
  };

  const hexToRgba = (hex, alpha) => {
    const parsed = hex.replace('#', '');
    const bigint = parseInt(parsed, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // if (loading) {
  //   return <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
  //     <Spinner animation="border" variant="dark" />
  //   </div>;
  // }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <div className="OrderList">
      <div className="OrderRow-summary OrderRow-header">
        <div className="summary-cell id d-flex justify-content-center">ID</div>
        <div className="summary-cell status d-flex justify-content-center">Статус</div>
        <div className="summary-cell pay">Оплата</div>
        <div className="summary-cell price">Ціна</div>
        <div className="summary-cell client">Клієнт</div>
        <div className="summary-cell company">Компанія</div>
        <div className="summary-cell phoneNumber d-flex justify-content-center"><FiPhone size={20} style={{ color: '#000' }}/></div>
        <div className="summary-cell telegram d-flex justify-content-center">
          <FaTelegramPlane size={20} style={{ color: '#000' }} />
        </div>
        {/*<div className="summary-cell viber d-flex justify-content-center">*/}
        {/*  <FaViber size={20} style={{ color: '#000' }} />*/}
        {/*</div>*/}


        <div className="summary-cell action d-flex justify-content-center">Прорахунок</div>
        <div className="summary-cell documents d-flex justify-content-center">Документи</div>
        <div className="summary-cell files d-flex justify-content-sm-around ">Файли</div>
        <div className="summary-cell barcode-orders d-flex justify-content-center" style={{opacity:"1"}}>Штрих-код</div>
      </div>
      {/* data rows */}

      <FiltrOrders
        typeSelect={typeSelect}
        setTypeSelect={setTypeSelect}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        statuses={statuses}
        setStatuses={setStatuses}
      />

      {data?.rows.map(order => {
        const isExpanded = expandedOrderId === order.id;
        const isCancelled = parseInt(order.status) === 5; // або адаптуй під свою логіку
        const baseColor = getStatusColor(order.status, isCancelled);
        const expandedStyle = {
          backgroundColor: hexToRgba(baseColor, 0.15)
        };


        return (
          <div key={order.id} className="OrderBlock">
            <div className="OrderRow-summary OrderRow-hover"
                 style={expandedStyle}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor =
                     order.status === '0'
                       ? '#fbfaf6'
                       : hexToRgba(baseColor, 0.3);                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = hexToRgba(baseColor, 0.2);
                 }}
                 onClick={() => toggleOrder(order.id)}>

              <div className="summary-cell id  d-flex justify-content-center">{order.id}</div>
              <div className="summary-cell status "><StatusBar item={order} style={{borderRadius:"none"}}/></div>
              {order.Payment?.status === 'CREATED' &&
                <div className={`adminButtonAddOrder wait`} style={{}}>
                  {"Очікування️"}
                </div>
              }
              {order.Payment?.status === 'PAID' &&
                <div className={`adminButtonAddOrder pay`} style={{}}>
                  {"Оплата за посиланням"}
                </div>
              }
              {order.Payment?.status === 'CANCELLED' &&
                <button className={`adminButtonAddOrder cancel`} style={{}}>
                  {"Відміна"}
                </button>
              }
              {order.Payment?.status === 'EXPIRED' &&
                <button className={`adminButtonAddOrder nopay`} style={{}}>
                  -
                </button>
              }
              {order.Payment === null &&
                <button className={`adminButtonAddOrder nopay`} style={{color:'#000000'}}>
                  {"-"}
                </button>
              }
              <div className="summary-cell price">
                {order.allPrice === order.price || order.allPrice === 0 || order.allPrice === "0.00"
                  ? <span style={{color: "red"}}>{order.price}</span>
                  : <span style={{color: "green"}}>{order.allPrice}</span>}&nbsp;грн
              </div>
              <div className="summary-cell client">{order.client?.firstName} {order.client?.lastName}</div>
              <div className="summary-cell company">{order.client?.company || '—'} </div>
              <div className="summary-cell phoneNumber">{order.client?.phoneNumber || '—'}</div>
              <div className="summary-cell telegram d-flex justify-content-center">
                {order.client?.telegram
                  ? <TelegramAvatar link={order.client.telegram} size={45} defaultSrc="" />
                  : '—'}
              </div>

              {/*<div className="summary-cell viber d-flex justify-content-center">*/}
              {/*  {order.client?.phoneNumber*/}
              {/*    ? <ViberAvatar link={order.client.phoneNumber} size={32} defaultSrc="/viber-icon.png" />*/}
              {/*    : '—'}*/}
              {/*</div>*/}

              <div className="summary-cell action d-flex justify-content-center">
                <Link to={`/Orders/${order.id}`}
                      style={{ textDecoration: 'none', outline: 'none' }}>
                  <button className="adminButtonAddOrder" > <RiCalculatorLine size={20} /></button>
                </Link>
              </div>
              <div className="summary-cell documents d-flex justify-content-center">
                <Link to={`/Orders/${order.id}`}
                      style={{ textDecoration: 'none', outline: 'none' }}>
                  <button className="adminButtonAddOrder" ><FiFile size={19} /></button>
                </Link>
              </div>
              <div className="summary-cell files d-flex justify-content-center">
                <Link to={`/Orders/${order.id}`}
                      style={{ textDecoration: 'none', outline: 'none',  }}>
                  <button className="adminButtonAddOrder"> <FiFolder size={18} /></button>

                </Link>
              </div>

              <div
                className={`summary-cell barcode-orders ${
                  activeBarcodeId === order.id ? 'active' : ''
                }`}
                onClick={e => {
                  e.stopPropagation();
                  setActiveBarcodeId(prev =>
                    prev === order.id ? null : order.id
                  );
                }}
              >
                {order.barcode ? (
                  <Barcode
                    value={order.barcode.toString()}
                    width={1.1}
                    height={34}
                    background={'transparent'}
                    fontSize={14}
                    displayValue={false}
                  />
                ) : '—'}
              </div>
            </div>

            {isExpanded && (
              <div
                className="OrderRow-expanded pastel-panel"

              >

              <div className="ExpandedRow-details">
                  <p><strong>Дата створення:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Дата оновлення:</strong> {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'}</p>
                  <p><strong>Час початку виготовлення:</strong> {order.manufacturingStartTime ? new Date(order.manufacturingStartTime).toLocaleString() : '—'}</p>
                  <p><strong>Час виготовлення:</strong> {
                    order.finalManufacturingTime
                      ? `${order.finalManufacturingTime.days}д ${order.finalManufacturingTime.hours}год ${order.finalManufacturingTime.minutes}хв ${order.finalManufacturingTime.seconds}сек`
                      : order.manufacturingStartTime ? 'В процесі' : '—'
                  }</p>
                  <p><strong>Дедлайн:</strong> {order.deadline ? new Date(order.deadline).toLocaleString() : '—'}</p>
                  <p><strong>Виконавець:</strong> {order.executor ? `${order.executor.firstName} ${order.executor.lastName}` : '—'}</p>

                  <button
                    className="btn pastel-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrderClickDelete(order);
                    }}
                  >
                    Видалити
                  </button>
                </div>

                <div className="OrderRow-units d-flex flex-row">
                  {order.OrderUnits.map((unit, i) => (
                    <div key={i} className="OrderUnit-card">
                      <div><strong>Назва:</strong> {unit.name}</div>
                      <div><strong>Кількість:</strong> {unit.newField5}</div>
                      <div><strong>Ціна:</strong> {unit.priceForThis} грн</div>
                      <div><strong>Розмір:</strong> {unit.newField2} x {unit.newField3} мм</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <ModalDeleteOrder
        showDeleteOrderModal={showDeleteOrderModal}
        setShowDeleteOrderModal={setShowDeleteOrderModal}
        thisOrderForDelete={thisOrderForDelete}
        setThisOrderForDelete={setThisOrderForDelete}
        data={data}
        setData={setData}
        url={"/orders/OneOrder"}
      />
      {data?.count > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.count / limit)}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
          limit={limit}
        />
      )}
    </div>
  );
};

export default CustomOrderTable2;
