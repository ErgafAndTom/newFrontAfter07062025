const fs = require('fs');

const path = 'E:/--------------Server_ERP/Frontend/src/progressbar_styles.css';
let content = fs.readFileSync(path, 'utf8');

// Fix payment buttons to stack text and status
content = content.replace(/\.PayButtons \{([\s\S]*?)\}/, (match, body) => {
  if (!body.includes('flex-direction: column')) {
    return `.PayButtons {${body}  flex-direction: column;\n}`;
  }
  return match;
});

// Remove width: 100% from pb-payment-wrap inside top-row
content = content.replace(/\.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar \.pb-top-row \.pb-payment-wrap\s*\{[\s\S]*?\}/g, '');

// Clean up top-row, payment-wrap, finance-row, metrics, metric
content = content.replace(/\.nui-bottom-shell \.nui-bottom-pane--progress \.nui-progressbar \.pb-top-row \{[\s\S]*?\}/, 
`.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-top-row {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10vh;
  min-height: 4vh;
  margin-top: 0;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: end;
  gap: 1.5vw;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0;
  z-index: 5;
  overflow: visible;
}`);

content = content.replace(/\.nui-progressbar \.pb-finance-row \{[\s\S]*?\}/, 
`.nui-progressbar .pb-finance-row {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
  display: flex;
  align-items: end;
  justify-content: space-evenly;
  gap: 1vw;
}`);

content = content.replace(/\.nui-bottom-shell \.nui-bottom-pane--progress \.nui-progressbar \.pb-finance-row \.pb-metrics \{[\s\S]*?\}/, 
`.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-finance-row .pb-metrics {
  display: flex;
  flex-wrap: nowrap;
  flex: 1 1 auto;
  align-items: end;
  justify-content: space-evenly;
  gap: 1vw;
  width: auto;
  min-width: 0;
}`);

content = content.replace(/\.nui-bottom-shell \.nui-bottom-pane--progress \.nui-progressbar \.pb-finance-row \.pb-metric \{[\s\S]*?\}/, 
`.nui-bottom-shell .nui-bottom-pane--progress .nui-progressbar .pb-finance-row .pb-metric {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
  min-width: 0;
  width: auto;
}`);

content = content.replace(/\.nui-progressbar \.pb-finance-row \.pb-discount-wrap \{[\s\S]*?\}/, 
`.nui-progressbar .pb-finance-row .pb-discount-wrap {
  flex: 0 0 auto;
  width: auto;
  margin-left: 0;
  position: relative;
}`);

fs.writeFileSync(path, content);
