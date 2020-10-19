require('./app.css');

var QRCode = require('qrcode')
import IMask from 'imask';
import Number from 'imask/esm/masked/number';

const keyType = {
  "Telefone": {
    "placeholder": "(11) 99999-9999",
    "type": "phone",
    "aria-label": "Telefone Cadastrado no PIX, Digite Somente números, máscara será aplicada",
    "inputmode": "tel",
    "maskOption": {
      mask: '(00) 00000-0000',
      dispatch: null
    }
  },
  "CPF":  {
    "placeholder": "222.222.222-22",
    "type": "text",
    "aria-label": "CPF Cadastrado no PIX, Digite Somente números, máscara será aplicada",
    "inputmode": "numeric",
    "maskOption": {
      "mask": "000.000.000-00",
      dispatch: null
    }
  },
  "CNPJ":  {
    "placeholder": "99.999.999/9999-99",
    "type": "text",
    "aria-label": "CNPJ Cadastrado no PIX, Digite Somente números, máscara será aplicada",
    "inputmode": "numeric",
    "maskOption": {
      "mask": "00.000.000/0000-00",
      dispatch: null
    }
  },
  "Email":  {
    "placeholder": "exemplo@exemplo.com.br",
    "type": "email",
    "aria-label": "EMAIL Cadastrado no PIX",
    "inputmode": "email"
  },
  "Outro": {
    "placeholder": "CHAVE-PIX-ALPHANUMERICA",
    "type": "text",
    "aria-label": "Chave Alphanúmerica Cadastrado no PIX",
    "inputmode": "text"
  }
}

function sendData( data ) {
  var request = new XMLHttpRequest();
  request.open("POST", "/emvqr-static");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onload = function (body) {
    console.log(body.target.response);
    var response = JSON.parse(body.target.response)
    QRCode.toString(response.code, function (error, svg) {
      if (error) console.error(error)
      console.log('success!');
      const qrcode = document.querySelector('.js-qrcode-replace');
      qrcode.innerHTML = svg;
    });

    const qrcodeDescription = document.querySelector('.js-qr-code-description');

    var description =  "CHAVE PIX: " + response.key;

    if (response.formated_amount && response.formated_amount != "") {
      description += "<br>Valor: " + response.amount;
    }

    description += "<br>Código QRCODE: " + response.code;

    qrcodeDescription.innerHTML = description;
  };
  request.send(JSON.stringify(data))
}

var serializeForm = function (form) {
	var obj = {};
	var formData = new FormData(form);
	for (var key of formData.keys()) {
		obj[key] = formData.get(key);
	}
	return obj;
};

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.querySelector('.js-trigger-qr-code');

  if (btn) {
    btn.addEventListener( 'submit', function(e) {
      e.preventDefault();
      sendData(serializeForm(e.target));
    })
  }

  const radioType = document.querySelector('.js-change-pix-type');

  if (radioType) {
    radioType.addEventListener( 'change', function(e) {
      var attributes = keyType[e.target.value];

      const input =  document.querySelector('.js-pix-key-input');
      input.value = ""

      if (window.current_mask_input) {
        window.current_mask_input.destroy();
      }

      input.setAttribute("placeholder", attributes["placeholder"]);
      input.setAttribute("type", attributes["type"]);
      input.setAttribute("aria-label", attributes["aria-label"]);
      input.setAttribute("inputmode", attributes["inputmode"]);
      input.focus();
      if (attributes["maskOption"]) {
         window.current_mask_input = IMask(input, attributes["maskOption"]);
      }
    })
  }
  const event = new Event('change');

  // Dispatch the event.
  radioType.dispatchEvent(event);

  var currencyMask = IMask(
    document.querySelector('.js-amount-currency-mask'),
      {
        mask: 'R$ num',

        blocks: {
          num: {
            // nested masks are available!
            mask: Number,
            thousandsSeparator: ' ',
            padFractionalZeros: true,
            min: 0,
          }
        }
    });
});
