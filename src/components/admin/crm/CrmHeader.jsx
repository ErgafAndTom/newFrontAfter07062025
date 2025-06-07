import React from 'react';
import {Container, Navbar, Nav, NavDropdown, Button, Modal} from 'react-bootstrap';
import Form from "react-bootstrap/Form";
import Loader2 from "../../calc/Loader2";
// import GPTAneki from "../GPTAneki";

const CrmHeader = ({whoPick, data, typeSelect, setTypeSelect}) => {
    return (
        <Navbar expand="sm" className="bg-body-tertiary" style={{border: "solid 1px #cccabf", height: "5vh"}}>
            <Container fluid>
                <Navbar.Brand href="#">{whoPick} {data.count}</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav
                        className="me-auto my-2 my-lg-0"
                        style={{ maxHeight: '4vh' }}
                        navbarScroll
                    >
                        {/*<Nav.Link href="#action1">Home</Nav.Link>*/}
                        {/*<Nav.Link href="#action2">Link</Nav.Link>*/}
                        {/*<NavDropdown title="Link" id="navbarScrollingDropdown">*/}
                        {/*    <NavDropdown.Item href="#action3">Action</NavDropdown.Item>*/}
                        {/*    <NavDropdown.Item href="#action4">*/}
                        {/*        Another action*/}
                        {/*    </NavDropdown.Item>*/}
                        {/*    <NavDropdown.Divider />*/}
                        {/*    <NavDropdown.Item href="#action5">*/}
                        {/*        Something else here*/}
                        {/*    </NavDropdown.Item>*/}
                        {/*</NavDropdown>*/}
                        {/*<Nav.Link href="#" disabled>*/}
                        {/*    Link*/}
                        {/*</Nav.Link>*/}
                        <Form.Control
                            placeholder={"Search"}
                            aria-label={"Search"}
                            aria-describedby="searchForm"
                            type={"search"}
                            value={typeSelect}
                            className="me-2 borderR0"
                            onChange={(event) => setTypeSelect(event.target.value)}
                        />
                        <Button variant="outline-danger" size="sm" className="borderR0" onClick={(event) => setTypeSelect("")}>{"Очистити"}</Button>
                    </Nav>
                    <Form className="d-flex">
                        {/*<Form.Control*/}
                        {/*    placeholder={"Search"}*/}
                        {/*    aria-label={"Search"}*/}
                        {/*    aria-describedby="searchForm"*/}
                        {/*    type={"search"}*/}
                        {/*    value={typeSelect}*/}
                        {/*    className="me-2"*/}
                        {/*    onChange={(event) => setTypeSelect(event.target.value)}*/}
                        {/*/>*/}
                        {/*<Button variant="outline-success">Search</Button>*/}
                    </Form>
                    {/*<Button type="button" variant="" size="sm" className="borderR0"><GPTAneki/></Button>*/}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default CrmHeader;