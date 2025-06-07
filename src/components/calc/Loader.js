import React from "react";
import {Spinner} from "react-bootstrap";

const Loader = () => {
    return (
        <Spinner animation="grow" className="mainLoader" variant="dark" />
    );
};

export default Loader;