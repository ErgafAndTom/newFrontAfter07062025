import './novaPoshtaButton.css';
import React, { useState, useEffect, useRef } from 'react';

const NovaPoshtaButton = ({ onDepartmentSelect }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [selectedPlaceText, setSelectedPlaceText] = useState('');
    const [selectedDescriptionText, setSelectedDescriptionText] = useState('Обрати відділення або поштомат');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    console.error("Помилка отримання геолокації:", error);
                }
            );
        } else {
            console.error("Ваш браузер не підтримує геолокацію.");
        }
    }, []);

    const getQueryParams = () => {
        const params = new URLSearchParams(window.location.search);
        const queryParams = {};
        params.forEach((value, key) => {
            queryParams[key] = value;
        });
        return queryParams;
    };

    const handleFrameMessage = (event) => {
        console.log(event.data);
        if (event.origin !== 'https://widget.novapost.com') {
            console.warn('Повідомлення з невідомого джерела:', event.origin);
            return;
        }
        if (event.data && typeof event.data === 'object') {
            const newPlaceText = event.data.shortName || 'Обрати відділення або поштомат';
            const newDescriptionText = `${event.data.addressParts?.city || ''} вул. ${event.data.addressParts?.street || ''}, ${event.data.addressParts?.building || ''}`;
            setSelectedPlaceText(newPlaceText);
            setSelectedDescriptionText(newDescriptionText);
            setSelectedDepartmentId(event.data.id);
            if (onDepartmentSelect) {
                onDepartmentSelect(event.data.id, event.data, newDescriptionText, event.data.refCity.externalId, event.data.externalId, event.data.number);

            }
            closeFrame();
            return;
        }
        if (event.data === 'closeFrame') {
            closeFrame();
            return;
        }
        closeFrame();
    };

    useEffect(() => {
        if (modalOpen) {
            window.addEventListener('message', handleFrameMessage);
            return () => {
                window.removeEventListener('message', handleFrameMessage);
            };
        }
    }, [modalOpen]);

    const openFrame = () => {
        setModalOpen(true);
        if (iframeRef.current) {
            iframeRef.current.src = 'https://widget.novapost.com/division/index.html';
            iframeRef.current.onload = () => {
                const queryParams = getQueryParams();
                const domain = window.location.hostname;
                const data = {
                    placeName: 'Київ',
                    latitude: latitude,
                    longitude: longitude,
                    domain: domain,
                    id: selectedDepartmentId,
                    ...queryParams,
                };
                iframeRef.current.contentWindow.postMessage(data, '*');
            };
        }
    };

    const closeFrame = () => {
        setModalOpen(false);
        if (iframeRef.current) {
            iframeRef.current.src = '';
        }
    };

    return (
        <div>
            <div
                className="novaPoshtaButton-nova-poshta-button novaPoshtaButton-button-horizontal novaPoshtaButton-text-row"
                onClick={openFrame}
                data-selected-department-id={selectedDepartmentId || undefined}
            >
                <div className="novaPoshtaButton-logo novaPoshtaButton-logo-no-margin">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.9401 16.4237H16.0596V21.271H19.2101L15.39 25.0911C14.6227 25.8585 13.3791 25.8585 12.6118 25.0911L8.79166 21.271H11.9401V16.4237ZM21.2688 19.2102V8.78972L25.091 12.6098C25.8583 13.3772 25.8583 14.6207 25.091 15.3881L21.2688 19.2102ZM16.0596 6.73099V11.5763H11.9401V6.73099H8.78958L12.6097 2.90882C13.377 2.14148 14.6206 2.14148 15.3879 2.90882L19.2101 6.73099H16.0596ZM2.90868 12.6098L6.72877 8.78972V19.2102L2.90868 15.3901C2.14133 14.6228 2.14133 13.3772 2.90868 12.6098Z" fill="#DA291C"/>
                    </svg>
                </div>
                <div className="novaPoshtaButton-angle">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.49399 1.44891L10.0835 5.68541L10.1057 5.70593C10.4185 5.99458 10.6869 6.24237 10.8896 6.4638C11.1026 6.69642 11.293 6.95179 11.4023 7.27063C11.5643 7.74341 11.5643 8.25668 11.4023 8.72946C11.293 9.0483 11.1026 9.30367 10.8896 9.53629C10.6869 9.75771 10.4184 10.0055 10.1057 10.2942L10.0835 10.3147L5.49398 14.5511L4.47657 13.4489L9.06607 9.21246C9.40722 8.89756 9.62836 8.69258 9.78328 8.52338C9.93272 8.36015 9.96962 8.28306 9.98329 8.24318C10.0373 8.08559 10.0373 7.9145 9.98329 7.7569C9.96963 7.71702 9.93272 7.63993 9.78328 7.4767C9.62837 7.3075 9.40722 7.10252 9.06608 6.78761L4.47656 2.55112L5.49399 1.44891Z" fill="#475569"/>
                    </svg>
                </div>
                <div className="novaPoshtaButton-wrapper">
                    <span className="novaPoshtaButton-text" style={{ marginBottom: selectedPlaceText ? '5px' : '0' }}>
                        {selectedPlaceText || 'Обрати відділення або поштомат'}
                    </span>
                    <span className="novaPoshtaButton-text-description">
                        {selectedDescriptionText || 'Обрати відділення або поштомат'}
                    </span>
                </div>
            </div>

            {modalOpen && (
                <div className="novaPoshtaButton-modal-overlay" id="modal-overlay" style={{ display: 'flex' }}>
                    <div className="novaPoshtaButton-modal">
                        <header className="novaPoshtaButton-modal-header">
                            <h2>Вибрати відділення</h2>
                            <span className="novaPoshtaButton-modal-close" onClick={closeFrame}>&times;</span>
                        </header>
                        <iframe
                            ref={iframeRef}
                            className="novaPoshtaButton-modal-iframe"
                            id="modal-iframe"
                            src="https://widget.novapost.com/division/index.html"
                            allow="geolocation"
                            title="Nova Poshta Widget"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NovaPoshtaButton;
