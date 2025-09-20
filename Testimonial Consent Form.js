function doGet() {
  return HtmlService.createTemplateFromFile('TestimonialConsentForm')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Testimonial Consent Form")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function saveTestimonialConsentForm(formData) {
  try {
    const sheetName = 'Testimonial Consent Form';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 7).setValues([[
        'Timestamp', 'Patient Name', 'Contact No.', 'Photo/Video Permission',
        'Acknowledgement Consent', 'Patient Signature Link', 'PDF Link'
      ]]);
    }

    const folderId = '1exjWvrHNGaOyio7Moxum0-u0olyHKRMk';
    const folder = DriveApp.getFolderById(folderId);

    const patientBase64Data = formData.patientSignature.split(',')[1];
    const patientBlob = Utilities.newBlob(
      Utilities.base64Decode(patientBase64Data),
      'image/png',
      `patient_signature_${formData.patientName.replace(/\s+/g, '_')}_${Date.now()}.png`
    );
    const patientFile = folder.createFile(patientBlob);
    const patientFileUrl = `https://drive.google.com/thumbnail?id=${patientFile.getId()}&sz=s4000`;

    let pdfFileUrl = '';
    if (formData.pdfBase64) {
      const pdfBlob = Utilities.newBlob(
        Utilities.base64Decode(formData.pdfBase64),
        'application/pdf',
        `Testimonial_Consent_${formData.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      );
      const pdfFile = folder.createFile(pdfBlob);
      pdfFileUrl = `https://drive.google.com/file/d/${pdfFile.getId()}/view?usp=sharing`;
    }

    sheet.appendRow([
      new Date(),
      formData.patientName,
      formData.contactNo || '',
      formData.photoVideoPermission ? 'Yes' : 'No',
      formData.acknowledgementConsent ? 'Yes' : 'No',
      patientFileUrl,
      pdfFileUrl
    ]);

    return {
      success: true,
      message: 'Form submitted successfully',
      patientFileUrl: patientFileUrl,
      pdfFileUrl: pdfFileUrl
    };

  } catch (error) {
    console.error('Error saving form:', error);
    throw new Error('Failed to save form: ' + error.toString());
  }
}
