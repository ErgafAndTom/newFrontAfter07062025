// ============================================================================
// EntitiesText.jsx
// Рендер текста Telegram по entities
// ============================================================================

import React from "react";

export default function EntitiesText({ text, entities }) {
  if (!text) return null;
  if (!entities || entities.length === 0) return <span>{text}</span>;

  // Создаём массив символов для последующей замены
  const chars = text.split("");

  // Массив React-элементов результата
  const result = [];
  let cursor = 0;

  // Сортируем entities по offset, как в Telegram Desktop
  const sorted = [...entities].sort((a, b) => a.offset - b.offset);

  for (const ent of sorted) {
    const { offset, length } = ent;

    // добавляем текст до entity
    if (cursor < offset) {
      result.push(text.slice(cursor, offset));
    }

    const section = text.slice(offset, offset + length);
    cursor = offset + length;

    result.push(renderEntity(ent, section));
  }

  // остаток текста
  if (cursor < text.length) {
    result.push(text.slice(cursor));
  }

  return <span>{result}</span>;
}


// ============================================================================
// renderEntity
// Применяет конкретный тип entity
// ============================================================================

function renderEntity(ent, section) {
  const type = ent.type;

  switch (type) {
    case "bold":
      return <strong key={Math.random()}>{section}</strong>;

    case "italic":
      return <em key={Math.random()}>{section}</em>;

    case "underline":
      return <u key={Math.random()}>{section}</u>;

    case "strikethrough":
      return <s key={Math.random()}>{section}</s>;

    case "code":
      return (
        <code
          key={Math.random()}
          style={{
            background: "#f5f5f5",
            padding: "2px 4px",
            borderRadius: 4,
            fontFamily: "monospace",
          }}
        >
          {section}
        </code>
      );

    case "pre":
      return (
        <pre
          key={Math.random()}
          style={{
            background: "#f5f5f5",
            padding: "6px 8px",
            borderRadius: 6,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap"
          }}
        >
          {section}
        </pre>
      );

    case "texturl":
      return (
        <a
          key={Math.random()}
          href={ent.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2B7BB9", textDecoration: "none" }}
        >
          {section}
        </a>
      );

    case "url":
      return (
        <a
          key={Math.random()}
          href={section}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2B7BB9", textDecoration: "none" }}
        >
          {section}
        </a>
      );

    case "email":
      return (
        <a
          key={Math.random()}
          href={`mailto:${section}`}
          style={{ color: "#2B7BB9", textDecoration: "none" }}
        >
          {section}
        </a>
      );

    case "phone":
      return (
        <a
          key={Math.random()}
          href={`tel:${section}`}
          style={{ color: "#2B7BB9", textDecoration: "none" }}
        >
          {section}
        </a>
      );

    case "mention":
      return (
        <span
          key={Math.random()}
          style={{ color: "#2B7BB9" }}
        >
          {section}
        </span>
      );

    case "hashtag":
      return (
        <span
          key={Math.random()}
          style={{ color: "#2B7BB9" }}
        >
          {section}
        </span>
      );

    case "botcommand":
      return (
        <span
          key={Math.random()}
          style={{ color: "#2B7BB9" }}
        >
          {section}
        </span>
      );

    case "spoiler":
      return (
        <span
          key={Math.random()}
          style={{
            background: "#d0d0d0",
            color: "#d0d0d0",
            borderRadius: 4,
            cursor: "pointer",
            padding: "0 3px"
          }}
          onClick={(e) => {
            e.target.style.color = "#000";
          }}
        >
          {section}
        </span>
      );

    default:
      return <span key={Math.random()}>{section}</span>;
  }
}
