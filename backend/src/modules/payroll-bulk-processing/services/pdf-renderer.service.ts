import puppeteer from 'puppeteer';
import fs from 'fs';

export class PdfRendererService {
  /**
   * Renders HTML content into a PDF buffer using Puppeteer.
   */
  static async renderHtmlToPdf(html: string): Promise<Buffer> {
    const launchOptions: any = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    try {
      const browser = await puppeteer.launch(launchOptions);
      return await this._generate(browser, html);
    } catch (e) {
      console.warn("Bundled Chromium failed to launch, trying system Chrome paths...");
      
      const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
      ];
      
      let executablePath = null;
      for (const p of paths) {
        if (fs.existsSync(p)) {
          executablePath = p;
          break;
        }
      }

      if (!executablePath) {
        throw new Error("No valid Chrome/Edge installation found for PDF rendering.");
      }

      launchOptions.executablePath = executablePath;
      const browser = await puppeteer.launch(launchOptions);
      return await this._generate(browser, html);
    }
  }

  private static async _generate(browser: any, html: string): Promise<Buffer> {

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
