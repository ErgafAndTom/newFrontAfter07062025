import axios from "../../api/axiosInstance";
import React, {useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";

const FilesInOrder = ({thisOrder}) => {
    const [load, setLoad] = useState(true);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const [files, setFiles] = useState(null);

    useEffect(() => {
        if (thisOrder.id) {
            setLoad(true);
            setError(null);
            let data = {
                id: thisOrder.id
            };
            axios.post(`/orders/${thisOrder.id}/getFiles`, data)
                .then(response => {
                    console.log(response.data);
                    setFiles(response.data);
                    setLoad(false);
                })
                .catch((error) => {
                    console.log(error.message);
                    if (error.response && error.response.status === 403) {
                        navigate('/login');
                    }
                    setLoad(false);
                    setError(error.message);
                });
        }
    }, [thisOrder.id]);

    const uploadFile = async (orderId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoad(true);
            setError(null);
            const res = await axios.post(`/orders/${orderId}/addNewFile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(res.data);
            // Если нужно, обновите список файлов после загрузки, например:
            setFiles([...files, res.data]);
            setLoad(false);
        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
            setLoad(false);
            setError(error.message);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadFile(thisOrder.id, file);
        }
    };

    return (
        <div className="d-flex flex-column justify-content-between" style={{height: '88.1vh', width: "5vw", background: 'transparent'}}>
            {/* Скрытый input для выбора файла */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <div className="d-flex flex-column fontSize1VH">
                {files && (
                    <div className="d-flex flex-column">
                        {files.map((item, iter2) => (
                            <Link
                                key={item + iter2}
                                className="d-flex align-content-center align-items-center text-decoration-none filesInOrder-addButton"
                                // to={`/Desktop/${item.id}`}
                                to={`/files/${thisOrder.id}/${item.fileLink}`}
                            >
                                {item.fileName}
                            </Link>
                        ))}
                    </div>
                )}
                {load && (
                    <div className="d-flex justify-content-center align-items-center">
                        <Spinner animation="grow" style={{
                            color: "rgb(10,255,0)",
                        }} variant="dark"/>
                    </div>
                )}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
            </div>
            <div
                className="d-flex align-items-center justify-content-center filesInOrder-addButton"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                    marginTop: '0.5vh',
                    cursor: 'pointer',
                    fontSize: '1.7vh'
                }}
            >
                +
            </div>
        </div>
    );
};

export default FilesInOrder;
