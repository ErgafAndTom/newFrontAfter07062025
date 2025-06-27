import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from '../../api/axiosInstance';
import { useSelector } from 'react-redux';
import BellButton from './BellButton';

const PopupLeftNotification = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const popupRef = useRef(null);

  const toggle = () => setShow((prev) => !prev);

  useEffect(() => {
    if (!currentUser?.id) return;
    axios.post('/trello/getdataPost', { userId: currentUser.id })
      .then(res => setData(res.data))
      .catch(console.error);
  }, [currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  const portalRoot = document.getElementById('notification-root');
  if (!portalRoot) return null;

  return (
    <>
      <BellButton count={data.length} onClick={toggle} />

      {show && createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '22vw',
            marginTop: '5vh',
            backgroundColor: '#f2f0e7',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: '1vh 0 0 1vh',
            padding: '1vh 1vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            zIndex: 2147483647
          }}
        >


          {data.map((card) => (
            <div key={card.id} style={{
              background: '#fbfaf6',
              borderRadius: '0.5vh',
              padding: '0.8vh 0.6vw',
              marginBottom: '1vh',
              marginTop:'1vh',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.5vw'
            }}>
              <div style={{ flexGrow: 1 }}>
                <div style={{ marginBottom: '0.5vh' }}>{card.content}</div>
                {card.inTrelloPhoto && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3vw' }}>
                    {card.inTrelloPhoto.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`/images/${photo.photoLink}`}
                        alt=""
                        style={{
                          height: '3vh', objectFit: 'cover',
                          borderRadius: '0.3vh', pointerEvents: 'none'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <button style={{
                backgroundColor: '#f8aa1f',
                border: 'none',
                borderRadius: '0.5vh',
                padding: '0.5vh 0.8vw',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}

              onClick={() => {}}>
                ✓
              </button>
            </div>
          ))}
        </div>,
        portalRoot
      )}
    </>
  );
};

export default PopupLeftNotification;
