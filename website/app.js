require('./app.css');

import IMask from 'imask';
import Number from 'imask/esm/masked/number';
import ClipboardJS from 'clipboard';

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

    const qrcode = document.querySelector('.js-qrcode-replace');

    qrcode.innerHTML = `<img class="mx-auto" src="` + response.qrcode_base64 + `"><span> <a download="qrcode-pix" class="px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150" href="` + response.qrcode_base64 + `" >Baixar QrCode</a></span>`;


    const qrcodeDescription = document.querySelector('.js-qr-code-description');

    var description =  "Chave PIX: " + response.key;

    if (response.formated_amount && response.formated_amount != "") {
      description += "<br>Valor: " + response.amount;
    }

    description += "<br>Código QrCode: <button class='underline text-sm js-qrcode-show-and-copy' data-clipboard-target='#copy-qrcode-code-show-full'>mostrar e copiar</button><span id='copy-qrcode-code-show-full' class='js-show-qrcode-code hidden break-words mt-5 text-sm font-semibold block'>" + response.code + "</span>";

    qrcodeDescription.innerHTML = description;

    qrcode.focus();

    var showCodeBtn = document.querySelector('.js-qrcode-show-and-copy');

    var clipboard = new ClipboardJS('.js-qrcode-show-and-copy');

    clipboard.on('success', function(e) {
      e.clearSelection();
    });


    showCodeBtn.addEventListener('click', function() {
      var showCode = document.querySelector('.js-show-qrcode-code');
      showCode.classList.remove("hidden");
    });
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

  radioType.dispatchEvent(event);

  var currencyMask = IMask(
    document.querySelector('.js-amount-currency-mask'),
      {
        mask: 'R$ num',

        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: '.',
            padFractionalZeros: true,
            min: 0,
          }
        }
    });
});
