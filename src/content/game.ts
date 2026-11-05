import type { L } from "./i18n";

export interface Card {
  scam: boolean;
  text: string;
}

/** Примеры — вымышленные; домены не существуют или намеренно «похожие». */
export const cards: L<Card[]> = {
  ru: [
    { scam: true, text: "Срочно! Проголосуй за мою сестру в конкурсе: http://golos-telegram.top — пришли код из SMS." },
    { scam: false, text: "Привет! Завтра в 15:00 встречаемся у школы, не опаздывай." },
    { scam: true, text: "Служба поддержки Telegram: ваш аккаунт заблокирован. Пришли код, который придёт в SMS." },
    { scam: true, text: "Бесплатный розыгрыш 100 000 сум! Осталось 3 места: http://payme-bonus.xyz" },
    { scam: false, text: "Урок математики перенесли на четверг, кабинет 12." },
    { scam: true, text: "Ваша карта Uzcard заблокирована! Срочно подтвердите данные: http://uzcard-verify.icu" },
    { scam: false, text: "Заказ №4821 готов, заберите в магазине до 20:00." },
    { scam: true, text: "Введи код из SMS на сайте и получи выплату: http://click-vyplata.top" },
    { scam: false, text: "Спасибо за помощь с проектом! Мой профиль: https://github.com/xzboq" },
    { scam: true, text: "Срочно! Последний шанс получить бонус: http://clck.ru/abc" },
    { scam: false, text: "Мам, я дома. Ужин разогрею сам." },
    { scam: true, text: "Инвестиции без риска: заработаешь x5 прибыли за неделю, срочно пиши в личку." },
  ],
  uz: [
    { scam: true, text: "Shoshilinch! Ovoz bering: http://payme-sovga.xyz — SMS kodni yuboring. Bepul sovga!" },
    { scam: false, text: "Salom! Ertaga soat 15:00 da maktab oldida uchrashamiz, kechikma." },
    { scam: true, text: "Telegram qo’llab-quvvatlash xizmati: akkauntingiz bloklandi. SMS kodni yuboring, ovoz bering." },
    { scam: true, text: "Bepul sovga o’yini! Faqat 3 kun qoldi: http://uzum-bonus.top" },
    { scam: false, text: "Matematika darsi payshanbaga o’tkazildi, 12-xona." },
    { scam: true, text: "Uzcard kartangiz bloklandi! Shoshilinch ma’lumotlarni tasdiqlang: http://uzcard-verify.icu" },
    { scam: false, text: "4821-buyurtma tayyor, do’kondan soat 20:00 gacha olib keting." },
    { scam: true, text: "Bepul pul: kodni yuboring va to’lovni oling: http://click-tolov.top" },
    { scam: false, text: "Loyihada yordam bergani uchun rahmat! Profilim: https://github.com/xzboq" },
    { scam: true, text: "Shoshilinch! Bonus olishning oxirgi imkoni: http://clck.ru/abc" },
    { scam: false, text: "Oyi, men uydaman. Kechki ovqatni o’zim isitaman." },
    { scam: true, text: "Xavfsiz investitsiya: bir haftada daromad oling, ovoz bering va shoshilinch yozing." },
  ],
  en: [
    { scam: true, text: "Urgent! Free prize giveaway — send me the code from your SMS: http://golos-telegram.top" },
    { scam: false, text: "Hi! Tomorrow at 3 pm we meet at school, don’t be late." },
    { scam: true, text: "Support team of Telegram: your account is blocked. Send me the code you get by SMS." },
    { scam: true, text: "Free bitcoin giveaway! Invest today: http://payme-bonus.xyz" },
    { scam: false, text: "Math class was moved to Thursday, room 12." },
    { scam: true, text: "Your Uzcard is blocked! Free prize if you confirm now: http://uzcard-verify.icu" },
    { scam: false, text: "Order #4821 is ready, please pick it up at the store before 8 pm." },
    { scam: true, text: "Send the code from SMS on this site, free prize giveaway: http://click-payout.top" },
    { scam: false, text: "Thanks for helping with the project! My profile: https://github.com/xzboq" },
    { scam: true, text: "Free prize! Invest in the last chance bonus: http://clck.ru/abc" },
    { scam: false, text: "Mom, I’m home. I’ll heat up dinner myself." },
    { scam: true, text: "Risk-free invest scheme, free bitcoin for the first ten, send me the code to join." },
  ],
};
