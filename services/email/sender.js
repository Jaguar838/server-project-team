//  Конкретная реализация каждой отправки
const nodemailer = require('nodemailer');
require('dotenv').config();

class CreateSenderNodemailer {
  async send(msg) {
    const config = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    };
    const transporter = nodemailer.createTransport(config);
    return await transporter.sendMail({
      ...msg,
      from: process.env.EMAIL,
    });
  }
}
module.exports = { CreateSenderNodemailer };
