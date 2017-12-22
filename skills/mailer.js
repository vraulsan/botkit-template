
const notifier = require('mail-notifier');

const imap = {
  user: "vraulsan",
  password: process.env.MAILERPASSWORD,
  host: "imap.gmail.com"
  port: 993, //imap port
  tls: true,
  tlsOptions: { rejectUnauthorized: false }\
};





module.exports = function(controller) {
  notifier(imap)
    .on('mail', mail => console.log(mail))
    .start();
  const n = notifier(imap);
  n.on('end', () =>  n.start())
    .on('mail', mail => console.log(mail.from[0].address, mail.subject))
    .start();
  controller.hears('mailer', 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, 'yoyo ' + name);
  });
