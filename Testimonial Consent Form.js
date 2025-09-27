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
      sheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp',
        'Patient Name',
        'Contact No.',
        'Photo/Video Permission',
        'Acknowledgement Consent',
        'Patient Signature Link',
        'PDF Link',
        'Patient Email'
      ]]);
    }

    const folderId = '1t4fPHHJdsofNoLcn5gcMa98jTHizJtmO';
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
    let pdfBlob = null;
    if (formData.pdfBase64) {
      pdfBlob = Utilities.newBlob(
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
      pdfFileUrl,
      formData.patientEmail || ''
    ]);

    if (pdfBlob && formData.patientEmail) {
      sendEmailWithAttachmentTestimonial(formData, pdfBlob);
    }

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

function sendEmailWithAttachmentTestimonial(formData, pdfBlob) {
  const subject = `Your Testimonial Consent Form - ${formData.patientName}`;
  
  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #c53e5c, #a8334a); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Testimonial Consent Form</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Dear <strong>${formData.patientName}</strong>,</p>
            
            <p>Thank you for providing your consent for the testimonial and educational use of your experience with K-Laser treatment.</p>
            
            <p>This email confirms that we have received your consent form with the following details:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Patient Name:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formData.patientName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Contact Number:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formData.contactNo || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Photo/Video Consent:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formData.photoVideoPermission ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Acknowledgement Consent:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formData.acknowledgementConsent ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Submission Date:</strong></td>
                  <td style="padding: 8px 0;">${new Date().toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            <p>Attached to this email is a PDF copy of your signed consent form for your records.</p>
            
            <p>If you have any questions or need to make changes to your consent, please contact us at your earliest convenience.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
              <p style="font-size: 14px; color: #718096;">
                Best regards,<br>
                <strong>Photomedic Solutions Sdn Bhd</strong><br>
                <em>Thank you for choosing K-Laser treatment</em>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const plainBody = `
Thank you for providing your consent for the testimonial and educational use of your experience with K-Laser treatment.

This email confirms that we have received your consent form with the following details:

Patient Name: ${formData.patientName}
Contact Number: ${formData.contactNo || 'Not provided'}
Photo/Video Consent: ${formData.photoVideoPermission ? 'Yes' : 'No'}
Acknowledgement Consent: ${formData.acknowledgementConsent ? 'Yes' : 'No'}
Submission Date: ${new Date().toLocaleDateString()}

Attached to this email is a PDF copy of your signed consent form for your records.

If you have any questions or need to make changes to your consent, please contact us at your earliest convenience.

Best regards,
Photomedic Solutions Sdn Bhd
Thank you for choosing K-Laser treatment
  `;

  MailApp.sendEmail({
    to: formData.patientEmail,
    subject: subject,
    htmlBody: htmlBody,
    body: plainBody,
    attachments: [pdfBlob],
    name: 'Photomedic Solutions Sdn Bhd'
  });
}
