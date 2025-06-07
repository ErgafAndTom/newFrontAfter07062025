import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "axios";

function MetaAddNewItemTable({namem, data, setData, inPageCount, setInPageCount, currentPage, setCurrentPage, pageCount, setPageCount}) {
   const [show, setShow] = useState(false);
    // Map data.metadata into the initial formValues state
    let newMetadata = data.metadata.filter((t) => t !== "id" && t !== "createdAt" && t !== "updatedAt" && t !== "photo")
    const [formValues, setFormValues] = useState(
        newMetadata.reduce((acc, cur) => {
            return {...acc, [cur]: ""};
        }, {})
    );

    const handleClose = () => {
        setShow(false);
    }

   const handleShow = () => setShow(true);

   let saveAll = (event) => {
       let forData = formValues
       forData.id = 0
       let data = {
           tableName: namem,
           inPageCount: inPageCount,
           currentPage: currentPage,
           formValues: forData
       }
       console.log(data);
       axios.post(`admin/addtotable`, data)
           .then(response => {
               console.log(response.data);
               setData(response.data)
               setPageCount(Math.ceil(response.data.count / inPageCount))

           })
           .catch(error => {
               console.log(error.message);
           })
   }

   // handle input field changes
   const handleInputChange = (event, metaItem) => {
        setFormValues(prev => ({...prev, [metaItem]: event.target.value}));
    }

   return (
       <>
           <Button className="adminButtonAdd" variant="danger" onClick={handleShow}>
               +
           </Button>

           <Offcanvas show={show} onHide={handleClose}>
               <Offcanvas.Header closeButton>
                   <Offcanvas.Title>Новий щось</Offcanvas.Title>
               </Offcanvas.Header>
               <Offcanvas.Body>
                   {newMetadata.map((metaItem) => (
                           <InputGroup className="mb-3" key={metaItem}>
                               <Form.Control
                                   placeholder={metaItem}
                                   aria-label={metaItem}
                                   aria-describedby="basic-addon1"
                                   value={formValues[metaItem]}
                                   onChange={(event) => handleInputChange(event, metaItem)}
                               />
                               <InputGroup.Text id="basic-addon1">{metaItem}</InputGroup.Text>
                           </InputGroup>
                   ))}
                   <Button onClick={saveAll} variant="primary" type="submit">
                       Додати
                   </Button>
               </Offcanvas.Body>
           </Offcanvas>
       </>
   );
}

export default MetaAddNewItemTable;