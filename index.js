var express = require('express')
  , bodyParser = require('body-parser')
  , helmet = require('helmet')
  , BrCode = require('./lib/br_code')
  , pino = require('pino-http')()
  , exphbs  = require('express-handlebars')
  , fs = require('fs')
  , path = require('path')
  , QRCode = require('qrcode')

const app = express();

app.use(helmet());
app.use(pino);
app.use(bodyParser.json());
app.use(express.static('website/public'))
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const port = process.env.PORT || 8000;
const QR_CODE_SIZE = 400;
const article_links = []
var HTMLParser = require('node-html-parser');

const contentSecurityPolicy = [
  "script-src 'self' 'nonce-2726c7f26c' www.googletagmanager.com",
].join(";");

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", contentSecurityPolicy);
  next();
});

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

app.post('/emvqr-static', (req, res) => {
  var { key, amount, name, reference, key_type, city } = req.body

  if (key) {
      const brCode = new BrCode(key, amount, name, reference, key_type, city);

      var code = brCode.generate_qrcp()

      QRCode.toDataURL(code, {width: QR_CODE_SIZE, height: QR_CODE_SIZE})
      .then(qrcode => {
        res.json({
          qrcode_base64: qrcode,
          code: code,
          key_type: brCode.key_type,
          key: brCode.key,
          amount: brCode.amount,
          name: brCode.name,
          city: brCode.city,
          reference: brCode.reference,
          formated_amount: brCode.formated_amount()})
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
