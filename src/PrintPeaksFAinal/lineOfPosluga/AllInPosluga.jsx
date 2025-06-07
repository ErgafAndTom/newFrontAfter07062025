import React, { useState } from 'react';
import ButtonE from "./ButtonE";
import ButtonS from "../poslugi/newnomodals/ButtonImgArtem1";
import borderRadiusIcon0 from '../public/borderradius.svg';
import borderRadiusIcon1 from '../public/borderradius1.svg';
import borderRadiusIcon2 from '../public/borderradius2.svg';
import borderRadiusIcon3 from '../public/borderradius3.svg';
import borderRadiusIcon4 from '../public/borderradius4.svg';
import borderRadiusIcon5 from '../public/borderradius5.svg';
import borderRadiusIcon6 from '../public/borderradius6.svg';
import borderRadiusIcon7 from '../public/borderradius7.svg';
import borderRadiusIcon8 from '../public/borderradius8.svg';
import borderRadiusIcon9 from '../public/borderradius9.svg';
import ButtonText from "../poslugi/newnomodals/ButtonTextArtem";

import holes1 from '../public/-127.svg';
import ButtonDominos from "./ButtonDominos";

const iconArray = [
    borderRadiusIcon0,
    borderRadiusIcon1,
    borderRadiusIcon2,
    borderRadiusIcon3,
    borderRadiusIcon4,
    borderRadiusIcon5,
    borderRadiusIcon6,
    borderRadiusIcon7,
    borderRadiusIcon8,
    borderRadiusIcon9,
];
const iconArray2 = [
    holes1,
    borderRadiusIcon1,
    borderRadiusIcon2,
    borderRadiusIcon3,
    borderRadiusIcon4,
    borderRadiusIcon5,
    borderRadiusIcon6,
    borderRadiusIcon7,
    borderRadiusIcon8,
    borderRadiusIcon9,
];

const AllInPosluga = ({nameOfX, buttonsArr, selectArr}) => {

    return (
        <div className="d-flex" style={{transform: "scale(0.6)"}}>
            {nameOfX === "Скруглення кутів:" ? (
                <div className="d-flex">
                    <ButtonE nameOfX={nameOfX} buttonsArr={buttonsArr} selectArr={selectArr}/>
                    <ButtonS nameOfX={nameOfX} buttonsArr={iconArray}/>
                </div>
            ) : (
                <div className="d-flex">
                    <ButtonE nameOfX={nameOfX} buttonsArr={buttonsArr} selectArr={selectArr}/>
                    <ButtonText nameOfX={nameOfX} buttonsArr={buttonsArr}/>
                </div>
            )}
        </div>
    );
};

export default AllInPosluga;