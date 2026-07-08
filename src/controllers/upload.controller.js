import DocumentModel from "../models/documents.model.js";
import { asPlainTextDelta, tryParseJson } from "../utils/quill.utils.js";

// Upload MVP:
// - Accept multipart/form-data with field name `file`
// - Also accept JSON body { title, contentType, jsonString, rawText }
// - Convert to Quill `content` shape and store.

export const uploadDocumentFromFile = async (req, res) => {
  try {
    const { title, contentType } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title is required' });
    }

    const noOfDocuments = await DocumentModel.countDocuments({ owner: req.user.id });
    if (noOfDocuments >= 3) {
      return res.status(400).json({ message: `You can't create more than 3 documents` });
    }

    const doesDocumentExist = await DocumentModel.findOne({ title });
    if (doesDocumentExist) {
      return res.status(400).json({ message: `Document with title : ${title} already exists` });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'file is required' });
    }

    const mime = file.mimetype || '';
    const name = file.originalname || '';

    const lower = `${contentType || ''}`.toLowerCase();

    // Determine conversion strategy
    // - If JSON: parse JSON string and store directly
    // - Else: store plain text delta
    let quillContent;

    const looksLikeJson =
      lower.includes('json') ||
      mime.includes('json') ||
      name.toLowerCase().endsWith('.json');

    if (looksLikeJson) {
      const rawText = file.buffer.toString('utf-8');
      const parsed = tryParseJson(rawText);
      quillContent = parsed ? parsed : asPlainTextDelta(rawText);
    } else {
      const rawText = file.buffer.toString('utf-8');
      // MVP for doc/pdf/docx/code: treat as plain text.
      // (If encoding is not text, this will store gibberish; still prevents crashes and enables collab.)
      quillContent = asPlainTextDelta(rawText);
    }

    const newDocument = await DocumentModel.create({
      title,
      isPublic: false,
      owner: req.user.id,
      content: quillContent,
    });

    res.status(201).json({
      document: newDocument,
      message: `Document with title : ${title} uploaded successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

