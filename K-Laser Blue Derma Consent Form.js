function doGet() {
  return HtmlService.createTemplateFromFile('K-LaserBlueDermaConsentForm')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("K-Laser Blue Derma Consent Form")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function saveTreatmentConsentForm(formData) {
  try {
    const sheetName = 'K-Laser Blue Derma Consent Form';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 10).setValues([[
        'Timestamp', 'Patient Name', 'IC/Passport Number', 'Date of Birth',
        'Date of Procedure', 'Practitioner Name',
        'Patient Signature Link', 'Practitioner Signature Link',
        'Consent PDF Link', 'Patient Email', 'Contact Number' 
      ]]);
    }

    const now = new Date();
    const folder = DriveApp.getFolderById('1t4fPHHJdsofNoLcn5gcMa98jTHizJtmO');

    const patientBase64Data = formData.patientSignature.split(',')[1];
    const patientBlob = Utilities.newBlob(
      Utilities.base64Decode(patientBase64Data),
      'image/png',
      `patient_signature_${formData.patientName.replace(/\s+/g, '_')}_${now.getTime()}.png`
    );
    const patientFile = folder.createFile(patientBlob);
    const patientFileUrl = patientFile.getUrl();

    let practitionerFileUrl = '';
    if (formData.practitionerSignature) {
      const practitionerBase64Data = formData.practitionerSignature.split(',')[1];
      const practitionerBlob = Utilities.newBlob(
        Utilities.base64Decode(practitionerBase64Data),
        'image/png',
        `practitioner_signature_${formData.practitionerName.replace(/\s+/g, '_')}_${now.getTime()}.png`
      );
      const practitionerFile = folder.createFile(practitionerBlob);
      practitionerFileUrl = practitionerFile.getUrl();
    }

    let pdfFileUrl = '';
    let pdfFile = null;
    if (formData.pdfFile) {
      const pdfBase64Data = formData.pdfFile.split(',')[1];
      const pdfBlob = Utilities.newBlob(
        Utilities.base64Decode(pdfBase64Data),
        'application/pdf',
        `ConsentForm_${formData.patientName.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`
      );
      pdfFile = folder.createFile(pdfBlob);
      pdfFileUrl = pdfFile.getUrl();
    }

    const newRow = [[
      now,
      formData.patientName,
      formData.icPassport,
      formData.dateOfBirth,
      formData.dateOfProcedure,
      formData.practitionerName,
      patientFileUrl,
      practitionerFileUrl,
      pdfFileUrl,
      formData.patientEmail,
      formData.patientContact
    ]];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, newRow[0].length).setValues(newRow);

    if (formData.patientEmail && pdfFile) {
      sendEmailWithAttachment(formData.patientEmail, formData.patientName, pdfFile);
    }

    return {
      success: true,
      message: 'Form submitted successfully',
      pdfFileUrl: pdfFileUrl
    };

  } catch (error) {
    console.error('Error saving form:', error);
    throw new Error('Failed to save form: ' + error.toString());
  }
}

function sendEmailWithAttachment(patientEmail, patientName, pdfFile) {
  try {
    const subject = `Your K-Laser Blue Derma Consent Form - ${patientName}`;
    
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #c53e5c, #a8334a); padding: 30px; text-align: center; color: white; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">K-Laser Blue Derma</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Informed Consent for Non-Surgical Blepharoplasty</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #c53e5c; margin-top: 0;">Dear ${patientName},</h2>
              
              <p>Thank you for completing the consent form for your non-surgical blepharoplasty procedure using K-Laser Blue Derma.</p>
              <p>Attached to this email, you will find a copy of your signed consent form for your records.</p>
              
              <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">Important Information:</h3>
                <ul style="margin-bottom: 0;">
                  <li>Keep this document for your records</li>
                  <li>Follow the pre- and post-treatment instructions provided by your practitioner</li>
                  <li>Contact your practitioner if you have any questions or concerns</li>
                </ul>
              </div>
              
              <p>If you have any questions about your upcoming procedure, please don't hesitate to contact your practitioner.</p>
              
              <p>Best regards,<br>
              <strong>The K-Laser Blue Derma Team</strong></p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="font-size: 12px; color: #666;">
                This email was automatically generated. Please do not reply to this email address.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    MailApp.sendEmail({
      to: patientEmail,
      subject: subject,
      htmlBody: htmlBody,
      attachments: [pdfFile.getAs(MimeType.PDF)]
    });

  } catch (error) {
    console.error('Error sending email:', error);
  }
}


