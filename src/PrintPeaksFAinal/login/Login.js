import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {login} from "../../actions/authActions";
import {useNavigate} from "react-router-dom";

export const Login = () => {
  const css = `


/* From Uiverse.io by micaelgomestavares */
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #ffffff;
  padding: 30px;
  width: 450px;
  border-radius: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

::placeholder {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.form button {
  align-self: flex-end;
}

.flex-column > label {
  color: #151717;
  font-weight: 600;
}

.inputForm {
  border: 1.5px solid #ecedec;
  border-radius: 10px;
  height: 50px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  transition: 0.2s ease-in-out;
}

.input {
  margin-left: 10px;
  border-radius: 10px;
  border: none;
  width: 85%;
  height: 100%;
}

.input:focus {
  outline: none;
}

.inputForm:focus-within {
  border: 1.5px solid #2d79f3;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.flex-row > div > label {
  font-size: 14px;
  color: black;
  font-weight: 400;
}

.span {
  font-size: 14px;
  margin-left: 5px;
  color: #2d79f3;
  font-weight: 500;
  cursor: pointer;
}

.button-submit {
  margin: 20px 0 10px 0;
  background-color: #151717;
  border: none;
  color: white;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  height: 50px;
  width: 100%;
  cursor: pointer;
}

.button-submit:hover {
  background-color: #252727;
}

.p {
  text-align: center;
  color: black;
  font-size: 14px;
  margin: 5px 0;
}

.btn {
  margin-top: 10px;
  width: 100%;
  height: 50px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  gap: 10px;
  border: 1px solid #ededef;
  background-color: white;
  cursor: pointer;
  transition: 0.2s ease-in-out;
}

.btn:hover {
  border: 1px solid #2d79f3;
;
}


  `
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
