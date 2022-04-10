// tests/demo.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import BrCode from '../../lib/br_code.js';

test('brCode.generate_qrcp() CPF', () => {
  var brCode = new BrCode("333.333.333-33", null, " tester ", null, "CPF", "Sp");
  var code = brCode.generate_qrcp()
   assert.equal(code,
     "00020126330014BR.GOV.BCB.PIX0111333333333335204000053039865802BR5906tester6002Sp62070503***6304F470",
     'check qrcode using cpf');
});

test('brCode.generate_qrcp() amount empty', () => {
  var brCode = new BrCode("333.333.333-44", '', " tester ", null, "CPF", "Sp");
  var code = brCode.generate_qrcp()
   assert.equal(code,
     "00020126330014BR.GOV.BCB.PIX0111333333333445204000053039865802BR5906tester6002Sp62070503***63048EB1",
     'check qrcode using cpf with empty money');
  assert.equal(brCode.formated_amount(), "")
});

test('brCode.generate_qrcp() PHONE', () => {
  var brCode = new BrCode("(33) 33333-3333", "R$ 30", " tester ", "ID-33", "TELEFONE", "Sp");
  var code = brCode.generate_qrcp()
   assert.equal(code,
     "00020126360014BR.GOV.BCB.PIX0114+55333333333335204000053039865402305802BR5906tester6002Sp62090505ID-336304484C",
     'check qrcode using phone');
});

test('brCode.generate_qrcp() CNPJ', () => {
  var brCode = new BrCode("333333333000333", "R$ 30.88", " tester ", "ID-33", "cnpj", "Sp");
  var code = brCode.generate_qrcp()
   assert.equal(code,
     "00020126370014BR.GOV.BCB.PIX0115333333333000333520400005303986540430885802BR5906tester6002Sp62090505ID-33630452F0",
     'check qrcode using cnpj');
});

test('brCode.generate_qrcp() email', () => {
  var brCode = new BrCode("tester+1@example.com", "R$ 30.88", " tester tester ", "ID-33", "email", "Sp");
  var code = brCode.generate_qrcp()
   assert.equal(code,
     "00020126420014BR.GOV.BCB.PIX0120tester+1@example.com520400005303986540430885802BR5913tester tester6002Sp62090505ID-33630460EE",
     'check qrcode using email');
});

test('brCode.generate_qrcp() other key', () => {
  var brCode = new BrCode("adsdasdasdasdasda2342314qweqw", "R$ 30.88", " tester tester ", "ID-33", "outro", "Sp");
  var code = brCode.generate_qrcp()
   assert.equal(code,
     "00020126510014BR.GOV.BCB.PIX0129adsdasdasdasdasda2342314qweqw520400005303986540430885802BR5913tester tester6002Sp62090505ID-3363048128",
     'check qrcode using other key');
});

test('brCode.generate_qrcp() strip html', () => {
  var brCode = new BrCode("<img onclick='x'>", "dd", "<img onclick='x'>", "ID-33", "<img onclick='x'>", "<img onclick='x'>");
  var code = brCode.generate_qrcp()
   assert.equal(code,
     "00020126180014BR.GOV.BCB.PIX5204000053039865402dd5802BR62090505ID-33630412A2",
     'check qrcode removing html tags');
});

test.run();
