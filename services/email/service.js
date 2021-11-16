const Mailgen = require('mailgen');

class EmailService {
  constructor(env, sender) {
    this.sender = sender; // DI внедряем метод sender из других классов ф-ла sender.js
    switch (env) {
      case 'development':
        this.link = 'https://61f2-213-109-141-89.ngrok.io';
        break;
      case 'production':
        this.link = process.env.BACKEND_LINK;
        break;
      default:
        this.link = process.env.LOCALHOST;
        break;
    }
  }

  createTemplateEmail(name, verifyTokenEmail) {
    // const link = this.link;
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Wallet-app',
        link: this.link,
      },
    });

    const email = {
      body: {
        name,
        intro:
          "Welcome to the Wallet app! We're very excited to have you on board.",
        action: {
          instructions: 'To get started with Your Wallet, please click here:',
          button: {
            color: '#6e78e8', // Optional action button color
            text: 'Confirm your account',
            link: `${process.env.BACKEND_LINK}api/users/verify/${verifyTokenEmail}`,
          },
        },
      },
    };
    return mailGenerator.generate(email);
  }

  async sendVerifyEmail(email, name, verifyTokenEmail) {
    const emailHTML = this.createTemplateEmail(name, verifyTokenEmail);
    const msg = {
      to: email,
      subject: 'Verify your email',
      html: emailHTML,
    };
    try {
      const result = await this.sender.send(msg);
      console.log(result);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}

module.exports = EmailService;
