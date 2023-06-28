const jwt = require("jsonwebtoken");
exports.sign = function sign(payload, privateKey, algorithm) {
  return jwt.sign(JSON.stringify(payload), privateKey, {
    algorithm
  });
}
exports.signES256 = function signES256(payload, privateKey) {
  return sign(payload, privateKey, 'ES256');
}