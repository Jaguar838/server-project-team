//  Конкретная реализация каждой отправки
const nodemailer = require("nodemailer");
require("dotenv").config();

class CreateSenderNodemailer {
  async send(msg) {
    const config = {
      host: "smtp.meta.ua",
      port: 465,
      secure: true,
      auth: {
        user: "sparksofsharks@meta.ua",
        pass: process.env.PASSWORD,
      },
    };
    const transporter = nodemailer.createTransport(config);
    return await transporter.sendMail({
      ...msg,
      from: "sparksofsharks@meta.ua",
    });
  }
}
module.exports = { CreateSenderNodemailer };
