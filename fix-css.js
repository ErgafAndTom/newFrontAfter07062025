const fs = require('fs');

const path = 'E:/--------------Server_ERP/Frontend/src/progressbar_styles.css';
let content = fs.readFileSync(path, 'utf8');

// Add wrapper styles
content += `

/* Finance Wrapper and Separator */
.pb-finance-wrapper {
  order: 1;
  width: 100%;
  border-top: 1px solid var(--admingrey, #666666);
  padding-top: 0.5vh;
  margin-top: 0.5vh;
  margin-bottom: 0.5vh;
  display: block;
}

/* Client Inline Block */
.client-inline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1vw;
  width: 100%;
  padding: 0;
  margin-bottom: 0;
}

.client-name {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.client-phone {
  flex: 0 0 auto;
}

.client-buttons-wrap {
  display: flex;
  align-items: center;
  gap: 0.4vw;
  flex: 0 0 auto;
}

.client-inline-text {
  color: var(--admingrey, #666666);
  font-size: var(--font-size-pay);
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.client-action-btn {
  width: auto !important;
  min-width: 4vw !important;
  padding: 0 0.8vw !important;
  font-size: var(--font-size-s) !important;
  flex: 0 0 auto !important;
  height: 4vh !important;
}
`;

// Also fix pb-top-row and pb-action-rail positions
content = content.replace(/\.nui-bottom-shell \.nui-bottom-pane--progress \.nui-progressbar \.pb-top-row \{[\s\S]*?z-index: 5;\s*overflow: visible;\s*\}/, 
`.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-top-row {
  position: relative;
  left: 0;
  right: 0;
  bottom: auto;
  min-height: 4vh;
  margin-top: 0;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: end;
  gap: 1vw;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0;
  z-index: 5;
  overflow: visible;
}`);

content = content.replace(/\.nui-bottom-shell \.nui-bottom-pane--progress \.nui-progressbar \.pb-action-rail \{[\s\S]*?\}/,
`.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-action-rail {
  position: relative;
  left: 0;
  bottom: auto;
  width: 100%;
  max-width: 100%;
  margin-left: 0;
  margin-top: 0;
  border-top: 0px solid rgba(0, 0, 0, 0.12);
  background: var(--adminfonelement, #f2f0e9);
  order: 2;
}`);

fs.writeFileSync(path, content);
