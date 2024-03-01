// const Mail = require('@sendgrid/mail')
// Mail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = async (options) => {

//     const msg = {
//         to: options.email,
//         from: process.env.SENDGRID_MAIL,
//         templateId: options.templateId,
//         dynamic_template_data: options.data,
//     }
//     Mail.send(msg).then(() => {
//         console.log('Email Sent')
//     }).catch((error) => {
//         console.error(error)
//     });
// };

// module.exports = sendEmail;


const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
