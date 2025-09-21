function doGet() {
  return HtmlService.createTemplateFromFile('Dashbbaord Page')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Admin Dashboard")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getResponseCounts() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dashboard');
    if (!sheet) throw new Error('Dashboard sheet not found');
    
    const values = sheet.getRange('B2:B3').getValues();
    
    const data = {
      testimonialResponses: Number(values[0][0]) || 0,
      kLaserResponses: Number(values[1][0]) || 0,
      lastUpdated: new Date().toLocaleString()
    };
    
    return JSON.stringify(data);
    
  } catch (error) {
    return JSON.stringify({
      testimonialResponses: 0,
      kLaserResponses: 0,
      lastUpdated: 'Error loading data',
      error: error.toString()
    });
  }
}
