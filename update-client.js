const fs = require('fs');

const path = 'E:/--------------Server_ERP/Frontend/src/PrintPeaksFAinal/userInNewUiArtem/ClientChangerUIArtem.jsx';
let content = fs.readFileSync(path, 'utf8');

const returnRegex = /return \([\s\S]*?\n      \{error && \(/;

const newReturn = `return (
    <div className="client-inline-row" onClick={handleShow}>
      <div
        onClick={handleCopy}
        title="Натисни, щоб скопіювати 🤖:"
        className="client-inline-text client-name"
      >
        {thisOrder.client
          ? \`🤖:\${thisOrder.client.id} – \${thisOrder.client.lastName} \${thisOrder.client.firstName} \${thisOrder.client.familyName}\`
          : 'Вибрати клієнта'}
      </div>

      {thisOrder?.client?.phoneNumber && (
        <div className="client-inline-text client-phone">
          {thisOrder.client.phoneNumber}
        </div>
      )}

      <div className="client-buttons-wrap">
        {thisOrder.client && (
          <>
            <button
              className="PayButtons client-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (thisOrder?.client?.id) {
                  window.open(\`https://drive.google.com/drive/folders/1zpPDvQF2g_QcE3i6SCemKhg81rqLHag3\`, '_blank');
                } else {
                  setError('Спочатку виберіть клієнта');
                }
              }}
              title="Файли клієнта"
            >
              Файли
            </button>

            <button
              className="PayButtons client-action-btn"
              onClick={(e) => setThisUserToCabinetFunc(true, thisOrder.client, e)}
              title="Кабінет клієнта"
            >
              Кабінет
            </button>

            <button
              className="PayButtons client-action-btn"
              onClick={(e) => { e.stopPropagation(); openMessenger('telegram'); }}
              title="Telegram"
            >
              Telegram
            </button>
          </>
        )}

        <button
          type="button"
          className="PayButtons client-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            openDeadlinePicker();
          }}
          disabled={!canEditDeadline}
        >
          Дедлайн
        </button>

        {deadlineCountdown && (
          <span className="client-inline-text client-countdown">
            {deadlineCountdown}
          </span>
        )}

        <input
          ref={deadlineInputRef}
          type="datetime-local"
          onChange={handleDeadlineInputChange}
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        />
      </div>

      {error && (`;

content = content.replace(returnRegex, newReturn);
fs.writeFileSync(path, content);
