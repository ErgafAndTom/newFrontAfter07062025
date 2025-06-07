import React, {useEffect, useState} from "react";
import Loader from "../../components/calc/Loader";
import PaginationMy from "../../components/admin/pagination/PaginationMy";
import axios from '../../api/axiosInstance';
import {Table} from "react-bootstrap";
import ModalDeleteInStorage from "./ModalDeleteInStorage";
import ModalStorageRed from "./ModalStorageRed";
import MetaAddNewItemTable from "./MetaAddNewItemTable";
import {useNavigate} from "react-router-dom";

export const TableStorage = ({name}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [inPageCount, setInPageCount] = useState(500);
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
        setLoading(true)
        axios.post(`/materials/all`, data)
            .then(response => {
                console.log(response.data);
                setData(response.data)
                setError(null)
                setLoading(false)
                setPageCount(Math.ceil(response.data.count / inPageCount))
            })
            .catch(error => {
                setError(error.message)
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    }, [typeSelect, name, thisColumn, currentPage, inPageCount]);

    if (data) {
        return (
            <div>
                <MetaAddNewItemTable
                    namem={name}
                    data={data}
                    setData={setData}
                    inPageCount={inPageCount}
                    setInPageCount={setInPageCount}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                    setPageCount={setPageCount}
                />
                <div style={{ maxWidth: '99vw', overflowX: 'auto', overflowY: 'hidden', height: "80vh", background: "transparent" }}>
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
                        <tbody style={{ maxWidth: '99vw', overflowX: 'auto', height: "80vh", background: "transparent" }}>
                        {data.rows.map((item, iter) => (
                            <tr key={item.id} >
                                {data.metadata.map((metaItem, iter2) => (
                                    // <th key={metaItem+iter+iter2} className="adminFontTable">{item[metaItem]}</th>
                                    <th>
                                        <ModalStorageRed key={metaItem+iter+iter2} dataTypeInTable={"string"} tableName={name}
                                                         data={data}
                                                         setData={setData}
                                                         inPageCount={inPageCount}
                                                         setInPageCount={setInPageCount}
                                                         currentPage={currentPage}
                                                         setCurrentPage={setCurrentPage}
                                                         pageCount={pageCount}
                                                         setPageCount={setPageCount} itemData={item[metaItem]} item={item} tablPosition={metaItem}
                                                         thisColumn={metaItem}
                                                         url={`/materials/OnlyOneField`}
                                        />
                                    </th>
                                ))}
                                <ModalDeleteInStorage
                                    dataTypeInTable={"string"} tableName={name}
                                    data={data}
                                    setData={setData}
                                    inPageCount={inPageCount}
                                    setInPageCount={setInPageCount}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    pageCount={pageCount}
                                    setPageCount={setPageCount} itemData={item} item={item} tablPosition={item}
                                />
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
                <div style={{ marginTop: "2vh" }} >
                    <PaginationMy
                        name={name}
                        data={data}
                        setData={setData}
                        inPageCount={inPageCount}
                        setInPageCount={setInPageCount}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageCount={pageCount}
                        setPageCount={setPageCount}
                        typeSelect={typeSelect}
                        thisColumn={thisColumn}
                        url={"/materials/all"}
                    />
                </div>
            </div>
        )
    }

    if(error){
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
}
