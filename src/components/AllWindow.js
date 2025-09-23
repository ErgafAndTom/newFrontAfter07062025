import React, {useEffect, useState} from "react";
import "./allStyles.css"
import Nav from "./nav/Nav";
import AfterNav from "./calc/AfterNav";
import {useDispatch} from "react-redux";
import {Route, Routes} from "react-router-dom";
import Footer from "./footer/Footer";
import Invoices from "../pages/Invoices";

function AllWindow() {
    const dispatch = useDispatch();
    const [err, setErr] = useState(null);

    useEffect(() => {
        // Обробка помилок
        window.addEventListener('error', (event) => {
            setErr(event.error);
        });
    }, []);

    return (
        <div>
            <Routes>
                {/*<Route path="/CashFull" element={<CrmCash3Full/>} />*/}
                {/*<Route path="/CashFull/:id" element={<CrmCash3Full/>} />*/}

                {/*<Route path="/CashFull" element={<ClientPip/>} />*/}
                {/*<Route path="/CashFull/:id" element={<NewUIArtem/>} />*/}

                {/*<Route path="/CashFull" element={<WebComponent/>} />*/}
                {/*<Route path="/CashFull" element={<CrmCash3Full/>} />*/}
                {/*<Route path="/CashFull/:id" element={<CPM/>} />*/}

                {/*<Route path="/CashFull" element={<Kassa setErr={setErr}/>} />*/}
                {/*<Route path="/CashFull/:id" element={<Kassa setErr={setErr}/>} />*/}


                <Route path="*" element={(
                    <>
                      <Nav setErr={setErr}/>
                      <AfterNav setErr={setErr}/>
                      <Footer setErr={setErr}/>
                    </>
                )} />
            </Routes>
            {err ? (
                    <div></div>
                // <GTPErrorResponse err={err} setErr={setErr}/>
            ) : (
                <div></div>
            )}
            {/*<PhotoLayoutEditor />*/}
        </div>
    );
}

export default AllWindow;
