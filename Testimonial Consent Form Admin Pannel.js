function doGet() {
  return HtmlService.createTemplateFromFile('TestimonialConsentFormAdminPannel')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Testimonial Consent Form Admin Pannel")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getTestimonialData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Testimonial Consent Form');
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) {
      return JSON.stringify([]);
    }
    const range = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, 7));
    const values = range.getValues();
    const data = values.map((row, index) => {
      return {
        rowNumber: index + 2,
        timestamp: row[0] || '',
        patientName: row[1] || '',
        contactNo: row[2] || '',
        photoVideoPermission: row[3] || '',
        acknowledgementConsent: row[4] || '',
        patientSignatureLink: row[5] || '',
        signedDocumentLink: row[6] || ''
      };
    });
    
    const reversedData = data.reverse();
    
    return JSON.stringify(reversedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data: ' + error.message);
  }
}


