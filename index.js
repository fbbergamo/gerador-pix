var express = require('express')
  , bodyParser = require('body-parser')
  , helmet = require('helmet')

const pino = require('pino-http')()
const app = express();

var path = require('path');
var QRCode = require('qrcode')

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

const QR_CODE_SIZE = 400;

app.post('/emvqr-static', cors(corsOptionsDelegate), (req, res) => {
  var { key, amount, name, reference, key_type, city } = req.body

  if (key) {
      var formated_key_value = formated_key(key, key_type);
      var formated_amount_value = formated_amount(amount)
      var code = generate_qrcp(formated_key_value, formated_amount_value, name, reference, city)

      QRCode.toDataURL(code, {width: QR_CODE_SIZE, height: QR_CODE_SIZE})
      .then(qrcode => {
        res.json({ qrcode_base64: qrcode, code: code, key_type: key_type, key: key, amount: amount, name: name, city: city, reference: reference, formated_amount: formated_amount_value })
      })
      .catch(err => {
        console.error(err)
      })
  }
  else {
    res.status(422);
    res.json({ error: "Campo Key não presente"});
  }
});

app.listen(port, () => {
  console.log(`Starting generate pix server on port ${port}!`)
});


formated_key = (key, key_type) => {
  var rkey = key.toUpperCase()

  if (key_type == 'Telefone' || key_type == 'CNPJ' || key_type == "CPF") {
    rkey = rkey.replace(/\D/g,'');
  }

  if (key_type == "Telefone") {
    rkey = "+55" + rkey
  }
  return rkey
}

format_text = (text) => {
  return text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

formated_amount = (amount) => {
  return amount.replace(',','.').replace(' ','').replace("R$", '')
}
generate_qrcp = (key, amount, name, reference, city) => {
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

  merchantAccountInformation.addPaymentNetworkSpecific("01", key);

  emvqr.addMerchantAccountInformation("26", merchantAccountInformation);

  if (name) {
    emvqr.setMerchantName(format_text(name));
  }

  if (city) {
    emvqr.setMerchantCity(format_text(city));
  }

  if (amount && amount != '') {
    emvqr.setTransactionAmount(format_text(amount));
  }

  const additionalDataFieldTemplate = Merchant.buildAdditionalDataFieldTemplate();

  if (reference) {
    additionalDataFieldTemplate.setReferenceLabel(format_text(reference));
  }
  else {
    additionalDataFieldTemplate.setReferenceLabel("***");
  }

  additionalDataFieldTemplate.addPaymentSystemSpecific("50", paymentSystemSpecific);
  emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);
  return emvqr.generatePayload();
}
