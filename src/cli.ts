import dotenv from 'dotenv';
// Load environment variables as early as possible
dotenv.config();

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { ImageProcessor } from './services/imageProcessor.js';
import { OCREngine } from './services/ocrEngine.js';
import { analyzeDocument, DocAnalysis, askQuestion, compareDocuments } from './services/geminiService.js';

const program = new Command();

program
  .name('docvision-cli')
  .description('Neural Document Intelligence CLI Tool')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a document image (CV Preprocessing + Local OCR + Optional AI)')
  .argument('<file>', 'path to the document image file')
  .option('-o, --output <path>', 'path to save the analysis JSON result')
  .option('-v, --verbose', 'print full analysis details')
  .action(async (file, options) => {
    try {
      const absolutePath = path.resolve(file);
      if (!fs.existsSync(absolutePath)) {
        console.error(chalk.red(`Error: File not found at ${absolutePath}`));
        process.exit(1);
      }

      console.log(chalk.blue(`\n[DocVision X] Initializing Neural Pipeline...`));
      console.log(chalk.gray(`Target: ${path.basename(absolutePath)}`));

      // 1. CV Preprocessing (Optimization for AI)
      console.log(chalk.yellow(`[DocVision X] Step 1: Neural-Optimization (Preprocessing)...`));
      const preprocessedBuffer = await ImageProcessor.preprocessForOCR(absolutePath);
      const base64Image = preprocessedBuffer.toString('base64');
      
      // 2. Neural Analysis (Gemini)
      console.log(chalk.yellow(`[DocVision X] Step 2: Deep Neural Scan (Gemini AI)...`));
      const analysis: DocAnalysis = await analyzeDocument(base64Image);

      console.log(chalk.green(`\n[DocVision X] Neural Analysis Complete!\n`));
      
      // Full Text Content (First)
      console.log(chalk.bold.underline(`FULL DOCUMENT CONTENT`));
      if (analysis.text && analysis.text.trim().length > 0) {
        console.log(chalk.white(analysis.text));
      } else {
        console.log(chalk.red(`[DocVision X] Warning: No text content was transcribed by the AI.`));
        console.log(chalk.gray(`(This can happen if the image is too blurry or the text is illegible.)`));
      }
      console.log('');

      // Summary
      console.log(chalk.bold.underline(`NEURAL SUMMARY`));
      console.log(`${chalk.bold('Type:')} ${analysis.type || 'Unknown'}`);
      console.log(`${chalk.bold('Confidence:')} ${chalk.green(Math.round((analysis.confidence || 0) * 100) + '%')}`);
      console.log(`${chalk.bold('Readability:')} ${analysis.readabilityScore || 0}/100`);
      console.log(`${chalk.bold('Language:')} ${analysis.language || 'Unknown'}`);
      console.log(`${chalk.bold('Smart Action:')} ${chalk.cyan(analysis.smartAction || 'None')}`);
      console.log(`\n${chalk.italic(analysis.summary || 'No summary available.')}\n`);

      // Forgery Scan
      if (analysis.tamperAnalysis) {
        console.log(chalk.bold.underline(`FORGERY SCAN`));
        const riskColor = analysis.tamperAnalysis.riskLevel === 'High' ? chalk.red : analysis.tamperAnalysis.riskLevel === 'Moderate' ? chalk.yellow : chalk.green;
        console.log(`${chalk.bold('Risk Level:')} ${riskColor(analysis.tamperAnalysis.riskLevel || 'Low')}`);
        console.log(`${chalk.bold('Risk Score:')} ${riskColor((analysis.tamperAnalysis.riskScore || 0) + '/100')}`);
        console.log(`${chalk.bold('Explanation:')} ${analysis.tamperAnalysis.explanation || 'No explanation provided.'}`);
        
        if (analysis.tamperAnalysis.signals && analysis.tamperAnalysis.signals.length > 0) {
          console.log(chalk.bold('\nSuspicious Signals:'));
          analysis.tamperAnalysis.signals.forEach((signal, i) => {
            console.log(`  ${i + 1}. ${chalk.red(signal.reason)} (Conf: ${Math.round((signal.confidence || 0) * 100)}%)`);
          });
        }
        console.log('');
      }

      // Field Extraction
      if (analysis.extractedFields) {
        console.log(chalk.bold.underline(`SMART FIELD EXTRACTION`));
        console.log(`${chalk.bold('Total Fields:')} ${analysis.extractedFields.summary?.field_count || 0}`);
        console.log(`${chalk.bold('High Confidence:')} ${chalk.green(analysis.extractedFields.summary?.high_confidence_fields || 0)}`);
        
        if (options.verbose || (analysis.extractedFields.fields && analysis.extractedFields.fields.length > 0)) {
          console.log('\nExtracted Fields:');
          (analysis.extractedFields.fields || []).forEach((field) => {
            const confColor = (field.confidence || 0) > 0.8 ? chalk.green : (field.confidence || 0) > 0.5 ? chalk.yellow : chalk.red;
            console.log(`  - ${chalk.bold(field.name)}: ${chalk.blue(field.value)} (${confColor(Math.round((field.confidence || 0) * 100) + '%')})`);
          });
        }
        console.log('');
      }

      // Layout
      if (options.verbose && analysis.layoutAnalysis) {
        console.log(chalk.bold.underline(`LAYOUT INTELLIGENCE`));
        console.log(`${chalk.bold('Headers:')} ${analysis.layoutAnalysis.counts?.headers || 0}`);
        console.log(`${chalk.bold('Paragraphs:')} ${analysis.layoutAnalysis.counts?.paragraphs || 0}`);
        console.log(`${chalk.bold('Tables:')} ${analysis.layoutAnalysis.counts?.tables || 0}`);
        console.log(`${chalk.bold('Signatures:')} ${analysis.layoutAnalysis.counts?.signatures || 0}`);
        console.log('');
      }

      // Output to file
      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
        console.log(chalk.magenta(`Analysis saved to: ${outputPath}`));
      }

    } catch (error) {
      console.error(chalk.red(`\n[DocVision X] Fatal Error:`));
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('ask')
  .description('Ask a question about a document')
  .argument('<file>', 'path to the document image file')
  .argument('<question>', 'the question to ask')
  .action(async (file, question) => {
    try {
      const absolutePath = path.resolve(file);
      if (!fs.existsSync(absolutePath)) {
        console.error(chalk.red(`Error: File not found at ${absolutePath}`));
        process.exit(1);
      }

      console.log(chalk.blue(`\n[DocVision X] Processing Document Context...`));
      const fileBuffer = fs.readFileSync(absolutePath);
      const base64Image = fileBuffer.toString('base64');

      console.log(chalk.yellow(`[DocVision X] Question: ${question}`));
      const answer = await askQuestion(base64Image, question);

      console.log(chalk.green(`\n[DocVision X] Answer:`));
      console.log(answer);
      console.log('');

    } catch (error) {
      console.error(chalk.red(`\n[DocVision X] Fatal Error:`));
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('compare')
  .description('Compare two document images')
  .argument('<file1>', 'path to the first document image file')
  .argument('<file2>', 'path to the second document image file')
  .action(async (file1, file2) => {
    try {
      const path1 = path.resolve(file1);
      const path2 = path.resolve(file2);

      if (!fs.existsSync(path1) || !fs.existsSync(path2)) {
        console.error(chalk.red(`Error: One or both files not found.`));
        process.exit(1);
      }

      console.log(chalk.blue(`\n[DocVision X] Initializing Dual Neural Scan...`));
      const img1 = fs.readFileSync(path1).toString('base64');
      const img2 = fs.readFileSync(path2).toString('base64');

      console.log(chalk.yellow(`[DocVision X] Comparing documents...`));
      const comparison = await compareDocuments(img1, img2);

      console.log(chalk.green(`\n[DocVision X] Comparison Result:`));
      console.log(`${chalk.bold('Similarity Score:')} ${chalk.green(comparison.score + '%')}`);
      
      console.log(chalk.bold('\nKey Differences:'));
      comparison.differences.forEach(diff => console.log(`  - ${diff}`));
      
      console.log(chalk.bold('\nCommon Elements:'));
      comparison.commonElements.forEach(common => console.log(`  - ${common}`));
      console.log('');

    } catch (error) {
      console.error(chalk.red(`\n[DocVision X] Fatal Error:`));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();
