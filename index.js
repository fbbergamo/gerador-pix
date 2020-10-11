var express = require('express')
  , bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const port = process.env.PORT || 8000;
const { Merchant } = require('steplix-emv-qrcps');
const { Constants } = Merchant;

app.post('/emvqr-static', (req, res) => {
  emvqr = Merchant.buildEMVQR();

  emvqr.setPayloadFormatIndicator("01");
  emvqr.setCountryCode("BR")
  emvqr.setMerchantCategoryCode("0000");
  emvqr.setTransactionCurrency("986");
  const merchantAccountInformation = Merchant.buildMerchantAccountInformation();
  merchantAccountInformation.setGloballyUniqueIdentifier("BR.GOV.BCB.PIX");

  const paymentSystemSpecific = Merchant.buildPaymentSystemSpecific();
  paymentSystemSpecific.setGloballyUniqueIdentifier("BR.GOV.BCB.BRCODE");
  paymentSystemSpecific.addPaymentSystemSpecific("01", "1.0.0");

  key = null;

  if (req.body.key.includes("@")) {
    key =  req.body.key.replace("@", " ").toUpperCase();
  }
  else {
    key =  req.body.key.toUpperCase();
  }

  merchantAccountInformation.addPaymentNetworkSpecific("01", key);

  emvqr.addMerchantAccountInformation("26", merchantAccountInformation);

  if (req.body.name) {
    emvqr.setMerchantName(req.body.name.toUpperCase());
  }

  if (req.body.amount) {
    emvqr.setTransactionAmount(req.body.amount);
  }

  const additionalDataFieldTemplate = Merchant.buildAdditionalDataFieldTemplate();

  if (req.body.reference) {
    additionalDataFieldTemplate.setReferenceLabel(req.body.reference);
  }

  additionalDataFieldTemplate.addPaymentSystemSpecific("50", paymentSystemSpecific);
  emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);

  res.json({ code: emvqr.generatePayload() })

});

app.listen(port, () => {
  console.log(`Starting generate pix on port ${port}!`)
});
