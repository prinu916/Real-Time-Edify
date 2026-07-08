// Helpers to convert incoming upload/text into Quill `content`.

// For your current editor, loading is done via:
//   quill.setContents(document)
// where `document` is what backend returns as `document`.
// This project stores the Quill delta/content in `DocumentModel.content`.

export const asPlainTextDelta = (text) => {
  const safe = typeof text === 'string' ? text : String(text ?? '');
  // Quill delta format: { ops: [{ insert: '...' }] }
  return { ops: [{ insert: safe }] };
};

export const tryParseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

