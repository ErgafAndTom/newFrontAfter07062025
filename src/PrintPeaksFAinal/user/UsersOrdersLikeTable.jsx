import React, { useEffect, useState } from 'react';
import '../Orders/CustomOrderTable.css';
import axios from "../../api/axiosInstance";
import StatusBar from "../Orders/StatusBar";
import { Link, useNavigate } from "react-router-dom";
import ModalDeleteOrder from "../Orders/ModalDeleteOrder";
import { Spinner } from "react-bootstrap";
import Barcode from 'react-barcode';
import {useDispatch, useSelector} from "react-redux";
import { FiFile, FiFolder, FiPhone} from 'react-icons/fi';
import { RiCalculatorLine } from 'react-icons/ri';
import TelegramAvatar from "../Messages/TelegramAvatar";
import ViberAvatar from "../Messages/ViberAvatar";
import { FiPhoneCall } from 'react-icons/fi';
import {FaTelegramPlane, FaViber} from 'react-icons/fa';
import Pagination from "../tools/Pagination";
import Vishichka from "../poslugi/Vishichka";
import FiltrOrders from "../Orders/FiltrOrders";
import {searchChange} from "../../actions/searchAction";
import Loader from "../../components/calc/Loader";



const UsersOrdersLikeTable = () => {
  const [data, setData] = useState(null);
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeBarcodeId, setActiveBarcodeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const currentUser = useSelector((state) => state.auth.user);
  const search = useSelector((state) => state.search.search);
  const navigate = useNavigate();
  const [limit, setLimit] = useState(100);

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
          const url = '/api/user/all'
          const postData = {
            inPageCount: limit,
            currentPage: currentPage,
            search: search,
            columnName: {column: 'id', reverse: true},
            startDate: startDate,
            endDate: endDate,
            statuses: statuses
          };


          setLoading(true);
          const res = await axios.post(url, postData);
          console.log(res.data);
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
  }, [search, currentPage, limit, currentUser?.role, startDate, endDate, statuses.status0, statuses.status1, statuses.status2, statuses.status3, statuses.status4, statuses.status5,
  ]);

  useEffect(() => {
    // console.log(document.location.pathname);
    dispatch(searchChange(""))
  }, [])


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
        <div className="summary-cell phoneNumber d-flex justify-content-center">username</div>
        <div className="summary-cell phoneNumber">email</div>
        <div className="summary-cell phoneNumber">address</div>
        <div className="summary-cell phoneNumber">company</div>
        <div className="summary-cell phoneNumber">discount</div>
        <div className="summary-cell phoneNumber">contragents</div>
        <div className="summary-cell phoneNumber">Заказів</div>
        <div className="summary-cell phoneNumber d-flex justify-content-center"><FiPhone size={20} style={{ color: '#000' }}/></div>
        <div className="summary-cell telegram d-flex justify-content-center">
          <FaTelegramPlane size={20} style={{ color: '#000' }} />
        </div>
        {/*<div className="summary-cell viber d-flex justify-content-center">*/}
        {/*  <FaViber size={20} style={{ color: '#000' }} />*/}
        {/*</div>*/}


        <div className="summary-cell phoneNumber d-flex justify-content-center">Детально</div>
        {/*<div className="summary-cell documents d-flex justify-content-center">Документи</div>*/}
        {/*<div className="summary-cell files d-flex justify-content-sm-around ">Файли</div>*/}
        {/*<div className="summary-cell barcode-orders d-flex justify-content-center" style={{opacity:"1"}}>Штрих-код</div>*/}
      </div>
      {/* data rows */}

      <div className="d-flex">
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
        <div className="d-flex" style={{opacity: "0.5", margin: "auto", marginTop: "0.1vw"}}>Знайдено ({data?.count})</div>
      </div>

      {loading &&
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
          <h1 className="d-flex justify-content-center align-items-center">
            <Loader/>
          </h1>
        </div>
      }
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

              <div className="summary-cell id d-flex justify-content-center">{order.id}</div>
              <div className="summary-cell phoneNumber d-flex justify-content-center UsersOrdersLikeTable-contract-text-multiline" style={{width: "10vw", maxWidth: "10vw"}}>
                <div className=" d-flex flex-column UsersOrdersLikeTable-contract-text">
                  {/*<div className="UsersOrdersLikeTable-contract-text">[{order.username || '—'}]</div>*/}
                  <div className="d-flex">
                    <div className="UsersOrdersLikeTable-contract-text">{order.firstName || '—'}</div>
                    <div className="UsersOrdersLikeTable-contract-text">{order.lastName || '—'}</div>
                    <div className="UsersOrdersLikeTable-contract-text">{order.familyName || '—'}</div>
                  </div>
                </div>
              </div>
              <div className="summary-cell phoneNumber d-flex justify-content-center UsersOrdersLikeTable-contract-text">{order.email || '—'}</div>
              <div className="summary-cell phoneNumber UsersOrdersLikeTable-contract-text-multiline UsersOrdersLikeTable-contract-text">
                {order.address || '—'}
              </div>
              <div className="summary-cell phoneNumber d-flex justify-content-center UsersOrdersLikeTable-contract-text-multiline">
                {order.Company
                  ? <div className="UsersOrdersLikeTable-contract-text-multiline">
                    <div className="UsersOrdersLikeTable-contract-text" style={{fontSize: "0.7vw"}}>{order.Company.companyName || 'noName'}</div>
                    {/*<div className="UsersOrdersLikeTable-contract-text" style={{fontSize: "0.7vw"}}>{order.Company.address || 'noAddress'}</div>*/}
                    {/*<div className="UsersOrdersLikeTable-contract-text" style={{fontSize: "0.7vw"}}>{order.Company.edrpou || 'noEdrpou'}</div>*/}
                  </div>
                  : '—'}
              </div>
              <div className="summary-cell phoneNumber fontSize1-3VH">{order.discount || '—'}</div>
              <div className="summary-cell phoneNumber d-flex justify-content-center UsersOrdersLikeTable-contract-text-multiline">
                {order.Contractors.length > 0
                  ? <div className="UsersOrdersLikeTable-contract-text-multiline">
                      {order.Contractors.map((contr, iter) => {
                        return (
                          <div className="d-flex">
                            <div className="UsersOrdersLikeTable-contract-text fw-bold" style={{marginRight: "0.1vw"}}>{iter+1}) </div>
                            <div className="UsersOrdersLikeTable-contract-text">{contr.name || 'noName'}</div>
                            {/*<div style={{fontSize: "0.9vh"}}>{contr.address || 'noAddress'}</div>*/}
                            {/*<div style={{fontSize: "0.8vh"}}>{contr.edrpou || 'noEdrpou'}</div>*/}
                          </div>
                        )
                      })}
                    </div>
                  : '—'}
              </div>
              <div className="summary-cell phoneNumber fontSize1-3VH">{order.Orders?.length || '—'}</div>
              <div className="summary-cell phoneNumber fontSize1-3VH">{
                <div>
                  {order.phoneNumber}
                  {/*{order.phoneNumber && (*/}
                  {/*  <ViberAvatar link={order.phoneNumber} size={64}/>*/}
                  {/*)}*/}
                </div> || '—'}</div>
              <div className="summary-cell telegram d-flex justify-content-center">
                {order.telegram
                  ? <TelegramAvatar link={order.telegram} size={45} defaultSrc="" />
                  : '—'}
                {/*<TelegramAvatar link={order.telegram} size={45} defaultSrc="" />*/}
              </div>

              {/*<div className="summary-cell viber d-flex justify-content-center">*/}
              {/*  {order.client?.phoneNumber*/}
              {/*    ? <ViberAvatar link={order.client.phoneNumber} size={32} defaultSrc="/viber-icon.png" />*/}
              {/*    : '—'}*/}
              {/*</div>*/}

              <div className="summary-cell phoneNumber d-flex justify-content-center">
                <Link to={`/Users/${order.id}`}
                      style={{ textDecoration: 'none', outline: 'none' }}>
                  <button className="adminButtonAddOrder" > <RiCalculatorLine size={20} /></button>
                </Link>
              </div>
              {/*<div className="summary-cell documents d-flex justify-content-center">*/}
              {/*  <Link to={`/Orders/${order.id}`}*/}
              {/*        style={{ textDecoration: 'none', outline: 'none' }}>*/}
              {/*    <button className="adminButtonAddOrder" ><FiFile size={19} /></button>*/}
              {/*  </Link>*/}
              {/*</div>*/}
              {/*<div className="summary-cell files d-flex justify-content-center">*/}
              {/*  <Link to={`/Orders/${order.id}`}*/}
              {/*        style={{ textDecoration: 'none', outline: 'none',  }}>*/}
              {/*    <button className="adminButtonAddOrder"> <FiFolder size={18} /></button>*/}

              {/*  </Link>*/}
              {/*</div>*/}

              {/*<div*/}
              {/*  className={`summary-cell barcode-orders ${*/}
              {/*    activeBarcodeId === order.id ? 'active' : ''*/}
              {/*  }`}*/}
              {/*  onClick={e => {*/}
              {/*    e.stopPropagation();*/}
              {/*    setActiveBarcodeId(prev =>*/}
              {/*      prev === order.id ? null : order.id*/}
              {/*    );*/}
              {/*  }}*/}
              {/*>*/}
              {/*  {order.barcode ? (*/}
              {/*    <Barcode*/}
              {/*      value={order.barcode.toString()}*/}
              {/*      width={1.1}*/}
              {/*      height={34}*/}
              {/*      background={'transparent'}*/}
              {/*      fontSize={14}*/}
              {/*      displayValue={false}*/}
              {/*    />*/}
              {/*  ) : '—'}*/}
              {/*</div>*/}
            </div>

            {isExpanded && (
              <div
                className="OrderRow-expanded pastel-panel"

              >

                <div className="ExpandedRow-details">
                  <p><strong>Дата створення:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Дата оновлення:</strong> {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'}</p>

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
                <div className="d-flex">Контрагенти:
                  {order.Contractors.length < 1 &&
                    <p style={{marginLeft: "0.1vw"}}>Немає</p>
                  }
                </div>
                <div className="OrderRow-units d-flex flex-row">
                  {order.Contractors?.map((unit, i) => (
                    <div key={i} className="OrderUnit-card">
                      <div className="UsersOrdersLikeTable-contract-text"><strong>id:</strong>{unit.name}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>Назва:</strong> {unit.name}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>тип:</strong> {unit.type}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>Адреса:</strong> {unit.address}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>Банк:</strong> {unit.bankName}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>iban:</strong> {unit.iban}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>edrpou:</strong> {unit.edrpou}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>email:</strong> {unit.email}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>phone:</strong> {unit.phone}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>taxSystem:</strong> {unit.taxSystem}</div>
                      <div className="UsersOrdersLikeTable-contract-text"><strong>pdv:</strong> {unit.pdv}</div>
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

export default UsersOrdersLikeTable;
