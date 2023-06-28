const axios = require("axios");
const { signES256 } = require("./utils/cryptography.js");
const { PRODUCTION_BASE_URL } = require("./utils/constants.js");
const { TEST_BASE_URL } = require("./utils/constants.js");

class SantimpaySdk {
  constructor(merchantId, privateKey, testBed = false) {
    this.privateKey = privateKey;
    this.merchantId = merchantId;
    this.baseUrl = PRODUCTION_BASE_URL;
    if (testBed) {
      this.baseUrl = TEST_BASE_URL;
    }
  }
  
  generateSignedTokenForInitiatePayment(amount, paymentReason) {
    const time = Math.floor(Date.now() / 1000);
    const payload = {
      amount,
      paymentReason,
      merchantId: this.merchantId,
      generated: time
    };
    return signES256(payload, this.privateKey);
  }
  async generatePaymentUrl(id, amount, paymentReason, successRedirectUrl, failureRedirectUrl, notifyUrl, phoneNumber = "") {
    try {
      const token = this.generateSignedTokenForInitiatePayment(amount, paymentReason);
      const payload = {
        id,
        amount,
        reason: paymentReason,
        merchantId: this.merchantId,
        signedToken: token,
        successRedirectUrl,
        failureRedirectUrl,
        notifyUrl
      };
      if (phoneNumber && phoneNumber.length > 0) {
        payload.phoneNumber = phoneNumber;
      }
      console.log(payload, token);
      const response = await axios.post(`${this.baseUrl}/initiate-payment`, payload, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      if (response.status === 200) {
        return response.data.url;
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  }

  checkTransactionStatus(id) {
    return new Promise((resolve, reject) => 
      resolve({
        id,
        amount: 10,
        reason: "Payment for a coffee",
        status: "success",
        phoneNumber: "+251932118929",
        generated: 1624296000,
        completed: 1624296000
    }))
  }
}

exports.SantimpaySdk = SantimpaySdk;