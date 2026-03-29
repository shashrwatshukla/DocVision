import sharp from 'sharp';

/**
 * ImageProcessor: Handles Computer Vision preprocessing tasks using sharp (OpenCV-like).
 * Core CV Concepts: Grayscale, Denoising, Thresholding, Resizing.
 */
export class ImageProcessor {
  /**
   * Preprocesses a document image for optimal OCR results.
   * @param inputPath Path to the raw image.
   * @returns Buffer of the preprocessed image.
   */
  static async preprocessForOCR(inputPath: string): Promise<Buffer> {
    try {
      // 1. Image Acquisition & Resizing
      // We upscale to 3500px to ensure character features are large enough for the neural net.
      const image = sharp(inputPath);
      
      // 2. Advanced Document Normalization Pipeline (Neural-Friendly)
      const processedBuffer = await image
        .resize({ height: 3000, withoutEnlargement: true })
        .grayscale()
        // Pass 1: CLAHE (Contrast Limited Adaptive Histogram Equalization)
        // This fixes uneven lighting while preserving character textures.
        .clahe({ width: 30, height: 30, maxSlope: 3 })
        // Pass 2: Gamma correction to darken the ink strokes
        .gamma(2.2)
        // Pass 3: Normalization to stretch the histogram
        .normalize()
        // Pass 4: Subtle sharpening to define edges without creating artifacts
        .sharpen({ sigma: 1.2 })
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      console.error('Error in CV Preprocessing:', error);
      throw error;
    }
  }

  /**
   * Extracts basic features like image dimensions and color profile.
   */
  static async getMetadata(inputPath: string) {
    return await sharp(inputPath).metadata();
  }
}
