import React, {useState, useEffect} from 'react';
import axios from "../../../api/axiosInstance";
import {Navigate, useNavigate} from "react-router-dom";

const PaginationMy = ({name, data, setData, inPageCount, setInPageCount, currentPage, setCurrentPage, pageCount, setPageCount, typeSelect, url = "admin/gettable", thisColumn}) => {
    const [pag, setPag] = useState([]);
    const navigate = useNavigate();
    const setPageCountF = (value) => {
        setInPageCount(parseInt(value.target.value));

        let dataa = {
            name: name,
            inPageCount: parseInt(value.target.value),
            currentPage: parseInt(currentPage),
            search: typeSelect,
            columnName: thisColumn,
        }
        axios.post(url, dataa)
            .then(response => {
                setData(response.data)
                let pageCountt = Math.ceil(response.data.count / parseInt(value.target.value))
                setPageCount(pageCountt)
                let toPag = [];
                for (let i = currentPage-3; i < currentPage+4; i++){
                    if(i === currentPage-3){
                        if(currentPage === 1){

                        } else {

                        }
                    }
                    if(i === currentPage){
                        toPag.push(i)

                    } else {
                        if(i > 0 && i <= pageCountt){
                            toPag.push(i)
                        }
                    }
                    if(i === currentPage+3){
                        if(currentPage >= pageCountt){

                        } else {

                        }
                    }
                }
                setPag(toPag)
            })
            .catch(error => {
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    };

    useEffect(() => {
        let toPag = [];
        if(pageCount === 1 || pageCount === "1"){
            // pag.push("<")
            if(currentPage === 1){
                toPag.push(1)
            } else {
                toPag.push(1)
            }
            // pag.push(">")
        }
        else {
            for (let i = currentPage-3; i < currentPage+4; i++){
                // console.log(`i sei4as: ${i}`);
                if(i === currentPage-3){
                    if(currentPage === 1){
                        // pag.push("<")
                    } else {
                        // pag.push("<")
                    }
                }
                if(i === currentPage){
                    // console.log(`dobavlena active stranica: ${i}`);
                    toPag.push(i)

                } else {
                    if(i > 0 && i <= pageCount){
                        // console.log(`dobavlena stranica: ${i}`);
                        toPag.push(i)
                    }
                }
                if(i === currentPage+3){
                    if(currentPage >= pageCount){
                        // pag.push(">")
                    } else {
                        // pag.push(">")
                    }
                }
            }
        }
        setPag(toPag)
    }, []);

    const clickFunc = (item) => {
        setCurrentPage(parseInt(item))

        let dataa = {
            name: name,
            inPageCount: inPageCount,
            currentPage: parseInt(item),
            search: typeSelect,
            columnName: thisColumn,
        }
        axios.post(url, dataa)
            .then(response => {
                setData(response.data)
                let pageCountt = Math.ceil(response.data.count / inPageCount)
                setPageCount(pageCountt)
                let toPag = [];
                for (let i = parseInt(item)-3; i < parseInt(item)+4; i++){
                    if(i === parseInt(item)-3){
                        if(parseInt(item) === 1){

                        } else {

                        }
                    }
                    if(i === parseInt(item)){
                        toPag.push(i)

                    } else {
                        if(i > 0 && i <= pageCountt){
                            toPag.push(i)
                        }
                    }
                    if(i === parseInt(item)+3){
                        if(parseInt(item) >= pageCountt){

                        } else {

                        }
                    }
                }
                setPag(toPag)
            })
            .catch(error => {
                if(error.response.status === 403){
                    navigate('/login');
                }
                console.log(error.message);
            })
    }



    return (
        <div className="d-flex adminPagination" >
            <div className="adminFontTable ">
                <select className="paginationZakaz " style={{border: "none", marginLeft:"-0.5vw", marginTop:"0.3vh"}} name="pagination" onChange={(event) => setPageCountF(event)} value={inPageCount}>
                    <option className="adminFontTable" value="1">1</option>
                    <option className="adminFontTable" value="20">20</option>
                    {/*<option className="adminFontTable" value="30">30</option>*/}
                    <option className="adminFontTable" value="50">50</option>
                    <option className="adminFontTable" value="100">100</option>
                    <option className="adminFontTable" value="250">250</option>
                    <option className="adminFontTable" value="500">500</option>
                </select>
            </div>
            <div className="d-flex">
                {pag.map((item) => (
                    <div className={item === currentPage ? "paginationNamberZakaz adminButtonAdd activePag" : "paginationNamberZakaz"} onClick={(e) => clickFunc(item)} key={item} active={item === currentPage}
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        // display: "flex",
                        width: "1.7vw",
                        height: "1.7vw",
                        borderRadius: "1.7vw",
                        // border: "solid 1px #cccabf",
                        fontSize: "var(--font-size-base)",
                        // margin: "0.3vw",
                        cursor: "pointer",
                        minWidth: "1.5vw",
                    }}>
                        {item}
                    </div>
                ))}
            </div>
            {/*{pag.map((item) => (*/}
            {/*    <button onClick={clickFunc} className={item === currentPage ? 'btn btnm adminFontTable pagButton fileActive' : 'btn btnm adminFontTable pagButton'} toclick={item} key={item}>{item}</button>*/}
            {/*))}*/}
        </div>
    );
};

export default PaginationMy;