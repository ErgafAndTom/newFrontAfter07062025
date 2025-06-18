import React from 'react';
import PropTypes from 'prop-types';
import './SlideInModal.css';
import CompactAddUserForm from './CompactAddUserForm';

const SlideInModal = ({ show, handleCloseAddUser, title }) => {
    if (!show) return null;
    SlideInModal.propTypes = {

        handleCloseAddUser: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        show: PropTypes.bool.isRequired,
    };
    return (
        <>
            <div className="modal-backdrop-custom" onClick={handleCloseAddUser}></div>
                            <div className="modal-slide-container">
                <div className="modal-slide-header">
                    <button className="modal-close-btn" onClick={handleCloseAddUser}>
                        &times;
                    </button>


                </div>
                <div className="modal-slide-body " >
                    <CompactAddUserForm handleCloseAddUser={handleCloseAddUser}></CompactAddUserForm>

                </div>

            </div>
            <div>{title}</div>
        </>

    );
};



export default SlideInModal;
