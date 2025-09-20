function doGet() {
  return HtmlService.createTemplateFromFile('K-LaserBlueDermaConsentForm')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("K-Laser Blue Derma Consent Form")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function saveConsentForm(formData) {
  try {
    const sheetName = 'K-Laser Blue Derma Consent Form';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp', 'Patient Name', 'IC/Passport Number', 'Date of Birth',
        'Date of Procedure', 'Practitioner Name', 'Patient Signature Link', 
        'Practitioner Signature Link'
      ]]);
    }

    const driveId = '1exjWvrHNGaOyio7Moxum0-u0olyHKRMk';
    const folder = DriveApp.getFolderById(driveId);

    const patientBase64Data = formData.patientSignature.split(',')[1];
    const patientBlob = Utilities.newBlob(
      Utilities.base64Decode(patientBase64Data),
      'image/png',
      `patient_signature_${formData.patientName.replace(/\s+/g, '_')}_${new Date().getTime()}.png`
    );

    const patientFile = folder.createFile(patientBlob);
    const patientFileId = patientFile.getId();
    const patientFileUrl = `https://drive.google.com/thumbnail?id=${patientFileId}&sz=s4000`;

    let practitionerFileUrl = '';
    if (formData.practitionerSignature) {
      const practitionerBase64Data = formData.practitionerSignature.split(',')[1];
      const practitionerBlob = Utilities.newBlob(
        Utilities.base64Decode(practitionerBase64Data),
        'image/png',
        `practitioner_signature_${formData.practitionerName.replace(/\s+/g, '_')}_${new Date().getTime()}.png`
      );

      const practitionerFile = folder.createFile(practitionerBlob);
      const practitionerFileId = practitionerFile.getId();
      practitionerFileUrl = `https://drive.google.com/thumbnail?id=${practitionerFileId}&sz=s4000`;
    }

    sheet.appendRow([
      new Date(),
      formData.patientName,
      formData.icPassport,
      formData.dateOfBirth,
      formData.dateOfProcedure,
      formData.practitionerName,
      patientFileUrl,
      practitionerFileUrl
    ]);

    return {
      success: true,
      message: 'Form submitted successfully',
      patientFileUrl: patientFileUrl,
      practitionerFileUrl: practitionerFileUrl
    };

  } catch (error) {
    console.error('Error saving form:', error);
    throw new Error('Failed to save form: ' + error.toString());
  }
}

