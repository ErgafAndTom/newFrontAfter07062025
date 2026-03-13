import React, {useEffect, useState} from "react";
import "./allStyles.css"
import Nav from "./nav/Nav";
import AfterNav from "./calc/AfterNav";
import {useDispatch, useSelector} from "react-redux";
import {Route, Routes} from "react-router-dom";
import Footer from "./footer/Footer";
import Invoices from "../pages/Invoices";
import MockupClientPage from "../PrintPeaksFAinal/mockup/MockupClientPage";

function AllWindow() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const [err, setErr] = useState(null);

    useEffect(() => {
        const handleError = (event) => {
            setErr(event.error);
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
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


                {/* Публічна сторінка макету (без auth) */}
                <Route path="/mockup/:token" element={<MockupClientPage />} />

                <Route path="*" element={(
                    <>
                      {token && <Nav setErr={setErr}/>}
                      <AfterNav setErr={setErr}/>
                      {token && <Footer setErr={setErr}/>}
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
