function doGet() {
  return HtmlService.createTemplateFromFile('K-LaserBlueDermaConsentFormAdminPannel')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("K-Laser Blue Derma Consent Form Admin Pannel")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getConsentFormData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('K-Laser Blue Derma Consent Form');
    if (!sheet) throw new Error('Sheet "K-Laser Blue Derma Consent Form" not found');
    
    const lastRow = sheet.getLastRow();
    const lastCol = 9;
    if (lastRow < 2) return JSON.stringify([]);
    
    const range = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = range.getValues();
    
    const data = values.map((row, index) => {
      let formattedTimestamp = '';
      if (row[0] instanceof Date) {
        formattedTimestamp = Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'MM/dd/yyyy');
      }
      
      let formattedDOB = '';
      if (row[3] instanceof Date) {
        formattedDOB = Utilities.formatDate(row[3], Session.getScriptTimeZone(), 'MM/dd/yyyy');
      }
      
      let formattedProcedureDate = '';
      if (row[4] instanceof Date) {
        formattedProcedureDate = Utilities.formatDate(row[4], Session.getScriptTimeZone(), 'MM/dd/yyyy');
      }
      
      return {
        rowNumber: index + 2,
        timestamp: formattedTimestamp || '',
        patientName: row[1] || '',
        icPassport: row[2] || '',
        dateOfBirth: formattedDOB || '',
        dateOfProcedure: formattedProcedureDate || '',
        practitionerName: row[5] || '',
        patientSignatureLink: row[6] || '',
        practitionerSignatureLink: row[7] || '',
        signedDocumentLink: row[8] || ''
      };
    }).reverse();
    
    return JSON.stringify(data);
  } catch (error) {
    throw new Error('Failed to fetch consent form data: ' + error.message);
  }
}




