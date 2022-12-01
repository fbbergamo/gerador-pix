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
const download_button_style = `px-4 py-2 border border-transparent
  text-base leading-6 font-medium rounded-md text-white bg-indigo-600
  hover:bg-indigo-500 focus:outline-none focus:border-indigo-700
  focus:shadow-outline-indigo active:bg-indigo-700 transition
  ease-in-out duration-150 print:hidden w-1/2`

function sendData( data ) {
  var request = new XMLHttpRequest();
  request.open("POST", "/emvqr-static");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onload = function (body) {

    var response = JSON.parse(body.target.response)
    var hasAmount = !!(response.formated_amount && response.formated_amount !== '')
    const qrcode = document.querySelector('.js-qrcode-replace');

    qrcode.innerHTML =
      `<img alt="QRCode Gerado a partir dos dados fornecidos"
            class="mx-auto print:w-84" src="${response.qrcode_base64}">
        <div class="flex flex-col items-center">
          <a download="qrcode-pix"
             class="${download_button_style}" href="${response.qrcode_base64}">
             Baixar QrCode
          </a>
          <button class='js-print-qrcode print:hidden underline text-lg font-bold mt-5 mb-5'>
              Imprimir plaquinha pix
          </button>
            <h3><a href="https://amzn.to/3EOW2Ux" target="_blank" class="underline print:hidden">Comprar Placa de Acrílico na Amazon.com.br</a></h3>
            <div class="text-center mt-5 mb-5 print:hidden">
              <iframe sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=BR&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=homemade07d-20&language=pt_BR&marketplace=amazon&region=BR&placement=B094DTT19H&asins=B094DTT19H&linkId=bb9ac53d73ba8112ee16b05081edc94d&show_border=true&link_opens_in_new_window=true"></iframe>
            </div>
        </div>`;


    const qrcodeDescription = document.querySelector('.js-qr-code-description');
    var pixDetails = ""

    pixDetails +=  `<li><span class="font-bold">Chave PIX:</span> ${response.key}</li>`;

    if (response.name) {
      pixDetails += `<li><span class="font-bold">Nome:</span> ${response.name}</li>`;
    }

    if (response.key_type && response.key_type != "Outro") {
      pixDetails += `<li><span class="font-bold">Tipo de Chave:</span> ${response.key_type}</li>`;
    }

    if (hasAmount) {
      pixDetails += `<li class="mt-5"><span class="font-bold">Valor:</span> ${response.amount}</li>`;
    }

    if (response.reference) {
      pixDetails += `<li><span class="font-bold">Código da transferência:</span> ${response.reference}</li>`;
    }

    var description = `
      <ul class="mt-5 mb-5 print:mt-0 space-y-1">
        ${pixDetails}
      </ul>
      <div class="print:hidden">
        <span class="mt-10 block">Código QrCode (Copia e Cola):</span>
          <button class='underline text-sm mb-5 js-qrcode-show-and-copy'
            data-clipboard-target='#copy-qrcode-code-show-full'>
              mostrar e copiar
          </button>

        <span id='copy-qrcode-code-show-full'
          class='js-show-qrcode-code hidden break-words
            mb-5 text-sm font-semibold block'>${response.code}
        </span>
      </div>`;

    qrcodeDescription.innerHTML = description;

    qrcode.focus();

    gtag("event", "generate_qr_code", {
      'hasAmount' : hasAmount
    });

    var showCodeBtn = document.querySelector('.js-qrcode-show-and-copy');
    var printCodeBtn = document.querySelector('.js-print-qrcode');

    var clipboard = new ClipboardJS('.js-qrcode-show-and-copy');

    clipboard.on('success', function(e) {
      e.clearSelection();
    });

    printCodeBtn.addEventListener('click', function() {
      gtag("event", "print_pix", {});

      window.print();
      return false;
    });

    showCodeBtn.addEventListener('click', function() {
      gtag("event", "copy_and_paste_pix", {});

      var showCode = document.querySelector('.js-show-qrcode-code');
      showCode.classList.remove("hidden");
    });


    const qrcodeContainer = document.querySelector('.js-qr-code-container');

    qrcodeContainer.scrollIntoView();
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

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  showInstallPromotion();
});


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

    const event = new Event('change');

    radioType.dispatchEvent(event);
  }

  const maskCurrency = document.querySelector('.js-amount-currency-mask');

  if (maskCurrency) {
    IMask(
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
  }
});
