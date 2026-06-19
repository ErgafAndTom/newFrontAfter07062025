import React from 'react';
import './StatusBar.css';

const STATUS_MAP = {
  '-1': { label: 'Скасоване',  cls: 'sb-badge--cancel' },
  '0':  { label: 'Скіко',      cls: 'sb-badge--s0' },
  '1':  { label: 'Друк',       cls: 'sb-badge--s1' },
  '2':  { label: 'Постпрес',   cls: 'sb-badge--s2' },
  '3':  { label: 'Готово',     cls: 'sb-badge--s3' },
  '4':  { label: 'Отримано',   cls: 'sb-badge--s4' },
  '5':  { label: 'Видалено',   cls: 'sb-badge--s5' },
};

function StatusBar({ item }) {
  const cfg = STATUS_MAP[String(item.status)] ?? STATUS_MAP['0'];
  return (
    <div className={`sb-badge ${cfg.cls}`}>
      {cfg.label}
    </div>
  );
}

export default StatusBar;
