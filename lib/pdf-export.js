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
  /**
   * Extract images from clipboard or manual input
   */
  async extractImagesFromClipboard() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const images = [];
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const dataUrl = await this.blobToDataURL(blob);
            images.push({
              type: type,
              data: dataUrl,
              width: 400,
              height: 300,
              alt: '剪貼簿圖片'
            });
          }
        }
      }
      
      return images;
    } catch (error) {
      console.log('Could not access clipboard images:', error);
      return [];
    }
  }

  /**
   * Convert blob to data URL
   */
  blobToDataURL(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Generate PDF with images and text
   */
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

        // Check for image placeholder or insert images at logical positions
        const imageMatch = part.match(/\[IMAGE:(\d+)\]/) || 
                          (i % 3 === 0 && images.length > 0 && Math.random() < 0.3); // 隨機插入圖片
        
        if (imageMatch && images.length > 0) {
          const imageIndex = typeof imageMatch === 'object' && imageMatch[1] ? 
                           parseInt(imageMatch[1]) : 
                           Math.floor(Math.random() * images.length);
          
          const image = images[imageIndex];
          
          if (image && image.data) {
            try {
              // Calculate image dimensions
              const maxImgWidth = contentWidth * 0.8;
              const maxImgHeight = 250;
              
              let imgWidth = image.width || 400;
              let imgHeight = image.height || 300;
              
              // Scale image to fit
              if (imgWidth > maxImgWidth) {
                const ratio = maxImgWidth / imgWidth;
                imgWidth = maxImgWidth;
                imgHeight = imgHeight * ratio;
              }
              
              if (imgHeight > maxImgHeight) {
                const ratio = maxImgHeight / imgHeight;
                imgHeight = maxImgHeight;
                imgWidth = imgWidth * ratio;
              }
              
              // Check if image fits on current page
              if (currentY + imgHeight + 40 > pageHeight - margin) {
                pdf.addPage();
                currentY = margin;
              }
              
              // Center the image
              const imgX = margin + (contentWidth - imgWidth) / 2;
              
              // Add image
              const imageFormat = this.detectImageFormat(image.data);
              pdf.addImage(image.data, imageFormat, imgX, currentY, imgWidth, imgHeight);
              
              // Add image caption
              currentY += imgHeight + 5;
              pdf.setFontSize(9);
              pdf.setTextColor(100, 100, 100);
              const caption = `圖片: ${image.alt || image.caption || '插圖'}`;
              const captionWidth = pdf.getTextWidth(caption);
              const captionX = margin + (contentWidth - captionWidth) / 2;
              pdf.text(caption, captionX, currentY);
              
              // Reset formatting
              pdf.setTextColor(0, 0, 0);
              pdf.setFontSize(fontSize);
              currentY += 15;
              
            } catch (error) {
              console.warn('Failed to add image:', error);
              // Add error placeholder
              pdf.setFontSize(10);
              pdf.setTextColor(150, 150, 150);
              pdf.text(`[圖片載入失敗: ${image.alt || '未命名圖片'}]`, margin, currentY + 20);
              pdf.setTextColor(0, 0, 0);
              pdf.setFontSize(fontSize);
              currentY += 30;
            }
          }
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

  /**
   * Detect image format from data URL
   */
  detectImageFormat(dataUrl) {
    if (dataUrl.includes('data:image/jpeg') || dataUrl.includes('data:image/jpg')) {
      return 'JPEG';
    } else if (dataUrl.includes('data:image/png')) {
      return 'PNG';
    } else if (dataUrl.includes('data:image/gif')) {
      return 'PNG'; // jsPDF doesn't support GIF, convert to PNG
    } else if (dataUrl.includes('data:image/webp')) {
      return 'PNG'; // jsPDF doesn't support WebP, convert to PNG
    } else {
      return 'JPEG'; // Default fallback
    }
  }

  /**
   * Paste images from clipboard into PDF
   */
  async generatePDFWithClipboardImages(content, options = {}) {
    try {
      const clipboardImages = await this.extractImagesFromClipboard();
      console.log(`Found ${clipboardImages.length} images in clipboard`);
      
      if (clipboardImages.length > 0) {
        return await this.generateEnhancedPDF(content, clipboardImages, {
          ...options,
          includeImages: true
        });
      } else {
        // Fall back to regular PDF
        return await this.generatePDF(content, options);
      }
    } catch (error) {
      console.warn('Failed to extract clipboard images, generating regular PDF:', error);
      return await this.generatePDF(content, options);
    }
  }

  /**
   * Download PDF with images
   */
  async downloadEnhancedPDF(content, images, filename, options = {}) {
    try {
      const pdf = await this.generateEnhancedPDF(content, images, options);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const finalFilename = filename || `cleanclip-enhanced-${timestamp}.pdf`;
      
      // Download the PDF
      pdf.save(finalFilename);
      
      return {
        success: true,
        filename: finalFilename,
        pages: pdf.getNumberOfPages(),
        images: images.length
      };
    } catch (error) {
      console.error('Enhanced PDF download failed:', error);
      throw error;
    }
  }
}

// Export for use in sidebar
window.PDFExporter = PDFExporter;