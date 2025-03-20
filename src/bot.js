import TelegramBot from 'node-telegram-bot-api';

const token = '7847802498:AAF4-4kEEobJu7kfByjWR0AgSmK1SaBpIyQ';
const webAppUrl = 'http://localhost:5173/'; 

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 'Добро пожаловать! Нажмите кнопку ниже, чтобы открыть магазин звёзд Telegram:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⭐ Купить звёзды', web_app: { url: webAppUrl } }]
      ]
    }
  });
});

bot.on('web_app_data', (msg) => {

  console.log('Получены данные от WebApp:', msg);
});