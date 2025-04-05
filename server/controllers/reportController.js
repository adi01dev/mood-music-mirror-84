
const MoodEntry = require('../models/MoodEntry');
const { generatePDF } = require('../services/pdfService');

// @desc    Generate weekly mood report
// @route   GET /api/reports/weekly
// @access  Private
exports.generateWeeklyReport = async (req, res, next) => {
  try {
    // Get date range for last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Find mood entries within the date range
    const moodEntries = await MoodEntry.find({
      user: req.user.id,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: 1 });

    if (moodEntries.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No mood entries found for the last 7 days'
      });
    }

    // Generate PDF report
    const pdfBuffer = await generatePDF(moodEntries, req.user);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=weekly-mood-report.pdf');
    
    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
