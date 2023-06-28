const { SantimpaySdk } = require("../lib/index.js");

const PRIVATE_KEY_IN_PEM = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEII0qPPByHBzW3znAladzC0uQDi6vhgctF/r6NYlN4ftmoAoGCCqGSM49
AwEHoUQDQgAE4zghgXLQRJWd56Fe282IVNChD+oa8cNdSAZ6DaELdExs2lKmjXeS
xU/A8YCNg1GqgfrrLcx3eHnI+Qm6+ppgng==
-----END EC PRIVATE KEY-----`;

const GATEWAY_MERCHANT_ID = "9e2dab64-e2bb-4837-9b85-d855dd878d2b";

async function getPaymentUrl(data, successRedirectUrl, failureRedirectUrl, notifyUrl) {
  const client = new SantimpaySdk(GATEWAY_MERCHANT_ID, PRIVATE_KEY_IN_PEM);
  console.log(data, notifyUrl);
  try {
    const url = await client.generatePaymentUrl(
      data.id,
      data.amount,
      "Donation from " + data.name,
      successRedirectUrl,
      failureRedirectUrl,
      notifyUrl,
      data.phone
    );
    return url;
  } catch (err) {
    throw new Error('Failed to generate payment URL');
  }
}

exports.getPaymentUrl = getPaymentUrl;