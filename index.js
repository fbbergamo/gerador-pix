var express = require('express')
  , bodyParser = require('body-parser')
  , helmet = require('helmet')

const pino = require('pino-http')()
const app = express();
var path = require('path');

app.use(helmet());
app.use(pino);
app.use(bodyParser.json());
app.use(express.static('website/public'))

const port = process.env.PORT || 8000;
const { Merchant } = require('steplix-emv-qrcps');
const { Constants } = Merchant;

var cors = require('cors')

var allowlist = ['http://localhost', 'https://gerador-pix.herokuapp.com']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/website/public/index.html'));
});

app.post('/emvqr-static', cors(corsOptionsDelegate), (req, res) => {
  var { key, amount, name, reference } = req.body

  if (key) {
      res.json({ code: generate_qrcp(key, amount, name, reference)})
  }
  else {
    res.status(422);
    res.json({ error: "Campo Key não presente"});
  }
});

app.listen(port, () => {
  console.log(`Starting generate pix on port ${port}!`)
});

generate_qrcp = (key, amount, name, reference) => {
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


  if (key.includes("@")) {
    key =  key.replace("@", " ").toUpperCase();
  }
  else {
    key =  key.toUpperCase();
  }

  merchantAccountInformation.addPaymentNetworkSpecific("01", key);

  emvqr.addMerchantAccountInformation("26", merchantAccountInformation);

  if (name) {
    emvqr.setMerchantName(name.toUpperCase());
  }

  if (amount) {
    emvqr.setTransactionAmount(amount);
  }

  const additionalDataFieldTemplate = Merchant.buildAdditionalDataFieldTemplate();

  if (reference) {
    additionalDataFieldTemplate.setReferenceLabel(reference);
  }

  additionalDataFieldTemplate.addPaymentSystemSpecific("50", paymentSystemSpecific);
  emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);
  return emvqr.generatePayload();
}
