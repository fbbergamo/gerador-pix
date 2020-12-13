var express = require('express')
  , bodyParser = require('body-parser')
  , helmet = require('helmet')

const pino = require('pino-http')()
const app = express();
var exphbs  = require('express-handlebars');

var path = require('path');
var QRCode = require('qrcode')

app.use(helmet());
app.use(pino);
app.use(bodyParser.json());
app.use(express.static('website/public'))
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

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

const fs = require('fs');
var HTMLParser = require('node-html-parser');
const article_links = []

fs.readdirSync('views/articles/').forEach(file => {
  var path_article = file.replace(/\.[^/.]+$/, "")

  app.get("/" + path_article, function(req, res) {
    res.render("articles/" + path_article, { article: true});
  });

  var data = fs.readFileSync('views/articles/' + file);


  const root = HTMLParser.parse(data);

  article_links.push({"title": root.querySelector('h1').rawText, "path": path_article});
});


app.get('/', function(req, res) {
  res.render('index', {article_links: article_links});
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
  var rkey = key

  if (key_type == 'Telefone' || key_type == 'CNPJ' || key_type == "CPF") {
    rkey = rkey.replace(/\D/g,'');
  }

  if (key_type == "Telefone") {
    rkey = "+55" + rkey
  }
  return rkey
}

format_text = (text) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
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

  emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);
  return emvqr.generatePayload();
}
