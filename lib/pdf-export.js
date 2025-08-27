/**
 * PDF Export Module for CleanClip
 * Clean PDF generation without headers/footers
 */

class PDFExporter {
  constructor() {
    this.jsPDFLoaded = false;
    this.loadLibraries();
  }

  async loadLibraries() {
    if (this.jsPDFLoaded) return;
    
    try {
      // Load jsPDF
      if (!window.jsPDF) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }
      
      this.jsPDFLoaded = true;
      console.log('PDF libraries loaded successfully');
    } catch (error) {
      console.error('Failed to load PDF libraries:', error);
      throw new Error('PDF 匯出功能載入失敗');
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async generatePDF(content, options = {}) {
    await this.loadLibraries();
    
    const {
      title = '擷取內容',
      url = '',
      includeImages = false,
      fontSize = 12,
      lineHeight = 1.6
    } = options;

    try {
      // Create jsPDF instance
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // PDF dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 50;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      let currentY = margin;

      // Add title
      if (title) {
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        const titleLines = pdf.splitTextToSize(title, contentWidth);
        
        titleLines.forEach(line => {
          if (currentY + 20 > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += 20;
        });
        currentY += 10;
      }

      // Add URL source
      if (url) {
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(100, 100, 100);
        
        const urlText = `來源: ${url}`;
        const urlLines = pdf.splitTextToSize(urlText, contentWidth);
        
        urlLines.forEach(line => {
          if (currentY + 12 > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += 12;
        });
        currentY += 15;
      }

      // Reset color and font for content
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, 'normal');

      // Process content by paragraphs
      const paragraphs = content.split('\n').filter(p => p.trim());
      
      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;

        const lines = pdf.splitTextToSize(paragraph.trim(), contentWidth);
        const lineHeightPt = fontSize * lineHeight;

        // Check if we need a new page
        const requiredHeight = lines.length * lineHeightPt;
        if (currentY + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        // Add paragraph lines
        lines.forEach(line => {
          pdf.text(line, margin, currentY);
          currentY += lineHeightPt;
        });

        // Add paragraph spacing
        currentY += lineHeightPt * 0.5;
      }

      // Add footer with generation info
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        
        const footerText = `由 CleanClip 產生 - 第 ${i} 頁，共 ${totalPages} 頁`;
        const footerWidth = pdf.getTextWidth(footerText);
        const footerX = (pageWidth - footerWidth) / 2;
        
        pdf.text(footerText, footerX, pageHeight - 20);
      }

      return pdf;
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`PDF 產生失敗: ${error.message}`);
    }
  }

  async downloadPDF(content, filename, options = {}) {
    try {
      const pdf = await this.generatePDF(content, options);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const finalFilename = filename || `cleanclip-pdf-${timestamp}.pdf`;
      
      // Download the PDF
      pdf.save(finalFilename);
      
      return {
        success: true,
        filename: finalFilename,
        pages: pdf.getNumberOfPages()
      };
    } catch (error) {
      console.error('PDF download failed:', error);
      throw error;
    }
  }

  // Enhanced PDF with basic images support
  async generateEnhancedPDF(content, images = [], options = {}) {
    await this.loadLibraries();
    
    const {
      title = '擷取內容',
      url = '',
      fontSize = 12,
      lineHeight = 1.6
    } = options;

    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 50;
      const contentWidth = pageWidth - (margin * 2);
      
      let currentY = margin;

      // Add title and URL (same as before)
      if (title) {
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        const titleLines = pdf.splitTextToSize(title, contentWidth);
        titleLines.forEach(line => {
          if (currentY + 20 > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += 20;
        });
        currentY += 10;
      }

      if (url) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        const urlLines = pdf.splitTextToSize(`來源: ${url}`, contentWidth);
        urlLines.forEach(line => {
          if (currentY + 12 > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += 12;
        });
        currentY += 15;
      }

      // Reset formatting
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, 'normal');

      // Process content with potential image placeholders
      const contentParts = content.split('\n').filter(p => p.trim());
      
      for (let i = 0; i < contentParts.length; i++) {
        const part = contentParts[i].trim();
        if (!part) continue;

        // Check for image placeholder
        const imageMatch = part.match(/\[IMAGE:(\d+)\]/);
        if (imageMatch && images[parseInt(imageMatch[1])]) {
          const image = images[parseInt(imageMatch[1])];
          
          try {
            // Add image (basic support)
            const imgHeight = 200; // Fixed height for simplicity
            const imgWidth = Math.min(contentWidth, image.width || 400);
            
            if (currentY + imgHeight > pageHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }
            
            // Add image (would need actual image data)
            // pdf.addImage(image.data, 'JPEG', margin, currentY, imgWidth, imgHeight);
            
            // For now, add placeholder text
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`[圖片: ${image.alt || '未命名圖片'}]`, margin, currentY + 20);
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(fontSize);
            
            currentY += imgHeight + 10;
          } catch (error) {
            console.warn('Failed to add image:', error);
            // Continue without image
          }
        } else {
          // Regular text content
          const lines = pdf.splitTextToSize(part, contentWidth);
          const lineHeightPt = fontSize * lineHeight;
          const requiredHeight = lines.length * lineHeightPt;
          
          if (currentY + requiredHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }

          lines.forEach(line => {
            pdf.text(line, margin, currentY);
            currentY += lineHeightPt;
          });
          
          currentY += lineHeightPt * 0.5;
        }
      }

      // Add footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        
        const footerText = `由 CleanClip 產生 - 第 ${i} 頁，共 ${totalPages} 頁`;
        const footerWidth = pdf.getTextWidth(footerText);
        const footerX = (pageWidth - footerWidth) / 2;
        
        pdf.text(footerText, footerX, pageHeight - 20);
      }

      return pdf;
    } catch (error) {
      console.error('Enhanced PDF generation failed:', error);
      throw new Error(`增強PDF產生失敗: ${error.message}`);
    }
  }
}

// Export for use in sidebar
window.PDFExporter = PDFExporter;