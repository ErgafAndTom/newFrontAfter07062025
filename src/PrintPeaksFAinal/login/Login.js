import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {login} from "../../actions/authActions";
import {useNavigate} from "react-router-dom";

export const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const error = useSelector((state) => state.auth.error);
    const loading = useSelector((state) => state.auth.loading);
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login(credentials, navigate));
    };

    return (
        <div className="text-center">
            <main className="">
                <Form onSubmit={handleSubmit}>

                    <Form.Group className="" controlId="formBasicLogin">
                        <Form.Control style={{
                            height: "5vh",
                            background: "#F2F0E7",
                        }}
                            className="inputLogin"
                            name="username"
                            type="text"
                            onChange={handleChange}
                            placeholder="Логін"
                            value={credentials.username}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="" controlId="formBasicPassword"
                              >
                        <Form.Control   style={{
                            height: "5vh",
                            background: "#F2F0E7",
                            marginTop: "2vh"
                        }}
                            className="inputLogin"
                            name="password"
                            type="password"
                            onChange={handleChange}
                            placeholder="Пароль"
                            value={credentials.password}
                            required
                        />
                    </Form.Group>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <Button style={{
                        height: "5vh",
                        background: "#FAB416",
                        border: "#FAB416",
                        color: "black"
                    }}
                        className="text-center buttonLogin"
                        // onClick={loginSend}
                        variant="secondary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Вхід...' : 'Увійти'}
                    </Button>
                </Form>
            </main>
        </div>
    )
}