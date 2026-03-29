import { createWorker } from 'tesseract.js';

/**
 * OCREngine: Handles local text extraction using Tesseract.js.
 * Core CV Concepts: Segmentation, Feature Extraction, OCR Pipeline.
 */
export class OCREngine {
  /**
   * Performs local OCR on a preprocessed image buffer.
   * @param imageBuffer Buffer of the preprocessed image.
   * @returns Extracted text string.
   */
  static async extractText(imageBuffer: Buffer): Promise<string> {
    const worker = await createWorker('eng', 1, {
      logger: m => {
        // Optional: Log progress to terminal if needed
      },
      errorHandler: e => console.error(e)
    });
    
    try {
      // 1. Set Parameters for Neural Network Mode (LSTM)
      // 2. Enable Orientation and Script Detection (OSD)
      await worker.setParameters({
        tessedit_ocr_engine_mode: '1' as any, // LSTM Neural Net Mode
        tessedit_pageseg_mode: '1' as any,    // Automatic page segmentation with OSD
      });
      
      const { data: { text } } = await worker.recognize(imageBuffer);
      await worker.terminate();
      
      return text;
    } catch (error) {
      console.error('Error in Local OCR:', error);
      await worker.terminate();
      throw error;
    }
  }
}
