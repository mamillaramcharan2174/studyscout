import fs from 'fs';
import path from 'path';
import { UploadedDocument } from '../agent/types.js';

export class DocumentParser {
  // Extract text and split into semantic chunks
  static async parseFile(
    filePath: string,
    originalName: string,
    mimeType: string,
    sizeBytes: number
  ): Promise<UploadedDocument> {
    const ext = path.extname(originalName).toLowerCase();
    let extractedText = '';
    let pageCount = 1;

    try {
      if (ext === '.pdf' || mimeType.includes('pdf')) {
        const buffer = fs.readFileSync(filePath);
        try {
          // Dynamic import of pdf-parse
          const pdfParseModule: any = await import('pdf-parse');
          const pdfParse = pdfParseModule.default || pdfParseModule;
          const data = await pdfParse(buffer);
          extractedText = data.text || '';
          pageCount = data.numpages || 1;
        } catch (pdfErr) {
          console.warn('[DocParser] pdf-parse failed, using fallback stream extractor:', pdfErr);
          // Fallback text extraction for PDF
          extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
          pageCount = 1;
        }
      } else if (ext === '.docx' || mimeType.includes('wordprocessingml')) {
        const buffer = fs.readFileSync(filePath);
        try {
          const mammothModule = await import('mammoth');
          const mammoth = (mammothModule.default || mammothModule) as any;
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value || '';
        } catch (docxErr) {
          console.warn('[DocParser] mammoth failed, using fallback string parsing:', docxErr);
          extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        }
      } else {
        // Plain text, Markdown, CSV, JSON
        extractedText = fs.readFileSync(filePath, 'utf-8');
      }
    } catch (err) {
      console.error(`[DocParser] Error reading file ${originalName}:`, err);
      extractedText = `Document content for ${originalName} (Error parsing raw contents)`;
    }

    // Clean text
    const cleanText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // Chunk into paragraphs with section awareness
    const chunks = this.chunkText(cleanText, originalName, pageCount);

    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      filename: path.basename(filePath),
      originalName,
      mimeType,
      sizeBytes,
      uploadedAt: new Date().toISOString(),
      extractedText: cleanText,
      pageCount,
      chunks,
    };
  }

  // Create semantic chunks with approx 300-500 chars, preserving sentences
  private static chunkText(
    text: string,
    docName: string,
    pageCount: number
  ): Array<{ id: string; text: string; pageNumber?: number; section?: string }> {
    if (!text || text.length === 0) {
      return [{ id: `chunk-0`, text: `Empty document: ${docName}`, pageNumber: 1, section: 'Header' }];
    }

    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const chunks: Array<{ id: string; text: string; pageNumber?: number; section?: string }> = [];

    let currentSection = 'Introduction / Overview';
    let chunkIndex = 0;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const paragraph = paragraphs[pIdx].trim();

      // Check if paragraph looks like a heading
      if (
        paragraph.length < 80 &&
        (paragraph.startsWith('#') ||
          /^(section|chapter|part|\d+\.|\bmethods\b|\bresults\b|\bdiscussion\b|\babstract\b)/i.test(paragraph))
      ) {
        currentSection = paragraph.replace(/^#+\s*/, '').trim();
      }

      // If paragraph is reasonable size (100 - 800 chars), keep it as a chunk
      if (paragraph.length <= 800) {
        // Approximate page number
        const approxPage = Math.min(pageCount, Math.max(1, Math.ceil(((pIdx + 1) / paragraphs.length) * pageCount)));
        chunks.push({
          id: `chunk-${chunkIndex++}`,
          text: paragraph,
          pageNumber: approxPage,
          section: currentSection,
        });
      } else {
        // Break large paragraphs into sentence windows
        const sentences = paragraph.match(/[^.!?]+[.!?]+(\s|$)/g) || [paragraph];
        let currentWindow = '';

        for (const sentence of sentences) {
          if ((currentWindow + sentence).length > 600 && currentWindow.length > 0) {
            const approxPage = Math.min(
              pageCount,
              Math.max(1, Math.ceil(((pIdx + 1) / paragraphs.length) * pageCount))
            );
            chunks.push({
              id: `chunk-${chunkIndex++}`,
              text: currentWindow.trim(),
              pageNumber: approxPage,
              section: currentSection,
            });
            currentWindow = sentence;
          } else {
            currentWindow += sentence;
          }
        }

        if (currentWindow.trim().length > 0) {
          const approxPage = Math.min(pageCount, Math.max(1, Math.ceil(((pIdx + 1) / paragraphs.length) * pageCount)));
          chunks.push({
            id: `chunk-${chunkIndex++}`,
            text: currentWindow.trim(),
            pageNumber: approxPage,
            section: currentSection,
          });
        }
      }
    }

    return chunks.length > 0
      ? chunks
      : [{ id: `chunk-0`, text: text.substring(0, 500), pageNumber: 1, section: 'Overview' }];
  }
}
