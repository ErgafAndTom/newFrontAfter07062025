/**
 * Єдине джерело істини для статусів замовлень.
 * Використовується на фронтенді та має відповідати бекенду.
 */

export const ORDER_STATUSES = {
  CANCELLED:  '-1',
  PROCESSING: '0',
  PRINTING:   '1',
  POSTPRESS:  '2',
  READY:      '3',
  RECEIVED:   '4',
  DELETED:    '5',
};

export const ORDER_STATUS_LABELS = {
  '-1': 'Скасоване',
  '0':  'Скіко',
  '1':  'Друк',
  '2':  'Постпрес',
  '3':  'Готово',
  '4':  'Отримано',
  '5':  'Видалено',
};
