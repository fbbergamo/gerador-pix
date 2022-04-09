import pkg from 'steplix-emv-qrcps';
const { Merchant } = pkg;

import { stripHtml } from "string-strip-html";

export default class BrCode {

  constructor(key, amount, name, reference, key_type, city) {
    this.key = this.normalize(key);
    this.amount = this.normalize(amount);
    this.name = this.normalize(name);
    this.reference = this.normalize(reference);
    this.key_type = this.normalize(key_type);
    this.city = this.normalize(city);
  }

  static format_text(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  }

  normalize(text) {
    if (text != null) {
      return stripHtml(text).result
    }
  }

  formated_name() {
    return this.constructor.format_text(this.name);
  }

  formated_city() {
    return this.constructor.format_text(this.city);
  }

  formated_amount() {
    if (this.amount) {
      return this.amount.replace('.','').replace(',','.').replace(' ','').replace("R$", '');
    }
    else {
      return ''
    }
  }

  formated_referance() {
    return this.constructor.format_text(this.reference).replace(' ','');
  }

  formated_key() {
    var rkey = this.key;
    var ktype = this.key_type.toLowerCase();

    if (ktype == 'telefone' || ktype == 'cnpj' || ktype == "cpf") {
      rkey = rkey.replace(/\D/g,'');
    }

    if (ktype == "telefone") {
      rkey = "+55" + rkey
    }

    return rkey.trim()
  }

  generate_qrcp() {
    var emvqr = Merchant.buildEMVQR();

    emvqr.setPayloadFormatIndicator("01");
    emvqr.setCountryCode("BR")
    emvqr.setMerchantCategoryCode("0000");
    emvqr.setTransactionCurrency("986");
    const merchantAccountInformation = Merchant.buildMerchantAccountInformation();
    merchantAccountInformation.setGloballyUniqueIdentifier("BR.GOV.BCB.PIX");

    merchantAccountInformation.addPaymentNetworkSpecific("01", this.formated_key());

    emvqr.addMerchantAccountInformation("26", merchantAccountInformation);

    if (this.name) {
      emvqr.setMerchantName(this.formated_name());
    }

    if (this.city) {
      emvqr.setMerchantCity(this.formated_city());
    }

    if (this.amount && this.amount != '') {
      emvqr.setTransactionAmount(this.formated_amount());
    }

    const additionalDataFieldTemplate = Merchant.buildAdditionalDataFieldTemplate();

    if (this.reference) {
      additionalDataFieldTemplate.setReferenceLabel(this.formated_referance());
    }
    else {
      additionalDataFieldTemplate.setReferenceLabel("***");
    }

    emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);
    return emvqr.generatePayload();
  }
}
