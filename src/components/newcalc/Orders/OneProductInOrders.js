import React, {useState} from "react";
import "./OneProductInOrders.css";
import {Accordion} from "react-bootstrap";

function OneProductInOrders({item, thisOrder}) {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div className="unit-list" style={{width: "34.5vw"}}>

            {item.OrderUnitUnits.map((unit, idx) => (
                <div key={unit.idKey} className="unit-item">
                    {/* header row */}
                    <div className="unit-header">
                        <div className="BasePriceWithQuantityDetals">
                            <span className="BasePriceWithQuantityDetals">{idx + 1}. </span>
                            <span className="BasePriceWithQuantityDetals">{unit.name}</span>
                        </div>
                        <div className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center justify-content-end">
                            <span className="">{unit.newField5}<span className="BasePriceWithQuantitySmall">шт</span></span>

                            <span className="">×</span>
                            <span className="">{unit.priceForOneThis}<span className="BasePriceWithQuantitySmall">грн</span></span>

                          <span className="">=</span>
                            <span className="booooold"
                                  style={{
                                      color: "#ef5223",

                                  }}>{unit.priceForAllThis}<span className="BasePriceWithQuantitySmall"   style={{color: "#ef5223",}}>грн</span></span>

                        </div>
                    </div>

                    {/* discounted row */}
                    {/*{["0", "1", "2", "3", "4", "5", "6", "7", "8", "9",].includes(thisOrder.prepayment) && thisOrder.prepayment.includes('%')(*/}
                    {/*{thisOrder.prepayment.includes('%') && !parseFloat(unit.priceForOneThis) === parseFloat(unit.priceForOneThisDiscount) && (*/}
                    {parseFloat(unit.priceForOneThis) !== parseFloat(unit.priceForOneThisDiscount) && (
                        <div className="adminFontTable BasePriceWithQuantityDetals d-flex align-items-center justify-content-end">
                            <span className="">{unit.newField5}<span className="BasePriceWithQuantitySmall">шт</span></span>

                          <span className="">×</span>

                            <span
                                className=""> {parseFloat(unit.priceForOneThisDiscount).toFixed(2)}<span className="BasePriceWithQuantitySmall">грн</span></span>

                            <span className="">=</span>
                            {/*<span*/}
                            {/*    className="booooold" style={{color:"#008249"}}>{parseFloat(unit.priceForAllThisDiscount).toFixed(2)} <span className="BasePriceWithQuantitySmall" style={{color:"#008249"}}>грн</span></span>*/}
                          <span className="booooold"
                                style={{
                                  color: "#008249",

                                }}>{unit.priceForAllThisDiscount}<span className="BasePriceWithQuantitySmall"   style={{color: "#008249",}}>грн</span></span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default OneProductInOrders;
