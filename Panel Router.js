function doGet(e) {
  const validPages = {
    "DashboardTab": "Dashboard Page",
    "TestimonialConsentFormAdminPannel": "TestimonialConsentFormAdminPannel",
    "K-LaserBlueDermaConsentFormAdminPannel": "K-LaserBlueDermaConsentFormAdminPannel"
  };

  const requestedPage = e?.parameter?.page || "DashboardTab";
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
    .setTitle("Consent Forms Pannel")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
