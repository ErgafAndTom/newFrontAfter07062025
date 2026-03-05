const fs = require('fs');

const path = 'E:/--------------Server_ERP/Frontend/src/progressbar_styles.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/.nui-progressbar .pb-finance-row {[\s\S]*?}/,
`.nui-progressbar .pb-finance-row {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  display: flex;
  align-items: end;
  justify-content: flex-end;
  gap: 1vw;
}`);

content = content.replace(/.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-finance-row .pb-metrics {[\s\S]*?min-width: 0;\s*}/,
`.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-finance-row .pb-metrics {
  display: flex;
  flex-wrap: nowrap;
  flex: 1 1 auto;
  align-items: end;
  justify-content: flex-end;
  gap: 1vw;
  width: auto;
  max-width: 100%;
  min-width: 0;
}`);

content = content.replace(/.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-finance-row .pb-metric {[\s\S]*?min-width: 0;\s*}/,
`.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-finance-row .pb-metric {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
  min-width: 0;
}`);


fs.writeFileSync(path, content);
