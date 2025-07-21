import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function ModalDeleteOrder({
                            thisOrderForDelete,
                            showDeleteOrderModal,
                            setThisOrderForDelete,
                            setShowDeleteOrderModal,
                            data,
                            setData,
                            url
                          }) {
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(showDeleteOrderModal);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setShowDeleteOrderModal(false);
  };

  const handleShow = useCallback(() => {
    setShowDeleteOrderModal(true);
  }, []);

  const deleteThis = () => {
    let id = thisOrderForDelete.id;
    setLoad(true);
    axios
      .delete(`${url}/${id}`)
      .then((response) => {
        if (response.status === 200) {
          setData((prev) => ({
            ...prev,
            rows: Array.isArray(prev?.rows)
              ? prev.rows.filter((item) => item.id !== id)
              : []
          }));
          setLoad(false);
          setShowDeleteOrderModal(false);
        }
      })
      .catch((error) => {
        console.log(error.message);
        setLoad(false);
        setError(error.message);
      });
  };

  useEffect(() => {
    if (showDeleteOrderModal) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [showDeleteOrderModal]);

  return isVisible ? (
    <>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: 99
        }}
        onClick={handleClose}
      />

      <div
        style={{
          zIndex: 100,
          position: 'fixed',
          background: '#fbfaf6',
          top: '20%',
          left: '50%',
          borderRadius: '1vw',
          maxWidth: '90vw',
          padding: '0.5vw',
          transform: isAnimating
            ? 'translate(-50%, -50%) scale(1)'
            : 'translate(-50%, -30%) scale(0.8)',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0 0 0.3vw 0.3vw'
          }}
        >
          {/*<div className="btn btn-lg btn-close" onClick={handleClose}></div>*/}
        </div>
        <div
          style={{
            padding: '0.5vw',
            background: '#fbfaf6',
            borderRadius: '1vw 1vw 0 0'
          }}
        >
          Видалити замовлення {thisOrderForDelete?.name}?
          {thisOrderForDelete?.count && <> — {thisOrderForDelete.count} шт</>}
          {thisOrderForDelete?.priceForThis && <> за ціною {thisOrderForDelete.priceForThis} грн</>}
        </div>
        <div
          className="d-flex justify-content-center align-content-center"
          style={{
            borderRadius: '0 0 1vw 1vw',
            background: '#fbfaf6',
            padding: '0.5vw'
          }}
        >
          {!load && (
            <button
              className="adminButtonAdd hoverOrange"
              style={{ padding: '0.5vw', margin: '0.5vw' }}
              onClick={handleClose}
            >
              Закрити
            </button>
          )}
          {load && (
            <button
              disabled
              className="adminButtonAdd hoverOrange"
              style={{ padding: '0.5vw', margin: '0.5vw' }}
            >
              Видалення...
            </button>
          )}
          {error && (
            <button
              disabled
              className="adminButtonAdd hoverOrange"
              style={{ padding: '0.5vw', margin: '0.5vw' }}
            >
              {error}
            </button>
          )}
          {!load && (
            <button
              className="adminButtonAdd hoverOrange"
              style={{ background: '#ff5d5d', padding: '0.5vw', margin: '0.5vw' }}
              onClick={deleteThis}
            >
              Видалити
            </button>
          )}
        </div>
      </div>
    </>
  ) : null;
}

export default ModalDeleteOrder;
