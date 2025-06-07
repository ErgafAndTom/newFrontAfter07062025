import React, {useEffect, useState} from "react";
import Loader from "../../components/calc/Loader";
// import PaginationMy from "../../pagination/PaginationMy";
import axios from '../../api/axiosInstance';
import {Table} from "react-bootstrap";
import ModalDeleteInStorage from "../Storage/ModalDeleteInStorage";
import ModalStorageRed from "../Storage/ModalStorageRed";
import {Navigate, useNavigate} from "react-router-dom";
// import ModalDeleteInStorage from "./ModalDeleteInStorage";
// import ModalStorageRed from "./ModalStorageRed";
// import MetaAddNewItemTable from "../../MetaAddNewItemTable";

export const UsersTable = ({name}) => {
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const [inPageCount, setInPageCount] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(null);
    const [typeSelect, setTypeSelect] = useState("");
    const [thisColumn, setThisColumn] = useState({
        column: "id",
        reverse: false
    });

    const setCol = (e) => {
        if(thisColumn.column === e){
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

    useEffect(() => {
        let data = {
            name: name,
            inPageCount: inPageCount,
            currentPage: currentPage,
            search: typeSelect,
            columnName: thisColumn,
        }
        axios.get(`/user/all`, data)
            .then(response => {
                console.log(response.data);
                setData(response.data)
                // setPageCount(Math.ceil(response.data.result.count / inPageCount))
            })
            .catch(error => {
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [typeSelect, name, thisColumn, currentPage, inPageCount]);

    if (data) {
        return (
            <div>
                {/*<CrmHeader whoPick={name} data={data} typeSelect={typeSelect} setTypeSelect={setTypeSelect} />*/}
                {/*<div>*/}
                {/*    <Button variant="light" onClick={() => setTypeSelect(!isVisible)} className="adminFont">1</Button>*/}
                {/*    <Button variant="light" onClick={() => setTypeSelect(!isVisible)} className="adminFont">2</Button>*/}
                {/*    <Button variant="light" onClick={() => setTypeSelect(!isVisible)} className="adminFont">3</Button>*/}
                {/*    <Button variant="light" onClick={() => setTypeSelect(!isVisible)} className="adminFont">4</Button>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*    <Form.Control*/}
                {/*        placeholder={"searchForm"}*/}
                {/*        aria-label={"searchForm"}*/}
                {/*        aria-describedby="searchForm"*/}
                {/*        type={"String"}*/}
                {/*        value={typeSelect}*/}
                {/*        className="adminFontTable"*/}
                {/*        onChange={(event) => setTypeSelect(event.target.value)}*/}
                {/*    />*/}
                {/*</div>*/}
                {/*<MetaAddNewItemTable*/}
                {/*    namem={name}*/}
                {/*    data={data}*/}
                {/*    setData={setData}*/}
                {/*    inPageCount={inPageCount}*/}
                {/*    setInPageCount={setInPageCount}*/}
                {/*    currentPage={currentPage}*/}
                {/*    setCurrentPage={setCurrentPage}*/}
                {/*    pageCount={pageCount}*/}
                {/*    setPageCount={setPageCount}*/}
                {/*/>*/}
                <div style={{ maxWidth: '99vw', overflow: 'auto', height: "85vh", background: "#F2F0E7", marginTop: "1vh", borderRadius: "0.5vw" }}>
                    <Table bordered hover variant="" size="sm" >
                        <thead>
                        <tr className="">
                            {data.metadata.map((item) => (
                                <th
                                    style={{background: "#FBFAF6",borderColor:"#FBFAF6" }}
                                    className="adminFontTable"
                                    key={item}
                                    onClick={(event) => setCol(item)}
                                >
                                    {item === thisColumn.column ? (
                                        <>
                                            {!thisColumn.reverse ? (
                                                <>
                                                    ^{item}
                                                </>
                                            ) : (
                                                <>
                                                    !^{item}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {item}
                                        </>
                                    )}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {data.rows.map((item, iter) => (
                            <tr key={item.id} >
                                {data.metadata.map((metaItem, iter2) => (
                                    <th key={metaItem+iter+iter2} className="adminFontTable">
                                        <ModalStorageRed key={metaItem+iter+iter2} dataTypeInTable={"string"} tableName={name}
                                                         data={data}
                                                         setData={setData}
                                                         inPageCount={inPageCount}
                                                         setInPageCount={setInPageCount}
                                                         currentPage={currentPage}
                                                         setCurrentPage={setCurrentPage}
                                                         pageCount={pageCount}
                                                         setPageCount={setPageCount} itemData={item[metaItem]} item={item} tablPosition={metaItem}
                                        />
                                    </th>
                                ))}
                                {/*<ModalDeleteInStorage*/}
                                {/*    dataTypeInTable={"string"} tableName={name}*/}
                                {/*    data={data}*/}
                                {/*    setData={setData}*/}
                                {/*    inPageCount={inPageCount}*/}
                                {/*    setInPageCount={setInPageCount}*/}
                                {/*    currentPage={currentPage}*/}
                                {/*    setCurrentPage={setCurrentPage}*/}
                                {/*    pageCount={pageCount}*/}
                                {/*    setPageCount={setPageCount} itemData={item} item={item} tablPosition={item}*/}
                                {/*/>*/}
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
                <div style={{ marginTop: "2vh" }} >
                    {/*<PaginationMy*/}
                    {/*    name={name}*/}
                    {/*    data={data}*/}
                    {/*    setData={setData}*/}
                    {/*    inPageCount={inPageCount}*/}
                    {/*    setInPageCount={setInPageCount}*/}
                    {/*    currentPage={currentPage}*/}
                    {/*    setCurrentPage={setCurrentPage}*/}
                    {/*    pageCount={pageCount}*/}
                    {/*    setPageCount={setPageCount}*/}
                    {/*    typeSelect={typeSelect}*/}
                    {/*    thisColumn={thisColumn}*/}
                    {/*    url={"/materials/all"}*/}
                    {/*/>*/}
                </div>
            </div>
        )
    }

    return (
        <h1 className="d-flex justify-content-center align-items-center">
            <Loader/>
        </h1>
    )
}
