
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Generate a PDF report for mood entries
 * @param {Array} moodEntries - Array of mood entries
 * @param {Object} user - User object
 * @returns {Buffer} - PDF document as buffer
 */
exports.generatePDF = async (moodEntries, user) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page to the document
    const page = pdfDoc.addPage();
    
    // Get the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Set page dimensions
    const { width, height } = page.getSize();
    
    // Add title
    page.drawText('Weekly Mood Report', {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0.7)
    });
    
    // Add date range
    const startDate = new Date(moodEntries[0].createdAt);
    const endDate = new Date(moodEntries[moodEntries.length - 1].createdAt);
    
    page.drawText(`${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    // Add user name
    page.drawText(`Report for: ${user.name}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    // Add mood summary
    page.drawText('Mood Summary:', {
      x: 50,
      y: height - 140,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.7)
    });
    
    // Calculate mood statistics
    const averageMoodScore = calculateAverageMoodScore(moodEntries);
    const moodDistribution = calculateMoodDistribution(moodEntries);
    
    page.drawText(`Average Mood Score: ${averageMoodScore.toFixed(1)} / 10`, {
      x: 50,
      y: height - 170,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    });
    
    // Add mood distribution
    page.drawText('Mood Distribution:', {
      x: 50,
      y: height - 200,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    let yPosition = height - 220;
    Object.entries(moodDistribution).forEach(([mood, count], index) => {
      const percentage = (count / moodEntries.length * 100).toFixed(1);
      page.drawText(`${mood.charAt(0).toUpperCase() + mood.slice(1)}: ${count} entries (${percentage}%)`, {
        x: 70,
        y: yPosition - (index * 20),
        size: 12,
        font,
        color: rgb(0.1, 0.1, 0.1)
      });
    });
    
    // Add stress and energy averages
    const stressAverage = calculateAverageMetric(moodEntries, 'stress');
    const energyAverage = calculateAverageMetric(moodEntries, 'energy');
    
    yPosition = height - 350;
    
    page.drawText('Wellness Metrics:', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.7)
    });
    
    page.drawText(`Average Stress Level: ${stressAverage.toFixed(1)} / 10`, {
      x: 50,
      y: yPosition - 30,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(`Average Energy Level: ${energyAverage.toFixed(1)} / 10`, {
      x: 50,
      y: yPosition - 50,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    });
    
    // Add daily mood entries
    yPosition = height - 430;
    
    page.drawText('Daily Mood Log:', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.7)
    });
    
    yPosition -= 30;
    
    moodEntries.forEach((entry, index) => {
      const entryDate = new Date(entry.createdAt).toLocaleDateString();
      const moodCategory = entry.moodCategory.charAt(0).toUpperCase() + entry.moodCategory.slice(1);
      
      page.drawText(`${entryDate} - Mood: ${moodCategory} (${entry.moodScore}/10)`, {
        x: 50,
        y: yPosition - (index * 40),
        size: 12,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1)
      });
      
      if (entry.notes) {
        page.drawText(`Notes: ${entry.notes.substring(0, 70)}${entry.notes.length > 70 ? '...' : ''}`, {
          x: 70,
          y: yPosition - (index * 40) - 20,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3)
        });
      }
      
      // Add a new page if we're running out of space
      if (yPosition - (index * 40) - 60 < 50 && index < moodEntries.length - 1) {
        const newPage = pdfDoc.addPage();
        yPosition = newPage.getSize().height - 50;
      }
    });
    
    // Add footer
    page.drawText('Generated by Mood Health Monitor', {
      x: width - 200,
      y: 30,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

// Helper functions for PDF generation
function calculateAverageMoodScore(entries) {
  if (entries.length === 0) return 0;
  
  const sum = entries.reduce((total, entry) => total + entry.moodScore, 0);
  return sum / entries.length;
}

function calculateMoodDistribution(entries) {
  const distribution = {
    happy: 0,
    calm: 0,
    sad: 0,
    anxious: 0,
    angry: 0,
    neutral: 0
  };
  
  entries.forEach(entry => {
    if (distribution[entry.moodCategory] !== undefined) {
      distribution[entry.moodCategory]++;
    }
  });
  
  return distribution;
}

function calculateAverageMetric(entries, metric) {
  if (entries.length === 0) return 0;
  
  let validEntries = 0;
  const sum = entries.reduce((total, entry) => {
    if (entry.analysis && entry.analysis[metric] !== undefined) {
      validEntries++;
      return total + entry.analysis[metric];
    }
    return total;
  }, 0);
  
  return validEntries > 0 ? sum / validEntries : 0;
}
