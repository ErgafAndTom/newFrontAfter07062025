import React, {useState, useEffect} from "react";
import Loader from "../../calc/Loader";
import PaginationMy from "../pagination/PaginationMy";
import axios from "axios";
import {
    MDBCard,
    MDBCardBody, MDBCardFooter,
    MDBCardHeader,
    MDBCol, MDBContainer,
    MDBRow,
    MDBTable, MDBTableBody,
    MDBTableHead
} from "mdb-react-ui-kit";
import {Form} from "react-bootstrap";

export const TableActions = ({name}) => {
    const [data, setData] = useState(null);
    const [addNew, setAddNew] = useState(false);
    let setAddNewF = () => {
        setAddNew(true)
    }
    const [inPageCount, setInPageCount] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(null);

    //save-adit-----------------------------------------------------------
    const [namee, setNamee] = useState();
    const [type, setType] = useState();
    const [units, setUnits] = useState();
    const [price, setPrice] = useState();
    let setNameeF = (event) => {
        setNamee(event.target.value)
    }
    let setTypeF = (event) => {
        setType(event.target.value)
    }
    let setUnitsF = (event) => {
        setUnits(event.target.value)
    }
    let setPriceF = (event) => {
        setPrice(event.target.value)
    }
    let saveAll = (event) => {
        let data = {
            tableName: name,
            name: namee,
            type: type,
            units: units,
            price: price,
            inPageCount: inPageCount,
            currentPage: currentPage,
        }
        axios.post(`admin/addtotable`, data)
            .then(response => {
                // console.log(response.data);
                setData(response.data)
                setPageCount(Math.ceil(response.data.count / inPageCount))
                setNamee("")
                setType("")
                setUnits("")
                setPrice("")
                setAddNew(false)
            })
            .catch(error => {
                console.log(error.message);
            })
    }
    let closeAll = () => {
        setAddNew(false)
        setNamee("")
        setType("")
        setUnits("")
        setPrice("")
    }
    //--------------------------------------------------------------------


    useEffect(() => {
        let data = {
            name: name,
            inPageCount: inPageCount,
            currentPage: currentPage,
        }
        axios.post(`admin/gettable`, data)
            .then(response => {
                // console.log(response.data);
                setData(response.data)
                setPageCount(Math.ceil(response.data.count / inPageCount))
            })
            .catch(error => {
                console.log(error.message);
            })
    }, []);

    if (data) {
        if (addNew) {
            return (
                <MDBContainer fluid>
                    <MDBRow className='justify-content-center'>
                        <MDBCol md='12'>
                            <section>
                                <MDBCard>
                                    <MDBCardHeader className='py-3'>
                                        <MDBRow>
                                            <MDBCol size='6'>
                                                <li className='text-uppercase small mb-2'>
                                                    <strong>{name} {data.count}</strong>
                                                </li>
                                                <PaginationMy name={name}
                                                              data={data}
                                                              setData={setData}
                                                              inPageCount={inPageCount}
                                                              setInPageCount={setInPageCount}
                                                              currentPage={currentPage}
                                                              setCurrentPage={setCurrentPage}
                                                              pageCount={pageCount}
                                                              setPageCount={setPageCount}
                                                />
                                            </MDBCol>
                                            <MDBCol size='6' className='text-end'>
                                                <button onClick={closeAll} className='btn btnm'>
                                                    close
                                                </button>
                                            </MDBCol>
                                        </MDBRow>
                                    </MDBCardHeader>
                                    <MDBCardBody>
                                        <MDBRow>
                                            <MDBCol md='12' className='mb-3'>
                                                <MDBTable hover>
                                                    <MDBTableHead>
                                                        <tr className="text-bg-light">
                                                            <th>id</th>
                                                            <th>type</th>
                                                            <th>name</th>
                                                            <th>units</th>
                                                            <th>price</th>
                                                            <th></th>
                                                            <th></th>
                                                        </tr>
                                                    </MDBTableHead>
                                                    <MDBTableBody>
                                                        <tr>
                                                            <td></td>
                                                            <td><Form.Control value={namee} className="" type="text" onChange={setNameeF} placeholder="name" /></td>
                                                            <td><Form.Control value={type} className="" type="text" onChange={setTypeF} placeholder="type" /></td>
                                                            <td><Form.Control value={units} className="" type="text" onChange={setUnitsF} placeholder="units" /></td>
                                                            <td><Form.Control value={price} className="" type="text" onChange={setPriceF} placeholder="price" /></td>
                                                            <td>
                                                                <button onClick={saveAll} className="btn btnm btn-success">save</button>
                                                            </td>
                                                            <td>
                                                                <button onClick={closeAll} className="btn btnm btn-danger">close</button>
                                                            </td>
                                                        </tr>
                                                    </MDBTableBody>
                                                </MDBTable>
                                            </MDBCol>
                                        </MDBRow>
                                    </MDBCardBody>
                                </MDBCard>
                            </section>
                        </MDBCol>
                    </MDBRow>
                </MDBContainer>
            )
        }
        return (
            <MDBContainer fluid>
                <MDBRow className='justify-content-center'>
                    <MDBCol md='12'>
                        <section>
                            <MDBCard>
                                <MDBCardHeader className='py-3'>
                                    <MDBRow>
                                        <MDBCol size='6'>
                                            <li className='text-uppercase small mb-2'>
                                                <strong>{name} {data.count}</strong>
                                            </li>
                                            <PaginationMy name={name}
                                                          data={data}
                                                          setData={setData}
                                                          inPageCount={inPageCount}
                                                          setInPageCount={setInPageCount}
                                                          currentPage={currentPage}
                                                          setCurrentPage={setCurrentPage}
                                                          pageCount={pageCount}
                                                          setPageCount={setPageCount}
                                            />
                                        </MDBCol>
                                        <MDBCol size='6' className='text-end'>
                                            <button onClick={setAddNewF} className='btn btnm'>
                                                add new
                                            </button>
                                        </MDBCol>
                                    </MDBRow>
                                </MDBCardHeader>
                                <MDBCardBody>
                                    <MDBRow>
                                        <MDBCol md='12' className='mb-4'>
                                            <MDBTable hover>
                                                <MDBTableHead>
                                                    <tr className="bg-light">
                                                        <th>id</th>
                                                        <th>type</th>
                                                        <th>name</th>
                                                        <th>units</th>
                                                        <th>price</th>
                                                        <th></th>
                                                        <th></th>
                                                    </tr>
                                                </MDBTableHead>
                                                <MDBTableBody>
                                                    {data.rows.map((item) => (
                                                        <tr key={item.id}>
                                                            <td>{item.id}</td>
                                                            <td>{item.type}</td>
                                                            <td>{item.name}</td>
                                                            <td>{item.units}</td>
                                                            <td>{item.price}</td>
                                                            <td>
                                                                <button className="btnm bg-info">edit</button>
                                                            </td>
                                                            <td>
                                                                <button className="btnm bg-danger">delete</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </MDBTableBody>
                                            </MDBTable>
                                        </MDBCol>
                                    </MDBRow>
                                </MDBCardBody>
                            </MDBCard>
                        </section>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        )
    }

    return (
        <h1 className="d-flex justify-content-center align-items-center">
            {/*{name}*/}
            <Loader/>
        </h1>
    )
}
