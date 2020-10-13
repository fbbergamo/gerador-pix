require('./app.css');
var QRCode = require('qrcode')



function sendData( data ) {
  var request = new XMLHttpRequest();
  request.open("POST", "/emvqr-static");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onload = function (body) {
    console.log(body.target.response);
    QRCode.toString(JSON.parse(body.target.response).code, function (error, svg) {
      if (error) console.error(error)
      console.log('success!');
      const qrcode = document.querySelector('.js-qrcode-replace');
      qrcode.innerHTML = svg;
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


});
