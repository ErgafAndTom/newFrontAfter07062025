import React, {useEffect, useState} from 'react';
import Button from "react-bootstrap/Button";
import {Modal} from "react-bootstrap";
import Loader2 from "../calc/Loader2";
// import OpenAI from 'openai';
import axios from "axios";

function GTPErrorResponse({err = 'Напиши жарт про Нічого(в функцію передали нічого) українською мовою', setErr}) {
    const [input, setInput] = useState(err);
    const [response, setResponse] = useState('');
    // const [show, setShow] = useState(false);
    const [load, setLoad] = useState(false);

    const handleInputChange = (event) => {
        setInput(event.target.value);
    };

    useEffect(() => {
            setLoad(true);
            const apiKey = 'sk-key'; // Замініть на ваш API ключ від OpenAI
            const openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true
            });
            try {
                // const response = await openai.chat.completions.create({
                //     model: 'gpt-3.5-turbo',
                //     messages: [{ role: 'user', content: input }],
                // });

                openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: input }],
                }).then(response => {
                    setResponse(response.choices[0].message.content);
                    setLoad(false)
                }).catch(error => {
                    setResponse('Помилка при запиті до OpenAI:', err);
                })
            } catch (error) {
                console.error('Помилка при запиті до OpenAI:', error);
                // setResponse('Помилка при запиті до OpenAI:', error);
            }
    }, [err]);

    const handleClose = () => {
        setErr(null);
    }
    const handleShow = () => {
        setErr(null);
    }

    return (
        <div>
            {/*<Button variant="outline-danger" className="adminFontTable" onClick={handleSubmit}>*/}
            {/*    <Loader2/>*/}
            {/*</Button>*/}

            <Modal show={true} onHide={handleClose}>
                <Modal.Header closeButton>
                    {/*<Modal.Title>GPT Анеки</Modal.Title>*/}
                </Modal.Header>
                <Modal.Body>
                    {load ? (
                        <Loader2/>
                    ) : (
                        <li>{response}</li>
                    )}
                    {/*<div>*/}
                    {/*    <textarea*/}
                    {/*        value={input}*/}
                    {/*        onChange={handleInputChange}*/}
                    {/*        placeholder="Введіть ваше запитання"*/}
                    {/*    />*/}
                    {/*    <button onClick={handleSubmit}>Надіслати</button>*/}
                    {/*    <div>*/}
                    {/*        <li className="m-1 p-1">{response}</li>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </Modal.Body>
                <Modal.Footer>
                    {/*<Button variant="secondary" onClick={handleClose}>*/}
                    {/*    Закрити*/}'''''
                    {/*</Button>*/}
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default GTPErrorResponse;