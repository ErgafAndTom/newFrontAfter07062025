import React, {useEffect, useState} from 'react';
import '../../Orders/CustomOrderTable.css';
import axios from "../../../api/axiosInstance";
import {Link, NavLink, useNavigate} from "react-router-dom";
import ModalDeleteOrder from "../../Orders/ModalDeleteOrder";
import {useDispatch, useSelector} from "react-redux";
import {FiFile, FiFolder, FiPhone} from 'react-icons/fi';
import {RiCalculatorLine} from 'react-icons/ri';
import TelegramAvatar from "../../Messages/TelegramAvatar";
import {FaTelegramPlane, FaViber} from 'react-icons/fa';
import Pagination from "../../tools/Pagination";
import FiltrOrders from "../../Orders/FiltrOrders";
import {searchChange} from "../../../actions/searchAction";
import Loader from "../../../components/calc/Loader";
import ClientCabinet from "../../userInNewUiArtem/ClientCabinet";
import AddCashModal from "../shifts/AddCashModal";

const Cash = () => {
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
  const [limit, setLimit] = useState(50);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const user = useSelector(state => state.auth.user);
  const [clientCabinetOpen, setClientCabinetOpen] = useState(false);
  const [thisUserIdToCabinet, setThisUserIdToCabinet] = useState(0);

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

  const handleAddCompany = (e) => {
    e.preventDefault();
    setShowAddCompany(true);
  };

  const toggleOrder = (orderId) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };

  const handleOrderClickDelete = (order) => {
    setShowDeleteOrderModal(true);
    setThisOrderForDelete(order);
  };

  async function fetchShift() {
    try {
      setLoading(true);
      const resp = await axios.get("/api/checkbox/cash/current");
      console.log(resp.data.data);
      setData(resp.data.data)
      if (resp.data.success) {
        // setShift(resp.data.shift);
      }
    } catch (e) {
      console.log(e);
      setError(e.response?.data?.error?.message || e.message);
      if (e.message === "Request failed with status code 401"){
        login()
      }
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    try {
      setLoading(true);
      const resp = await axios.post('/api/checkbox/auth/login');
      console.log(resp);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  // async function login() {
  //   try {
  //     setLoading(true);
  //     const resp = await axios.post('/api/checkbox/auth/login');
  //     console.log(resp);
  //     setError(null);
  //   } catch (e) {
  //     setError(e.response?.data?.error || e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // useEffect(() => {
  //   if (currentUser) {
  //     const fetchData = async () => {
  //       try {
  //         const url = '/api/cashRouts/all'
  //         const postData = {
  //           inPageCount: limit,
  //           currentPage: currentPage,
  //           search: search,
  //           columnName: {column: 'id', reverse: true},
  //           startDate: startDate,
  //           endDate: endDate,
  //           statuses: statuses
  //         };
  //
  //
  //         setLoading(true);
  //         const res = await axios.post(url, postData);
  //         console.log(res.data);
  //         setData(res.data);
  //         setLoading(false);
  //       } catch (err) {
  //         if (err.response?.status === 403) navigate('/login');
  //         setError(err.message);
  //         setLoading(false);
  //       }
  //     };
  //
  //     fetchData();
  //   }
  // }, [search, currentPage, limit, currentUser?.role, startDate, endDate, statuses.status0, statuses.status1, statuses.status2, statuses.status3, statuses.status4, statuses.status5,
  // ]);

  useEffect(() => {
    // console.log(document.location.pathname);
    // login()
    fetchShift()
    dispatch(searchChange(""))
  }, [])


  const getStatusColor = (status, isCancelled) => {
    if (isCancelled) return '#ee3c23'; // червоний для скасованих

    switch (parseInt(status)) {
      case 0:
        return '#fbfaf6';       // сірий — оформлення
      case 4:
        return '#008249';       // зелений — друк
      case 1:
        return '#8b4513';       // коричневий — постпрес
      case 2:
        return '#3c60a6';       // синій — готове
      case 3:
        return '#f075aa';       // рожевий — віддали
      default:
        return '#fbfaf6';      // дефолтний
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

  const setThisUserToCabinetFunc = (open, user) => {
    setThisUserIdToCabinet(user.id)
    setClientCabinetOpen(open)
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
        <div className="summary-cell client d-flex justify-content-center adminFont">ID</div>
        <div className="summary-cell client d-flex justify-content-center adminFont">address</div>
        <div className="summary-cell client justify-content-center adminFont">fiscal_number</div>

        <div className="summary-cell settingclient justify-content-center adminFont">number</div>
        <div className="summary-cell settingclient justify-content-center adminFont">offline_mode</div>
        <div className="summary-cell settingclient justify-content-center adminFont">is_test</div>
        <div className="summary-cell client justify-content-center adminFont">created_at</div>
        <div className="summary-cell client justify-content-center adminFont">openedAt</div>
        <div className="summary-cell client justify-content-center adminFont">closedAt</div>
        <div className="summary-cell client justify-content-center adminFont">Зміна</div>

        {/*<div className="summary-cell address" style={{width: "17vw", maxWidth: "17vw"}}>Адреса</div>*/}
        {/*<div className="summary-cell phoneNumber">isTest</div>*/}
        {/*<div className="summary-cell phoneNumber">active</div>*/}
        {/*<div className="summary-cell phoneNumber">shift</div>*/}
        {/*<div className="summary-cell phoneNumber d-flex justify-content-center"><FiPhone size={20}*/}
        {/*                                                                                 style={{color: '#000'}}/></div>*/}
        {/*<div className="summary-cell telegram d-flex justify-content-center">*/}
        {/*  <FaTelegramPlane size={20} style={{color: '#000'}}/>*/}
        {/*</div>*/}
        {/*<div className="summary-cell viber d-flex justify-content-center">*/}
        {/*  <FaViber size={20} style={{ color: '#000' }} />*/}
        {/*</div>*/}
        {/*<div className="summary-cell phoneNumber d-flex justify-content-center">Members(users)</div>*/}
        {/*<div className="summary-cell phoneNumber d-flex justify-content-center">Керування</div>*/}
        {/*<div className="summary-cell documents d-flex justify-content-center">Баланс</div>*/}
        {/*<div className="summary-cell files d-flex justify-content-sm-around ">Файли</div>*/}
        {/*<div className="summary-cell barcode-orders d-flex justify-content-center" style={{opacity: "1"}}>Штрих-код*/}
        {/*</div>*/}
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
        <div className="d-flex" style={{opacity: "0.5", margin: "auto", marginTop: "0.1vw"}}>
          Касси. Знайдено: {data?.count} ({data?.length})
        </div>
      </div>

      {loading &&
        <div className="d-flex justify-content-center align-items-center" style={{height: "100%"}}>
          <h1 className="d-flex justify-content-center align-items-center">
            <Loader/>
          </h1>
        </div>
      }

      {data && data[0]?.results.map(order => {
        const isExpanded = expandedOrderId === order.id;
        // const isCancelled = parseInt(order.status) === 5; // або адаптуй під свою логіку
        // const baseColor = getStatusColor(order.status, isCancelled);
        // const expandedStyle = {
        //   backgroundColor: hexToRgba(baseColor, 0.15)
        // };

        // return (
        //   <div key={order.id} className="OrderBlock">
        //
        //
        //
        //   </div>
        // );


        return (
          <div key={order.id} className="OrderBlock">
            <div className="OrderRow-summary OrderRow-hover"
              // style={expandedStyle}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor =
                     order.status === '0'
                       ? '#fbfaf6'
                       : hexToRgba("#fbfaf6", 0.3);
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = hexToRgba("#fbfaf6", 0.2);
                 }}
                 onClick={() => toggleOrder(order.id)}>

              <div className="summary-cell d-flex client d-flex justify-content-center UsersOrdersLikeTable-contract-text">{order.id}</div>
              <div className="summary-cell d-flex client justify-content-center fontSize1-3VH UsersOrdersLikeTable-contract-text">{order.address || '—'}</div>
              <div className="summary-cell d-flex client justify-content-center UsersOrdersLikeTable-contract-text">{order.fiscal_number || '—'}</div>
              <div className="summary-cell d-flex settingclient justify-content-center UsersOrdersLikeTable-contract-text">{`${order.number}` || '—'}</div>
              <div className="summary-cell d-flex settingclient justify-content-center UsersOrdersLikeTable-contract-text">{`${order.offline_mode}` || '—'}</div>
              <div className="summary-cell d-flex settingclient justify-content-center UsersOrdersLikeTable-contract-text">{`${order.is_test}` || '—'}</div>
              <div className="summary-cell d-flex client justify-content-center UsersOrdersLikeTable-contract-text">{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</div>
              <div className="summary-cell d-flex client justify-content-center UsersOrdersLikeTable-contract-text">{order.openedAt ? new Date(order.openedAt).toLocaleString() : '—'}</div>
              <div className="summary-cell d-flex client justify-content-center UsersOrdersLikeTable-contract-text">{order.closedAt ? new Date(order.closedAt).toLocaleString() : '—'}</div>
              <div className="summary-cell d-flex client justify-content-center UsersOrdersLikeTable-contract-text">{order.shift ? "✅" : '❌'}</div>
              {/*<div className="summary-cell price">*/}
              {/*  {order.allPrice === order.price || order.allPrice === 0 || order.allPrice === "0.00"*/}
              {/*    ? <span style={{color: "red"}}>{order.allPrice}</span>*/}
              {/*    : <span style={{color: "green"}}>{order.allPrice}</span>}&nbsp;грн*/}
              {/*</div>*/}
              {/*<div className="summary-cell client">{order.client?.firstName} {order.client?.lastName}</div>*/}
              {/*<div className="summary-cell company">{order.client?.company || '—'} </div>*/}
              {/*<div className="summary-cell address UsersOrdersLikeTable-contract-text-multiline" style={{width: "17vw", maxWidth: "17vw"}}>*/}
              {/*  <p className="UsersOrdersLikeTable-contract-text" style={{hyphens: "auto", width: "17vw", maxWidth: "17vw"}}>{order.address || '—'}</p>*/}
              {/*</div>*/}
              {/*<div className="summary-cell phoneNumber fontSize1-3VH UsersOrdersLikeTable-contract-text-multiline">{order.client?.phoneNumber || '—'}</div>*/}
              {/*<div className="summary-cell telegram d-flex justify-content-center UsersOrdersLikeTable-contract-text-multiline">*/}
              {/*  {order.client?.telegram*/}
              {/*    ? <TelegramAvatar link={order.client.telegram} size={45} defaultSrc=""/>*/}
              {/*    : '—'}*/}
              {/*</div>*/}

              {/*<div className="summary-cell d-flex phoneNumber justify-content-center">{order.Users?.length}</div>*/}

              {/*<div className="summary-cell viber d-flex justify-content-center">*/}
              {/*  {order.client?.phoneNumber*/}
              {/*    ? <ViberAvatar link={order.client.phoneNumber} size={32} defaultSrc="/viber-icon.png" />*/}
              {/*    : '—'}*/}
              {/*</div>*/}

              {/*<div className="summary-cell phoneNumber d-flex justify-content-center">*/}
              {/*  <Link to={`/Companys/${order.id}`}*/}
              {/*        style={{textDecoration: 'none', outline: 'none'}}>*/}
              {/*    <button className="adminButtonAddOrder"><RiCalculatorLine size={20}/></button>*/}
              {/*  </Link>*/}
              {/*</div>*/}
              {/*<div className="summary-cell documents d-flex justify-content-center">*/}
              {/*  <Link to={`/Companys/${order.id}`}*/}
              {/*        style={{textDecoration: 'none', outline: 'none'}}>*/}
              {/*    <button className="adminButtonAddOrder"><FiFile size={19}/></button>*/}
              {/*  </Link>*/}
              {/*</div>*/}
              {/*<div className="summary-cell files d-flex justify-content-center">*/}
              {/*  <Link to={`/Companys/${order.id}`}*/}
              {/*        style={{textDecoration: 'none', outline: 'none',}}>*/}
              {/*    <button className="adminButtonAddOrder"><FiFolder size={18}/></button>*/}

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
                className="OrderRow-expanded"

              >

                <div className="ExpandedRow-details">
                  <div><strong>Дата створення:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                  <div><strong>Дата
                    оновлення:</strong> {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'}</div>
                  {/*<p><strong>Час початку виготовлення:</strong> {order.manufacturingStartTime ? new Date(order.manufacturingStartTime).toLocaleString() : '—'}</p>*/}
                  {/*<p><strong>Час виготовлення:</strong> {*/}
                  {/*  order.finalManufacturingTime*/}
                  {/*    ? `${order.finalManufacturingTime.days}д ${order.finalManufacturingTime.hours}год ${order.finalManufacturingTime.minutes}хв ${order.finalManufacturingTime.seconds}сек`*/}
                  {/*    : order.manufacturingStartTime ? 'В процесі': ' - '*/}
                  {/*}</p>*/}
                  {/*<p><strong>Дедлайн:</strong> {order.deadline ? new Date(order.deadline).toLocaleString() : '—'}</p>*/}
                  {/*<p><strong>Виконавець:</strong> {order.executor ? `${order.executor.firstName} ${order.executor.lastName}` : '—'}</p>*/}

                  <div
                    className="btn"
                    // style={{fontSize: "0.5vw", height: "0.3vh", background: "red"}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrderClickDelete(order);
                    }}
                  >
                    Видалити
                  </div>
                </div>
                <div>Учасники:</div>
                <div className="OrderRow-units d-flex flex-row">
                  {/*{order.Users.map((unit, i) => (*/}
                  {/*  <div onClick={(e) => setThisUserToCabinetFunc(true, unit)}>*/}
                  {/*    <div key={i} className="OrderUnit-card" style={{width: "20vw"}}>*/}
                  {/*      <TelegramAvatar*/}
                  {/*        link={unit.telegram}*/}
                  {/*        size={60}*/}
                  {/*        // defaultSrc="/default-avatar.png"*/}
                  {/*      />*/}
                  {/*      <div><strong>id:</strong> {unit.id}</div>*/}
                  {/*      <div><strong>username:</strong> {unit.username}</div>*/}
                  {/*      <div><strong>firstName:</strong> {unit.firstName}</div>*/}
                  {/*      <div><strong>lastName:</strong> {unit.lastName}</div>*/}
                  {/*      <div><strong>familyName:</strong> {unit.familyName}</div>*/}
                  {/*      <div><strong>email:</strong> {unit.email}</div>*/}
                  {/*      <div><strong>phoneNumber:</strong> {unit.phoneNumber}</div>*/}
                  {/*      <div><strong>telegram:</strong> {unit.telegram}</div>*/}
                  {/*      <div><strong>discount:</strong> {unit.discount}</div>*/}
                  {/*      <div><strong>address:</strong> {unit.address} грн</div>*/}
                  {/*    </div>*/}
                  {/*  </div>*/}
                  {/*))}*/}
                  {/*{order.Users.length === 0 &&*/}
                  {/*  <div>Немає</div>*/}
                  {/*}*/}
                  {order.shift &&
                    <div className="OrderUnit-card" style={{width: "20vw"}}>
                      {/*<TelegramAvatar*/}
                      {/*  link={unit.telegram}*/}
                      {/*  size={60}*/}
                      {/*  // defaultSrc="/default-avatar.png"*/}
                      {/*/>*/}
                      <div><strong>Shift id:</strong> {order.shift?.id}</div>
                      <div><strong>Shift serial:</strong> {order.shift?.serial}</div>
                      <div><strong>Shift created_at:</strong> {order.shift?.created_at}</div>
                      <div><strong>opened_at:</strong> {order.shift?.opened_at}</div>
                      <div><strong>status:</strong> {order.shift?.status}</div>
                      <div><strong>updated_at:</strong> {order.shift?.updated_at}</div>
                      <div><strong>cashier:</strong>
                        <div><strong>id: {order.shift?.cashier.id}</strong>
                          <div><strong>full_name: {order.shift?.cashier.full_name}</strong>
                            <div><strong>nin: {order.shift?.cashier.nin}</strong>
                              <div><strong>updated_at: {order.shift?.cashier.updated_at}</strong>
                                <div><strong>created_at: {order.shift?.cashier.created_at}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }

                </div>



                {/*<div className="d-flex flex-wrap mt-3" style={{gap:"0.8rem"}}>*/}
                {/*  {order.Users.map(u=>(*/}
                {/*    <div key={u.id} className="p-2" style={{*/}
                {/*      width:"22vw", border:"1px solid #ddd", borderRadius:8, background:"#fbfaf6"*/}
                {/*    }}>*/}
                {/*      <div className="d-flex align-items-center" style={{gap:"0.6rem"}}>*/}
                {/*        <TelegramAvatar link={u.telegram} size={48}/>*/}
                {/*        <div>*/}
                {/*          <div style={{fontWeight:600}}>{u.firstName} {u.familyName}</div>*/}
                {/*          <div style={{fontSize:12, opacity:0.75}}>id: {u.id}</div>*/}
                {/*        </div>*/}
                {/*      </div>*/}
                {/*      <div style={{fontSize:14, marginTop:6}}>*/}
                {/*        {u.phoneNumber || "—"} · {u.email || "—"}*/}
                {/*      </div>*/}
                {/*      <div style={{fontSize:12, opacity:0.8}}>{u.address || " "}</div>*/}
                {/*      <div className="d-flex mt-2" style={{gap:"0.5rem"}}>*/}
                {/*        <Link to={`/Users/${u.id}`} className="adminButtonAddOrder" style={{textDecoration:"none"}}>Профіль</Link>*/}
                {/*        <Link to={`/Orders/create?userId=${u.id}`} className="adminButtonAddOrder" style={{textDecoration:"none"}}>Нове замовлення</Link>*/}
                {/*      </div>*/}
                {/*    </div>*/}
                {/*  ))}*/}
                {/*</div>*/}
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
        url={"/api/cashRouts/all"}
      />
      {showAddCompany &&
        <AddCashModal
          user={user}
          setShowAddCompany={setShowAddCompany}
          showAddCompany={showAddCompany}
        />
      }
      {clientCabinetOpen && thisUserIdToCabinet && (
        <ClientCabinet
          userId={thisUserIdToCabinet}
          onCreateOrder={()=>{}}
          onOpenChat={()=>{}}
          onClose={()=>setClientCabinetOpen(false)}
        />
      )}
      <button
        type="button"
        className="adminButtonAdd"
        style={{marginLeft: "0.3vw"}}
        onClick={handleAddCompany}
      >
        Додати компанію
      </button>
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


export default Cash
