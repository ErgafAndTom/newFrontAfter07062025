import React from "react";
import big from "./BIGprint/BIG_print_1.svg"
import cup from "./cupprint/cup_print_1.svg"
import color from "./colorprint/color_print_1.svg"
import photo from "./photoprint/photo_print_1.svg"
import post from "./postpress/post_press_1.svg"
import "./MainWindow.css"
import colorA from './colorprint/color_print.json'
import bigA from './BIGprint/big_print.json'
import cupA from './cupprint/cup_print.json'
import photoA from './photoprint/photo_print.json'
import postA from './postpress/post_press.json'
import BodymovinAnimation from "./BodymovinAnimation";
import {useDispatch} from "react-redux";
import {addFileAction} from "../../../actions/fileAction";
import {Link} from "react-router-dom";

const ChooseService = () => {
    const dispatch = useDispatch();
    const addDigital = () => {
        dispatch(addFileAction("digital"));
    }
    const addWide = () => {
        dispatch(addFileAction("wide"));
    }
    const addPhoto = () => {
        dispatch(addFileAction("photo"));
    }
    const addCup = () => {
        dispatch(addFileAction("cup"));
    }
    const addPost = () => {
        dispatch(addFileAction("afterPrint"));
    }

    return (
        <div>
            <div>
                <Link to="/files">
                    <div
                        // onClick={addDigital}
                        className="cursorPointer gif digitalPrintContainer">
                        <BodymovinAnimation animationData={colorA} className="card-img-top anim" />
                        <img src={color} className="card-img-top noanim" alt="..."/>
                    </div>
                </Link>
                <Link to="//Products/Wide">
                    <div
                        // onClick={addWide}
                        className="cursorPointer gif widePrintContainer">
                        <BodymovinAnimation animationData={bigA} className="card-img-top anim" />
                        <img src={big} className="card-img-top noanim" alt="..."/>
                    </div>
                </Link>
                <Link to="/files">
                    <div
                        // onClick={addPhoto}
                        className="cursorPointer gif photoPrintContainer">
                        <BodymovinAnimation animationData={photoA} className="card-img-top anim" />
                        <img src={photo} className="card-img-top noanim" alt="..."/>
                    </div>
                </Link>
                <Link to="/files">
                    <div
                        // onClick={addCup}
                        className="cursorPointer gif cupPrintContainer">
                        <BodymovinAnimation animationData={cupA} className="card-img-top anim" />
                        <img src={cup} className="card-img-top noanim" alt="..."/>
                    </div>
                </Link>
                <Link to="/files">
                    <div
                        // onClick={addPost}
                         className="cursorPointer gif postPrintContainer">
                        <BodymovinAnimation animationData={postA} className="card-img-top anim" />
                        <img src={post} className="card-img-top noanim" alt="..."/>
                    </div>
                </Link>
                {/*<Link to="/react/files">*/}
                {/*    <div onClick={addPost} className="cursorPointer gif postPrintContainer">*/}
                {/*        <BodymovinAnimation aimationData={photoA} className="card-img-top anim" />*/}
                {/*        <img src={post} className="card-img-top noanim" alt="..."/>*/}
                {/*    </div>*/}
                {/*</Link>*/}
            </div>
        </div>
    );
};

export default ChooseService;