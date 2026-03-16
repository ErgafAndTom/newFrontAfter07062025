/**
 * Утиліти для розрахунку ваги та розмірів посилок Нової Пошти
 */

// ISO C-серія конвертів (розміри в мм)
export const ENVELOPES = [
  { name: 'C6', width: 114, height: 162, maxThickness: 20, maxWeightG: 100,  fitsSheet: 'A6' },
  { name: 'C5', width: 162, height: 229, maxThickness: 20, maxWeightG: 500,  fitsSheet: 'A5' },
  { name: 'C4', width: 229, height: 324, maxThickness: 20, maxWeightG: 500,  fitsSheet: 'A4' },
  { name: 'C3', width: 324, height: 458, maxThickness: 20, maxWeightG: 2000, fitsSheet: 'A3' },
];

// Fallback щільності матеріалу (г/м²) по категорії
const MATERIAL_GSM_FALLBACK = {
  'Офісний': 80,
  'Тонкий': 90,
  'Середній': 130,
  'Цупкий': 250,
  'Самоклеючі': 170,
};

// Фіксована вага для нестандартних продуктів (грами за 1 шт)
const PRODUCT_WEIGHT_OVERRIDES = {
  'Cup':       { weightGrams: 350, description: 'Чашка з коробкою' },
  'Magnets':   { weightGrams: 15,  description: 'Магніт' },
  'Scans':     { weightGrams: 0,   description: 'Скани (цифровий)' },
  'Delivery':  { weightGrams: 0,   description: 'Доставка (сервісна)' },
  'Photo':     { weightGrams: 0,   description: 'Фото (сервісна)' },
};

// Типи wide-format продуктів (розміри в метрах, не мм)
const WIDE_FORMAT_TYPES = ['Wide', 'WideFactory', 'Banner', 'Canvas', 'Vinyl'];

// Додаткова щільність при ламінації (г/м²)
const LAMINATION_EXTRA_GSM = 10;

/**
 * Парсить OrderUnit для розрахунку розмірів/ваги
 */
export function parseOrderUnitForShipping(orderUnit) {
  let options = {};
  try {
    options = orderUnit.optionsJson ? JSON.parse(orderUnit.optionsJson) : {};
  } catch (e) { /* ignore */ }

  const type = orderUnit.newField6 || options?.type || orderUnit.type || 'Unknown';
  const isWideFormat = WIDE_FORMAT_TYPES.includes(type);

  // Розміри
  let sizeX = parseFloat(options?.size?.x) || parseFloat(orderUnit.newField2) || parseFloat(orderUnit.x) || 0;
  let sizeY = parseFloat(options?.size?.y) || parseFloat(orderUnit.newField3) || parseFloat(orderUnit.y) || 0;

  // Wide format — конвертуємо з метрів в мм
  if (isWideFormat && sizeX < 100 && sizeY < 100) {
    sizeX = sizeX * 1000;
    sizeY = sizeY * 1000;
  }

  const count = parseInt(options?.count) || parseInt(orderUnit.newField5) || 1;
  const name = orderUnit.name || options?.nameOrderUnit || `${type} ${sizeX}x${sizeY}`;

  // GSM з OrderUnitUnits (paper/material)
  let gsm = 80; // default
  const units = orderUnit.OrderUnitUnits || orderUnit.OrderOrderUnits || [];
  const paperUnit = units.find(u =>
    u.type === 'Папір' || u.type === 'Плівка' ||
    ['Офісний', 'Тонкий', 'Середній', 'Цупкий', 'Самоклеючі'].includes(u.typeUse)
  );

  if (paperUnit) {
    const parsed = parseFloat(paperUnit.thickness);
    if (!isNaN(parsed) && parsed > 0) {
      gsm = parsed;
    } else if (paperUnit.typeUse && MATERIAL_GSM_FALLBACK[paperUnit.typeUse]) {
      gsm = MATERIAL_GSM_FALLBACK[paperUnit.typeUse];
    }
  }

  // Ламінація
  const hasLamination = units.some(u =>
    (u.name && u.name.toLowerCase().includes('ламін')) ||
    (u.typeUse && u.typeUse.toLowerCase().includes('ламін'))
  );

  if (hasLamination) {
    gsm += LAMINATION_EXTRA_GSM;
  }

  return { type, sizeX, sizeY, count, name, gsm, hasLamination, isWideFormat, orderUnitId: orderUnit.id };
}

/**
 * Розрахунок ваги позиції в кг
 */
export function calculatePositionWeight(parsed) {
  // Фіксована вага для спецтипів
  const override = PRODUCT_WEIGHT_OVERRIDES[parsed.type];
  if (override) {
    return (override.weightGrams * parsed.count) / 1000;
  }

  // Площа в м²
  const area_m2 = (parsed.sizeX / 1000) * (parsed.sizeY / 1000);

  // Вага: gsm × площа × кількість / 1000 (г → кг)
  return (parsed.gsm * area_m2 * parsed.count) / 1000;
}

/**
 * Оцінка товщини стопки (мм)
 * Приблизно: 1 аркуш 80gsm ≈ 0.1мм, лінійна залежність від щільності
 */
export function estimateThickness(parsed) {
  const override = PRODUCT_WEIGHT_OVERRIDES[parsed.type];
  if (override) {
    // Чашки, магніти — не підходять для конвертів
    return parsed.type === 'Cup' ? 100 * parsed.count : 5 * parsed.count;
  }

  const sheetThickness = parsed.gsm * 0.00125; // мм на аркуш
  return sheetThickness * parsed.count;
}

/**
 * Рекомендація конверта для набору позицій
 * @param {Array} items — результати parseOrderUnitForShipping
 * @param {number} safetyMargin — запас (0.15 = +15%)
 */
export function getEnvelopeRecommendation(items, safetyMargin = 0.15) {
  let maxWidth = 0;
  let maxHeight = 0;
  let totalThickness = 0;
  let totalWeightG = 0;

  for (const item of items) {
    const w = Math.min(item.sizeX, item.sizeY);
    const h = Math.max(item.sizeX, item.sizeY);
    maxWidth = Math.max(maxWidth, w);
    maxHeight = Math.max(maxHeight, h);
    totalThickness += estimateThickness(item);
    totalWeightG += calculatePositionWeight(item) * 1000;
  }

  const margin = 1 + safetyMargin;
  const safeWidth = maxWidth * margin;
  const safeHeight = maxHeight * margin;
  const safeThickness = totalThickness * margin;
  const safeWeightG = totalWeightG * margin;

  const allEnvelopes = ENVELOPES.map(env => {
    const widthOk = safeWidth <= env.width;
    const heightOk = safeHeight <= env.height;
    const thicknessOk = safeThickness <= env.maxThickness;
    const weightOk = safeWeightG <= env.maxWeightG;
    return {
      ...env,
      fits: widthOk && heightOk && thicknessOk && weightOk,
      widthOk,
      heightOk,
      thicknessOk,
      weightOk,
    };
  });

  const recommended = allEnvelopes.find(e => e.fits) || null;
  const needsParcel = !recommended;

  return {
    recommended,
    allEnvelopes,
    needsParcel,
    dimensions: {
      width: Math.round(safeWidth),
      height: Math.round(safeHeight),
      thickness: Math.round(safeThickness * 10) / 10,
    },
    weightKg: Math.round(safeWeightG / 10) / 100, // кг з 2 знаками
    weightG: Math.round(safeWeightG),
  };
}
