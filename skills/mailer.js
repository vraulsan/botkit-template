
const notifier = require('mail-notifier');

const imap = {
  user: "vraulsan",
  password: process.env.MAILERPASSWORD,
  host: "imap.gmail.com"
  port: 993, //imap port
  tls: true,
  tlsOptions: { rejectUnauthorized: false }\
};

notifier(imap)
  .on('mail', mail => console.log(mail))
  .start();

const n = notifier(imap);

n.on('end', () =>  n.start())
  .on('mail', mail => console.log(mail.from[0].address, mail.subject))
  .start();

module.exports = function(controller) {
  controller.hears('yoyo', 'direct_message,direct_mention', function(bot, message) {
    var name = message.raw_message.data.personEmail.split('.')[0]
    bot.reply(message, 'yoyo ' + name);
  });
