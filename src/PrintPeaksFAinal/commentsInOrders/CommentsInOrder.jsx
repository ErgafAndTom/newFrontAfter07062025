import axios from "../../api/axiosInstance";
import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";
import {IoSend} from "react-icons/io5";

const CommentsInOrder = ({thisOrder}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentInputActive, setCommentInputActive] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const navigate = useNavigate();
    const blurTimeoutRef = useRef(null);

    useEffect(() => {
        if (thisOrder.id) {
            setLoading(true);
            setError(null);
            axios.post(`/orders/${thisOrder.id}/getComment`, {id: thisOrder.id})
                .then(response => {
                    setComments(response.data || []);
                    setLoading(false);
                })
                .catch(error => {
                    if (error.response?.status === 403) navigate('/login');
                    else setError(error.message || "Ошибка получения комментариев");
                    setLoading(false);
                });
        }
    }, [thisOrder.id, navigate]);

    const sendComment = async () => {
        if (!newCommentText.trim()) {
            setCommentInputActive(false);
            return;
        }

        clearTimeout(blurTimeoutRef.current);

        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`/orders/${thisOrder.id}/addNewComment`, {comment: newCommentText});
            setComments(prev => [...prev, res.data]);
            setNewCommentText('');
        } catch (error) {
            setError(error.message || "Ошибка отправки комментария");
        } finally {
            setLoading(false);
            setCommentInputActive(false);
        }
    };

    const handleBlur = () => {
        blurTimeoutRef.current = setTimeout(() => {
            setCommentInputActive(false);
            setNewCommentText('');
        }, 200); // таймаут достаточный для обработки клика
    };

    const handleFocus = () => {
        clearTimeout(blurTimeoutRef.current);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            sendComment();
        }
    };

    return (
        <div className="d-flex flex-column justify-content-between"
        >
            <div className="d-flex flex-column overflow-auto">
                {loading && (
                    <div className="d-flex">
                        <Spinner animation="grow" style={{color: "rgb(10,255,0)"}} variant="dark"/>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {!loading && comments.length === 0 && (
                    <div className=" ">Коментарі, нотатки та файли</div>
                )}

                {comments.map((item, idx) => (
                    <div key={item.id || idx}
                         className=" ">
                        <div className="d-flex">
                            <div style={{color: "#ffc107"}}>
                                {item.createdBy.username}:
                            </div>
                            <div
                                className="adminFontTable justify-content-flex-start  commentInOrder-textData">
                                {item.comment}
                                <div style={{opacity: "50%", fontSize: "1vmin"}} className="commentInOrder-textData ">
                                    {`${new Date(item.createdAt).toLocaleDateString()} ${new Date(item.createdAt).toLocaleTimeString()}`}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

          <div style={{ position: 'relative', width: '30vw' }}>
            {commentInputActive ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <input
                  autoFocus
                  style={{ border: 'none', padding: '0.5rem' }}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  placeholder="..."
                />
                <IoSend
                  size={24}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={sendComment}
                />
              </div>
            ) : (
              <div
               className={'adminButtonAdd d-flex justify-content-center align-items-center '}
               style={{ cursor: 'pointer',width: '5vw' }}
                onClick={() => setCommentInputActive(true)}
              >
                +
              </div>
            )}
          </div>


        </div>
    );
};

export default CommentsInOrder;
