import React, { useState, useEffect } from "react";
import { useUserSettings } from "../../../hooks/useUserSettings";
import { DEFAULT_BLEEDS, normalizeBleed } from "../../../utils/calcBleeds";
import { Segmented, Card, Row } from "./ProfileSettingsUi";

const STORAGE_KEY = "printpeaks_material_sort";

const SORT_OPTIONS = [
  { column: "id",        label: "ID",             hint: "порядок створення" },
  { column: "article",   label: "Артикул" },
  { column: "name",      label: "Назва" },
  { column: "createdAt", label: "Дата створення" },
];

const DEFAULT_SORT = { column: "id", reverse: false };

function readSort() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SORT };
    const parsed = JSON.parse(raw);
    return {
      column: SORT_OPTIONS.some((o) => o.column === parsed?.column) ? parsed.column : "id",
      reverse: !!parsed?.reverse,
    };
  } catch (e) {
    return { ...DEFAULT_SORT };
  }
}

export default function InterfaceSettings() {
  return (
    <>
      <MaterialSortSettings />
      <BleedSettings />
    </>
  );
}

function MaterialSortSettings() {
  const [sort, setSort] = useState(readSort);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sort));
  }, [sort]);

  const isDefault = sort.column === DEFAULT_SORT.column && sort.reverse === DEFAULT_SORT.reverse;
  const current = SORT_OPTIONS.find((o) => o.column === sort.column);

  return (
    <Card
      title="Сортування матеріалів"
      desc="Порядок паперу й інших матеріалів у списках вибору всіх калькуляторів (Black & White, Digital Print, Photo, Wide Photo тощо). Діє з наступного відкриття калькулятора."
      foot={
        <>
          <span className="pps-note">
            Зараз: {current?.label}{current?.hint ? ` (${current.hint})` : ""}, {sort.reverse ? "за спаданням" : "за зростанням"}
          </span>
          <button
            type="button"
            className="pps-btn pps-btn--danger pps-btn--sm"
            onClick={() => setSort({ ...DEFAULT_SORT })}
            disabled={isDefault}
            title="Повернути сортування за ID за зростанням"
          >
            <span>Скинути</span>
          </button>
        </>
      }
    >
      <Row label="Сортувати за" hint="Поле, за яким упорядковується список">
        <Segmented
          label="Сортувати за"
          value={sort.column}
          onChange={(column) => setSort((p) => ({ ...p, column }))}
          options={SORT_OPTIONS.map((o) => ({
            value: o.column,
            label: o.label,
            title: o.hint ? `${o.label} — ${o.hint}` : o.label,
          }))}
        />
      </Row>
      <Row label="Напрямок" hint="Від меншого до більшого або навпаки">
        <Segmented
          label="Напрямок"
          value={sort.reverse}
          onChange={(reverse) => setSort((p) => ({ ...p, reverse }))}
          options={[
            { value: false, label: "↑ За зростанням" },
            { value: true,  label: "↓ За спаданням" },
          ]}
        />
      </Row>
    </Card>
  );
}

const BLEED_ROWS = [
  { key: "digital",      label: "Цифровий друк", note: "Відступ між виробами на аркуші цифрового друку" },
  { key: "vishichka",    label: "Висічка",       note: "Плотер: висічка і стікерпаки" },
  { key: "porizka",      label: "Плотерна порізка", note: "Плотер: порізка окремими виробами" },
  { key: "porizkaMarks", label: "Запас під мітки", note: "Плотерна порізка: поле, яке забирають мітки окремо зверху і знизу аркуша" },
];

const PRINT_MARGIN_ROWS = [
  { key: "printMargin", label: "З кожного боку", note: "Незадруковувана рамка машини. Віднімається лише для аркушів від SRA3: 320×450 → 310×440, 330×488 → 320×478" },
];

const BLEED_KEYS = BLEED_ROWS.map((r) => r.key);
const MARGIN_KEYS = PRINT_MARGIN_ROWS.map((r) => r.key);

function BleedSettings() {
  const { settings, setSettings } = useUserSettings("calc_bleeds", DEFAULT_BLEEDS);
  // поле може бути тимчасово порожнім, поки користувач набирає число
  const [draft, setDraft] = useState(null);
  const values = draft || settings;

  const handleChange = (key, raw) => {
    const next = { ...values, [key]: raw };
    setDraft(next);
    const n = normalizeBleed(raw, null);
    if (n !== null) setSettings({ ...settings, [key]: n });
  };

  // скидаємо лише свою групу — бліди не чіпають поля друку і навпаки
  const resetKeys = (keys) => {
    setDraft(null);
    const next = { ...settings };
    keys.forEach((k) => { next[k] = DEFAULT_BLEEDS[k]; });
    setSettings(next);
  };

  const isDefault = (keys) => keys.every((k) => Number(settings[k] ?? DEFAULT_BLEEDS[k]) === DEFAULT_BLEEDS[k]);

  const renderRow = (row) => {
    const saved = settings[row.key] ?? DEFAULT_BLEEDS[row.key];
    const changed = Number(saved) !== DEFAULT_BLEEDS[row.key];
    return (
      <Row key={row.key} label={row.label} hint={row.note}>
        <label className="pps-num">
          <input
            type="number"
            min={0}
            max={50}
            step={0.5}
            inputMode="decimal"
            aria-label={`${row.label}, мм`}
            value={values[row.key] ?? DEFAULT_BLEEDS[row.key] ?? ""}
            onChange={(e) => handleChange(row.key, e.target.value)}
            onBlur={() => setDraft(null)}
          />
          <span className="pps-num-unit">мм</span>
        </label>
        <span className={`pps-default${changed ? " is-changed" : ""}`}>
          {changed ? `змінено · типово ${DEFAULT_BLEEDS[row.key]} мм` : "типове значення"}
        </span>
      </Row>
    );
  };

  const fmt = (keys) => keys.map((k) => DEFAULT_BLEEDS[k]).join(" / ");

  return (
    <>
      <Card
        title="Бліди"
        desc="Відступ між виробами на аркуші при розкладці. Впливає на кількість виробів на аркуші, а отже й на ціну."
        foot={
          <>
            <span className="pps-note">Зберігається автоматично · від 0 до 50 мм, крок 0,5</span>
            <button
              type="button"
              className="pps-btn pps-btn--danger pps-btn--sm"
              onClick={() => resetKeys(BLEED_KEYS)}
              disabled={isDefault(BLEED_KEYS)}
              title={`Повернути типові бліди: ${fmt(BLEED_KEYS)} мм`}
            >
              <span>Скинути бліди ({fmt(BLEED_KEYS)} мм)</span>
            </button>
          </>
        }
      >
        {BLEED_ROWS.map(renderRow)}
      </Card>

      <Card
        title="Поля друку"
        desc="Поле по краю аркуша, на якому машина не друкує. Склад веде аркуші у фізичному форматі, а вироби розкладаються лише в друкованій площі всередині полів."
        foot={
          <>
            <span className="pps-note">Зберігається автоматично</span>
            <button
              type="button"
              className="pps-btn pps-btn--danger pps-btn--sm"
              onClick={() => resetKeys(MARGIN_KEYS)}
              disabled={isDefault(MARGIN_KEYS)}
              title={`Повернути типові поля: ${fmt(MARGIN_KEYS)} мм`}
            >
              <span>Скинути поля ({fmt(MARGIN_KEYS)} мм)</span>
            </button>
          </>
        }
      >
        {PRINT_MARGIN_ROWS.map(renderRow)}
      </Card>
    </>
  );
}
