// ============================================================================
// formatEntities.js
// Нормализация Telegram entities
// ============================================================================

export function normalizeEntities(text, entities) {
  if (!entities || !Array.isArray(entities)) return [];

  return entities
    .map((e) => ({
      type: mapType(e.type),
      offset: e.offset ?? 0,
      length: e.length ?? 0,
      url: e.url,
      userId: e.userId
    }))
    .filter((e) => e.length > 0 && e.offset < text.length);
}


function mapType(t) {
  switch (t) {
    case "bold":
    case "italic":
    case "underline":
    case "strikethrough":
    case "code":
    case "pre":
    case "texturl":
    case "url":
    case "mention":
    case "email":
    case "phone":
    case "hashtag":
    case "botcommand":
    case "spoiler":
      return t;

    default:
      return "unknown";
  }
}
