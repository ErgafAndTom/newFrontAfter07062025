import React, {useEffect, useState} from 'react';
import axios from '../../api/axiosInstance';
import {useSelector} from "react-redux";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import {Spinner} from "react-bootstrap";
import CardInfo from "../../PrintPeaksFAinal/trelloLikeBoards/CardInfo";

const PopupLeftNotification = ({name, ...props}) => {
  // if (!isVisible) return null;
  const currentUser = useSelector((state) => state.auth.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.post('/trello/getdataPost', {
          userId: currentUser.id
        });
        setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser?.id]);

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="me-1">
        {data.length}
      </Button>

      <Offcanvas show={show} onHide={handleClose} {...props}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Offcanvas</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {data.map((card, index) => (
            <div
              key={card.id}
              className="trello-card"
              style={{
                padding: '0.5vh',
                margin: '4px 0',
                background: '#fff',
                border: '0.2vh solid #ddd',
                borderRadius: '4px',
                cursor: 'grab',
                boxShadow: 'none',
                transition: 'background 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div className="d-flex">
                <div
                  className="trello-card-content"
                  style={{width: "100%", cursor: 'pointer', fontSize: '1.7vh', minHeight: '4vh'}}
                >
                  {card.content}
                </div>
                <button
                  // onClick={() => removeCard(list.id, card.id)}
                  style={{
                    padding: "0.4vw",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: 'pointer',
                    fontSize: '1.6vh'
                  }}
                >
                </button>
              </div>
              {card.inTrelloPhoto && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5vw',
                  marginTop: '0.5vh'
                }}>
                  {card.inTrelloPhoto.map((photo, index) => (
                    <img
                      key={index}
                      src={`/images/${photo.photoLink}`}
                      alt={`Card Photo ${index + 1}`}
                      style={{
                        width: '9vw',
                        objectFit: 'cover',
                        cursor: "not-allowed",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                      onClick={() => window.open(`/images/${photo.photoLink}`, '_blank')}
                    />
                  ))}
                </div>
              )}
              <div className="d-flex justify-content-between" style={{marginTop: '0.6vh'}}>

                {/*<div>*/}
                {/*  <div style={{*/}
                {/*    fontSize: "0.9vh",*/}
                {/*    opacity: "50%"*/}
                {/*  }}>add: {card.createdBy.username}</div>*/}
                {/*  <div style={{*/}
                {/*    fontSize: "0.9vh",*/}
                {/*    opacity: "50%"*/}
                {/*  }}>up: {card.lastUpdatedBy.username}</div>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*  <div style={{*/}
                {/*    fontSize: "0.9vh",*/}
                {/*    opacity: "50%"*/}
                {/*  }}>index: {card.index}</div>*/}
                {/*</div>*/}
                {/*<div className="d-flex flex-column align-items-end">*/}
                {/*  <div style={{*/}
                {/*    fontSize: "0.9vh",*/}
                {/*    opacity: "50%"*/}
                {/*  }}>{`add: ${new Date(card.createdAt).toLocaleDateString()} ${new Date(card.createdAt).toLocaleTimeString()}`}</div>*/}
                {/*  <div style={{*/}
                {/*    fontSize: "0.9vh",*/}
                {/*    opacity: "50%"*/}
                {/*  }}>{`up: ${new Date(card.updatedAt).toLocaleDateString()} ${new Date(card.updatedAt).toLocaleTimeString()}`}</div>*/}
                {/*</div>*/}
              </div>
            </div>
          ))}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

PopupLeftNotification.propTypes = {
  // message: PropTypes.string.isRequired,
  // isVisible: PropTypes.bool.isRequired,
  // onClose: PropTypes.func.isRequired
};

export default PopupLeftNotification;
