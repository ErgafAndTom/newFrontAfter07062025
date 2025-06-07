import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { Button, Spinner, Alert, Card, Container, Row, Col, Modal } from 'react-bootstrap';
import { buttonStyles } from './profile/styles';

const UserFiles = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [files, setFiles] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    // Завантаження списку файлів користувача
    useEffect(() => {
        if (user && user.id) {
            fetchUserFiles();
        }
    }, [user]);

    const fetchUserFiles = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`/user/files/${user.id}`);
            setFiles(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Помилка при отриманні файлів:', error);
            setLoading(false);
            if (error.response && error.response.status === 403) {
                navigate('/login');
            }
            setError(error.response?.data?.message || 'Помилка при отриманні файлів користувача');
        }
    };

    // Завантаження нового файлу
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);

        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.post('/user/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setFiles([...files, response.data]);
            setSuccess('Файл успішно завантажено');
            setLoading(false);
            
            // Автоматично приховуємо повідомлення про успіх через 3 секунди
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (error) {
            console.error('Помилка завантаження файлу:', error);
            setLoading(false);
            setError(error.response?.data?.message || 'Помилка при завантаженні файлу');
        }
    };

    // Видалення файлу
    const deleteFile = async (fileId) => {
        try {
            setLoading(true);
            setError(null);
            
            await axios.delete(`/user/files/${fileId}`);
            
            setFiles(files.filter(file => file.id !== fileId));
            setSuccess('Файл успішно видалено');
            setLoading(false);
            setShowDeleteModal(false);
            
            // Автоматично приховуємо повідомлення про успіх через 3 секунди
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (error) {
            console.error('Помилка видалення файлу:', error);
            setLoading(false);
            setError(error.response?.data?.message || 'Помилка при видаленні файлу');
            setShowDeleteModal(false);
        }
    };

    // Обробник зміни файлу
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadFile(file);
        }
    };

    // Відкриття діалогу вибору файлу
    const handleUploadClick = () => {
        fileInputRef.current && fileInputRef.current.click();
    };

    // Відкриття модального вікна для підтвердження видалення
    const handleDeleteClick = (file) => {
        setFileToDelete(file);
        setShowDeleteModal(true);
    };

    // Відкриття модального вікна для перегляду файлу
    const handlePreviewClick = (file) => {
        setPreviewFile(file);
        setShowPreviewModal(true);
    };

    // Форматування розміру файлу
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Байт';
        const k = 1024;
        const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Форматування дати
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Отримання іконки для типу файлу
    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return <i className="bi bi-file-pdf text-danger fs-2"></i>;
            case 'doc':
            case 'docx':
                return <i className="bi bi-file-word text-primary fs-2"></i>;
            case 'xls':
            case 'xlsx':
                return <i className="bi bi-file-excel text-success fs-2"></i>;
            case 'ppt':
            case 'pptx':
                return <i className="bi bi-file-ppt text-warning fs-2"></i>;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return <i className="bi bi-file-image text-info fs-2"></i>;
            case 'zip':
            case 'rar':
            case '7z':
                return <i className="bi bi-file-zip text-secondary fs-2"></i>;
            case 'txt':
                return <i className="bi bi-file-text text-dark fs-2"></i>;
            default:
                return <i className="bi bi-file-earmark fs-2"></i>;
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Мої файли</h2>
            
            {/* Повідомлення про помилку */}
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            
            {/* Повідомлення про успіх */}
            {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                    {success}
                </Alert>
            )}
            
            {/* Кнопка завантаження нового файлу */}
            <div className="mb-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <Button 
                    variant="primary" 
                    onClick={handleUploadClick}
                    disabled={loading}
                    style={{ ...buttonStyles.base, ...buttonStyles.primary }}
                >
                    <i className="bi bi-upload me-2"></i>
                    Завантажити новий файл
                </Button>
            </div>
            
            {/* Індикатор завантаження */}
            {loading && (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Завантаження...</p>
                </div>
            )}
            
            {/* Список файлів */}
            {!loading && files.length === 0 ? (
                <Card className="text-center p-5">
                    <Card.Body>
                        <Card.Title>У вас ще немає файлів</Card.Title>
                        <Card.Text>
                            Натисніть кнопку "Завантажити новий файл", щоб додати свій перший файл.
                        </Card.Text>
                        <Button 
                            variant="primary" 
                            onClick={handleUploadClick}
                            style={{ ...buttonStyles.base, ...buttonStyles.primary }}
                        >
                            <i className="bi bi-upload me-2"></i>
                            Завантажити новий файл
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    {files.map((file) => (
                        <Col md={4} key={file.id} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-3">
                                        {getFileIcon(file.fileName)}
                                        <div className="ms-3">
                                            <h5 className="mb-0">{file.fileName}</h5>
                                            <small className="text-muted">
                                                {formatFileSize(file.fileSize)}
                                            </small>
                                        </div>
                                    </div>
                                    <p className="mb-2">
                                        <small className="text-muted">
                                            Завантажено: {formatDate(file.createdAt)}
                                        </small>
                                    </p>
                                    <div className="d-flex justify-content-between mt-3">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handlePreviewClick(file)}
                                            style={{ ...buttonStyles.base, ...buttonStyles.secondary }}
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            Переглянути
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDeleteClick(file)}
                                            style={{ ...buttonStyles.base, ...buttonStyles.danger }}
                                        >
                                            <i className="bi bi-trash me-1"></i>
                                            Видалити
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            
            {/* Модальне вікно для підтвердження видалення */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Підтвердження видалення</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Ви впевнені, що хочете видалити файл "{fileToDelete?.fileName}"?</p>
                    <p className="text-danger">Ця дія незворотна.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowDeleteModal(false)}
                        style={{ ...buttonStyles.base, ...buttonStyles.secondary }}
                    >
                        Скасувати
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => deleteFile(fileToDelete.id)}
                        style={{ ...buttonStyles.base, ...buttonStyles.danger }}
                    >
                        Видалити
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Модальне вікно для перегляду файлу */}
            <Modal 
                show={showPreviewModal} 
                onHide={() => setShowPreviewModal(false)} 
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{previewFile?.fileName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {previewFile && (
                        <div className="text-center">
                            {previewFile.fileType && previewFile.fileType.startsWith('image/') ? (
                                <img 
                                    src={`/api/user/files/download/${previewFile.id}`} 
                                    alt={previewFile.fileName}
                                    className="img-fluid"
                                    style={{ maxHeight: '60vh' }}
                                />
                            ) : previewFile.fileType === 'application/pdf' ? (
                                <iframe 
                                    src={`/api/user/files/download/${previewFile.id}`}
                                    width="100%" 
                                    height="500px" 
                                    title={previewFile.fileName}
                                ></iframe>
                            ) : (
                                <div className="p-5 text-center">
                                    <p>Попередній перегляд недоступний для цього типу файлу.</p>
                                    <Button 
                                        variant="primary"
                                        href={`/api/user/files/download/${previewFile.id}`}
                                        target="_blank"
                                        style={{ ...buttonStyles.base, ...buttonStyles.primary }}
                                    >
                                        <i className="bi bi-download me-2"></i>
                                        Завантажити файл
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowPreviewModal(false)}
                        style={{ ...buttonStyles.base, ...buttonStyles.secondary }}
                    >
                        Закрити
                    </Button>
                    <Button 
                        variant="primary"
                        href={`/api/user/files/download/${previewFile?.id}`}
                        download
                        style={{ ...buttonStyles.base, ...buttonStyles.primary }}
                    >
                        <i className="bi bi-download me-2"></i>
                        Завантажити
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UserFiles;