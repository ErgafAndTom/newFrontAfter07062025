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
  const inputRef = useRef(null);

  useEffect(() => {
    if (thisOrder.id) {
      setLoading(true);
      setError(null);
      axios.post(`/orders/${thisOrder.id}/getComment`, { id: thisOrder.id })
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
      const res = await axios.post(`/orders/${thisOrder.id}/addNewComment`, { comment: newCommentText });
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
    }, 200);
  };

  const handleFocus = () => {
    clearTimeout(blurTimeoutRef.current);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendComment();
    }
  };

  // === NEW: paste support ===
  const uploadPastedFiles = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const uploads = Array.from(files).map(async (file) => {
        // Ігноруємо не-файлові вставки (наприклад, лише текст без файлів)
        if (!(file instanceof File)) return null;

        const formData = new FormData();
        formData.append('file', file, file.name || 'pasted-file');

        // Додаткові поля, якщо треба:
        // formData.append('description', 'Вставлено з буфера');

        const res = await axios.post(
          `/orders/${thisOrder.id}/addNewFile`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        // Очікуємо, що бек повертає InOrderFile із полями createdBy, fileLink, fileName, createdAt
        const f = res.data;
        // Додаємо у стрічку як “файловий” елемент
        return {
          id: `file-${f.id}`,
          createdBy: f.createdBy || { username: 'file-bot' },
          createdAt: f.createdAt || new Date().toISOString(),
          fileLink: f.fileLink,          // може бути webViewLink з Drive
          fileName: f.fileName || file.name,
          comment: null                  // для відмінності від текстових коментарів
        };
      });

      const results = (await Promise.all(uploads)).filter(Boolean);
      if (results.length) {
        setComments(prev => [...prev, ...results]);
      }
    } catch (e) {
      setError(e.message || 'Помилка завантаження файлу з буфера');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async (e) => {
    // Дозволяємо одночасно вставляти і текст, і файли:
    // 1) Якщо є файли в буфері — вантажимо
    const dt = e.clipboardData;
    const files = dt?.files;
    const hasFiles = files && files.length > 0;

    if (hasFiles) {
      e.preventDefault(); // Щоб не вставлявся “сміттєвий” base64-текст
      await uploadPastedFiles(files);
      return;
    }

    // 2) Якщо файлів немає — нехай стандартна вставка тексту працює як є
    //   (React сам обробить value інпуту)
  };

  // Підписуємося на paste лише коли поле активне
  useEffect(() => {
    const el = inputRef.current;
    if (commentInputActive && el) {
      el.addEventListener('paste', handlePaste);
      return () => el.removeEventListener('paste', handlePaste);
    }
  }, [commentInputActive]);

  return (
    <div className="d-flex flex-column justify-content-between">
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
          <div key={item.id || idx} className=" ">
            <div className="d-flex" style={{gap: '0.5rem', alignItems: 'baseline'}}>
              <div style={{color: "#ffc107"}}>
                {item.createdBy?.username ?? 'user'}:
              </div>

              <div className="adminFontTable justify-content-flex-start commentInOrder-textData">
                {/* Якщо це текстовий коментар */}
                {item.comment && <span>{item.comment}</span>}

                {/* Якщо це файловий “коментар” */}
                {!item.comment && item.fileLink && (
                  <a
                    href={item.fileLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-underline"
                    title={item.fileName || 'файл'}
                  >
                    {item.fileName || 'файл'}
                  </a>
                )}

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
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: '0.5rem' }}>
            <input
              ref={inputRef}
              autoFocus
              style={{ border: 'none', padding: '0.5rem', width: '100%' }}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder="Введи коментар або встав Ctrl+V файл/скрін"
            />
            <IoSend
              size={24}
              onMouseDown={(e) => e.preventDefault()}
              onClick={sendComment}
              style={{ cursor: 'pointer' }}
              title="Надіслати"
            />
          </div>
        ) : (
          <div
            className={'adminButtonAdd d-flex justify-content-center align-items-center '}
            style={{ cursor: 'pointer', width: '5vw' }}
            onClick={() => setCommentInputActive(true)}
            title="Додати коментар або вставити файл (Ctrl+V)"
          >
            +
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsInOrder;
