import React from 'react';
import './SlideInModal.css';
import CompactAddUserForm from "./CompactAddUserForm";

const SlideInModal = ({show, onClose, children, title, handleCloseAddUser}) => {
    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop-custom" onClick={handleCloseAddUser}></div>
            <div className="modal-slide-container"
            style={{marginTop: "8vh", }}>
                <div className="modal-slide-header">
                    {title}
                    <button onClick={onClose} className="modal-close-btn">×</button>
                </div>
                <div className="modal-slide-body" style={{position: "unset"}}>
                    <CompactAddUserForm handleCloseAddUser={handleCloseAddUser}></CompactAddUserForm>
                </div>

            </div>
        </>

    );
};

export default SlideInModal;
