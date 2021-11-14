const Mailgen = require("mailgen");

class EmailService {
  constructor(env, sender) {
    this.sender = sender; // DI внедряем метод sender из других классов ф-ла sender.js
    switch (env) {
      case "development":
        this.link = "https://61f2-213-109-141-89.ngrok.io";
        break;
      case "production":
        this.link = "link for production";
        break;
      default:
        this.link = "http://127.0.0.1:3001";
        break;
    }
  }

  createTemplateEmail(name, verifyTokenEmail) {
    const link = this.link;
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Mailgen",
        link: this.link,
      },
    });

    const email = {
      body: {
        name,
        intro:
          "Welcome to the Contacts app! We're very excited to have you on board.",
        action: {
          instructions: "To get started with Contacts, please click here:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Confirm your account",
            link: `${this.link}/api/users/verify/${verifyTokenEmail}`,
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
      subject: "Verify your email",
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

// Эта часть кода нечто общее, за которым мы все скрываем (типа сделаем фасад и за ним будем все прятать).
// Патерн проектирования нашего приложения ФАСАД(FACADE)- ПРОСТОЙ ИНТЕРФЕЙС К СЛОЖНОЙ СИСТЕМЕ
// КЛАССОВ, БИБЛИОТЕКИ ИЛИ ФРЕЙМВОРКУ.
//  при FACADE используем для класса EmailService не наследование(extended), а внедрение в другой класс(внедрение зависимости, Dependency injection, DI)
// Наша цель:
// User логиниться по email and password(в db создается его запись), после чего его просят подтвердить email(подтвердить verifyTokenEmail)
// Для этого ему нужно зайти на email найти письмо от приложения и кликнуть на кнопку "Confirm your account"(http://joxi.ru/Q2K7OpphLja092)
// Если письмо не дошло, то повторную проверку можна осуществить повторно запросом (POST /api/users/verify) и
// Изначально любой зарегестрированный пользователь не верифицирован(isVerified: false)
// но у него есть для верификации токен генерируемый по умолчанию в db.

// Рекомендация по модулизации
// 1) В отдельный модуль(файл) определяем, какой-то сервис для определенной db-колекции, её сервис-контроль.
// 2) В данном приложении вся бизнес-логика вынесена в контроллеры и для этой бизнес-логики нет сервисов.
// 3) Но мы можем выделить внутреннюю и внешнюю логику этих контроллеров,
// напр.мы заводим логику "контроллера - аунтификаци" и "сервиса - аунтификации"
//  и соответственно "контролер-юзеров"- это уже работа с пользователями внутри нашей системы(так называямая "внутреняя-логика")
// В этом случае аунтификацию нужно определять в отдельный модуль(ф-л контроллер controllers/auth.js)
//  В данном приложении у нас нет, как таковой работы с пользователями(мы их не группируем по интересам, редактируем и баним).
