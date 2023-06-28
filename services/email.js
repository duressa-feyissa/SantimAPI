  
function sendEmail(sender, recipient, subject, text) {
  const mailgun = require('mailgun-js')({
    apiKey: "ebace252b8692d109c8b61cff70be0d6-7764770b-87486981",
    domain: "sandbox60a63133efb541c7a662ee57236881cc.mailgun.org"
  });

    const data = {
      from: sender,
      to: recipient,
      subject: subject,
      text: text
    };
  
    mailgun.messages().send(data, (error, body) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent:', body);
      }
    });
  }
  
exports.sendEmail = sendEmail;