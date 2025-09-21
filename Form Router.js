function doGet(e) {
  const validPages = {
    "MainDirectory": "MainDirectory",
    "TestimonialConsentForm": "TestimonialConsentForm",
    "K-LaserBlueDermaConsentForm": "K-LaserBlueDermaConsentForm"
  };

  const requestedPage = e?.parameter?.page || "MainDirectory";
  let page = validPages[requestedPage] || "404";

  const url = ScriptApp.getService().getUrl();

  let template;
  try {
    template = HtmlService.createTemplateFromFile(page);
  } catch (err) {
    template = HtmlService.createTemplateFromFile("404");
  }

  template.baseUrl = url;

  return template.evaluate()
    .setTitle("Concent Forms Pannel")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
