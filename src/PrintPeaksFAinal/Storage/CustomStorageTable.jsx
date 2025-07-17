import React, {useEffect, useState} from 'react';
import '../Orders/CustomOrderTable.css';
import axios from "../../api/axiosInstance";
import StatusBar from "../Orders/StatusBar";
import {Link, redirect, useNavigate} from "react-router-dom";
import PaginationMy from "../../components/admin/pagination/PaginationMy";
import Loader from "../../components/calc/Loader";
import AddNewOrder from "../Orders/AddNewOrder";
import ModalDeleteInStorage from "./ModalDeleteInStorage";
import ModalStorageRed from "./ModalStorageRed";
import NewWide from "../poslugi/newWide";
import OneItemInTable from "./OneUnitInTable";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {da} from "date-fns/locale";
import NewNote from "../poslugi/NewNote";
import {columnTranslations, translateColumnName} from "./translations";
import ModalDeleteOrder from "../Orders/ModalDeleteOrder";


// Основний компонент CustomOrderTable
const CustomStorageTable = ({name}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [thisItemForModal, setThisItemForModal] = useState(null);
  const [thisMetaItemForModal, setThisMetaItemForModal] = useState(null);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [event, setEvent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [inPageCount, setInPageCount] = useState(500);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(null);
  const [typeSelect, setTypeSelect] = useState("");
  const [show, setShow] = useState("");
  const [thisColumn, setThisColumn] = useState({
    column: "id",
    reverse: false
  });
  const [formValues, setFormValues] = useState({});
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [showRed, setShowRed] = useState(false);

  const setCol = (e) => {
    if (thisColumn.column === e) {
      setThisColumn({
        column: e,
        reverse: !thisColumn.reverse
      })
    } else {
      setThisColumn({
        column: e,
        reverse: false
      })
    }
  }

  const handleItemClickRed = (item, event, metaItem) => {
    setShowRed(true)
    setEvent(event)
    setThisItemForModal(item)
    setThisMetaItemForModal(metaItem)
  };

  const handleItemClickDelete2 = (item, event) => {
    setShowDeleteItemModal(true)
    setEvent(event)
    setThisItemForModal(item)
  };

  const handleInputChange = (event, metaItem) => {
    setFormValues(prev => ({...prev, [metaItem]: event.target.value}));
  }

  useEffect(() => {
    if (!showDeleteItemModal) {
      let requestData = {
        inPageCount: inPageCount,
        currentPage: currentPage,
        search: typeSelect,
        columnName: thisColumn
      }
      setLoading(true)
      axios.post(`/materials/All`, requestData)
        .then(response => {
          console.log(response.data);
          setData(response.data)
          setError(null)
          setLoading(false)
          setPageCount(Math.ceil(response.data.count / inPageCount))
        })
        .catch(error => {
          if (error.response && error.response.status === 403) {
            navigate('/login');
          }
          setError(error.message)
          console.log(error.message);
          setLoading(false)
        })
    }
  }, [typeSelect, thisColumn, show, currentPage, inPageCount, navigate, showRed, showDeleteItemModal]);

  useEffect(() => {
    if (data) {
      let newMetadata = data.metadata.filter((t) => t !== "id" && t !== "createdAt" && t !== "updatedAt" && t !== "photo")
      let meta = newMetadata.reduce((acc, cur) => {
        return {...acc, [cur]: ""};
      }, {})
      setFormValues(meta);
    }
  }, [data]);

  const handleClose = () => {
    setShow(false);
  }

  let saveAll = (event, id) => {
    let forData = formValues
    forData.id = 0
    let data = {
      // tableName: namem,
      inPageCount: inPageCount,
      currentPage: currentPage,
      formValues: forData
    }
    console.log(data);
    axios.post(`/materials/`, data)
      .then(response => {
        console.log(response.data);
        setData(response.data)
        setPageCount(Math.ceil(response.data.count / inPageCount))

      })
      .catch(error => {
        console.log(error.message);
      })
  }

  const toggleOrder = (orderId) => {
    if (expandedOrders.includes(orderId)) {
      setExpandedOrders(expandedOrders.filter(id => id !== orderId));
    } else {
      setExpandedOrders([...expandedOrders, orderId]);
    }
  };

  const handleShow = () => setShow(true);


  const handleItemClickCopy = (item, event, metaItem) => {
    // setShow(true)
    setEvent(event)
    setThisItemForModal(item)
    setThisMetaItemForModal(metaItem)
    copyThis(item, event, metaItem)
  };

  let copyThis = (item, event, metaItem) => {
    let data = {
      id: item.id,
      inPageCount: inPageCount,
      currentPage: currentPage,
      search: typeSelect,
      columnName: thisColumn
    }
    console.log(data);
    setError(null)
    // setLoad(true)
    axios.put(`/materials/copy`, data)
      .then(response => {
        console.log(response.data);
        setData(response.data)
        setPageCount(Math.ceil(response.data.count / inPageCount))
        setShowRed(false)
      })
      .catch(error => {
        if (error.response.status === 403) {
          navigate('/login');
        }
        setError(error.message)
        console.log(error.message);
      })
  }

  if (data) {
    return (
      <div className="CustomOrderTable-order-list">

        <div className="CustomOrderTable-header">
          {data.metadata.map((item, iter) => {
            // Визначення ширини для конкретних стовпців
            const getColumnWidth = (columnName) => {
              switch (columnName) {
                case 'id':
                  return '2vw';
                case 'amount':
                  return '3.35vw';
                case 'name':
                  return '13.9vw'; // Фіксована ширина для name в пікселях
                case 'type':
                  return '7vw';  // Фіксована ширина для type в пікселях
                case 'typeUse':
                  return '7vw'; // Фіксована ширина для typeUse в пікселях
                case 'createdAt':
                  return '6vw';
                case 'updatedAt':
                  return '6vw';
                case 'price4':
                  return '3.6vw';
                default:
                  return '3.54vw';     // Фіксована ширина для інших колонок в пікселях
              }
            };
            return (
              <div
                style={{
                  background: "#F2F0E7",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.6rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "auto",
                  minHeight: "1vh",
                  boxSizing: "border-box",
                  textAlign: "center",
                  width: getColumnWidth(item),
                  maxWidth: getColumnWidth(item),
                  minWidth: getColumnWidth(item),
                  overflow: "hidden",
                  whiteSpace: "pre-line", // Додано для підтримки переносів
                  lineHeight: "1.7", // Збільшено для кращої читабельності
                  borderRadius: "0rem",

                }}
                className="CustomOrderTable-header-cell"
                key={item + iter}
                onClick={(event) => setCol(item)}
              >
                {item === thisColumn.column ? (
                  <div style={{
                    display: 'flex',
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    cursor: "pointer",
                    borderRadius: "none",
                    height: "2vh"
                  }}>
                    <span style={{whiteSpace: "pre-line",}}>{translateColumnName(item)}</span>
                    <span style={{
                      color: "#FAB416",
                      fontSize: "1.2rem",
                      position: 'relative',
                      right: "-0.2rem",
                      cursor: "pointer",
                      whiteSpace: "pre-line"
                    }}>
                                            {!thisColumn.reverse ? "↑" : "↓"}
                                        </span>
                  </div>
                ) : (
                  <span style={{whiteSpace: "pre-line",}}>{translateColumnName(item)}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="CustomOrderTable-body "
             style={{
               maxWidth: '99vw',
               height: "82vh",
               // background: "transparent",
               display: "flex",
               flexDirection: "column"
             }}>

          {data.rows.map((item, iter) => (
            <div key={item.id} className="table-row-container">
              <div className="CustomOrderTable-row">
                {data.metadata.map((metaItem, iter2) => (
                  <OneItemInTable
                    key={`${item.id}${item[metaItem]}${iter}${iter2}`}
                    item={item}
                    handleItemClickDelete2={handleItemClickDelete2}
                    metaItem={metaItem}
                    itemData={item[metaItem]}
                    tablPosition={metaItem}
                    handleItemClickRed={handleItemClickRed}
                    handleItemClickCopy={handleItemClickCopy}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="controls-row">
          <div className="pagination-container">
            <PaginationMy
              name={"Order"}
              data={data}
              setData={setData}
              inPageCount={inPageCount}
              setInPageCount={setInPageCount}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageCount={pageCount}
              setPageCount={setPageCount}
              typeSelect={typeSelect}
              url={"/materials/All"}
              thisColumn={thisColumn}
            />
          </div>
          <div className="right-group" style={{display: "flex", alignItems: "center"}}>
            <Button
              className="adminButtonAdd"
              variant="primary"
              onClick={handleShow}
              style={{
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: "400",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease"
              }}
            >
              Додати матеріал
            </Button>
          </div>
        </div>
        {showRed &&
          <ModalStorageRed
            dataTypeInTable={"string"}
            setShowRed={setShowRed}
            showRed={showRed}
            event={event}
            setEvent={setEvent}
            setShowDeleteItemModal={setShowDeleteItemModal}
            showDeleteItemModal={showDeleteItemModal}
            thisItemForModal={thisItemForModal}
            setThisItemForModal={setThisItemForModal}
            tableName={name}
            typeSelect={typeSelect}
            thisColumn={thisColumn}
            data={data}
            thisMetaItemForModal={thisMetaItemForModal}
            setData={setData}
            inPageCount={inPageCount}
            setInPageCount={setInPageCount}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageCount={pageCount}
            setPageCount={setPageCount}
            url={`/materials/OnlyOneField`}
          />
        }
        <ModalDeleteOrder
          thisOrderForDelete={thisItemForModal}
          showDeleteOrderModal={showDeleteItemModal}
          setThisOrderForDelete={setThisItemForModal}
          setShowDeleteOrderModal={setShowDeleteItemModal}
          setData={setData}
          inPageCount={inPageCount}
          setInPageCount={setInPageCount}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageCount={pageCount}
          setPageCount={setPageCount}
          data={data}
          // setData={(newRows) => {
          //   setData(prev => ({...prev, rows: newRows}));
          // }}
          url={`/materials`}
        />


        <Offcanvas show={show} onHide={handleClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Додавання нового матеріалу</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form>
              {/*{Object.keys(formValues).map((metaItem, index) => (*/}
              {/*    <Form.Group key={index} className="">*/}
              {/*        <Form.Label>{translateColumnName(metaItem)}</Form.Label>*/}
              {/*        <Form.Control*/}
              {/*            type="text"*/}
              {/*            placeholder={`Введіть ${translateColumnName(metaItem).toLowerCase()}`}*/}
              {/*            value={formValues[metaItem]}*/}
              {/*            onChange={(e) => handleInputChange(e, metaItem)}*/}
              {/*        />*/}
              {/*    </Form.Group>*/}
              {/*))}*/}
              <Button
                onClick={saveAll}
                variant="primary"
                type="button"
                style={{
                  marginTop: '1rem',
                  width: '100%'
                }}
              >
                Зберегти
              </Button>
              {/*<Button*/}
              {/*    onClick={copyThis}*/}
              {/*    variant="primary"*/}
              {/*    type="button"*/}
              {/*    style={{*/}
              {/*        marginTop: '1rem',*/}
              {/*        width: '100%'*/}
              {/*    }}*/}
              {/*>*/}
              {/*    copyThis*/}
              {/*</Button>*/}
            </Form>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    );
  }

  if (error) {
    return (
      <h1 className="d-flex justify-content-center align-items-center">
        {error}
      </h1>
    )
  }
  return (
    <h1 className="d-flex justify-content-center align-items-center">
      <Loader/>
    </h1>
  )
};

export default CustomStorageTable;
