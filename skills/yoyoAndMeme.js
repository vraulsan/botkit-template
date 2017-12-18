
module.exports = function(controller) {
  // yoyo salutation skill
  controller.hears('yoyo', 'direct_message,direct_mention', function(bot, message) {
    var name = message.raw_message.data.personEmail.split('.')[0]
    bot.reply(message, 'yoyo ' + name);
  });
 // will generate a meme when bot hears "meme arg1 arg2 arg3" where arg1 is the meme type, arg2 is the upper text and arg3 is the lower text
 // visit memegen.link for more information
  controller.hears('meme', 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, 'Let me put on my painting beret, just a sec...');
    var type = message.text.split(' ')[1]
    var up = message.text.split(' ')[2]
    var down = message.text.split(' ')[3]
    var hereYouGo = 'Here\'s your meme ' + message.raw_message.data.personEmail.split('.')[0]
    // if arg1 is 'mvp' then this is a custom meme, we can add more here
    if (type == 'mvp') {
      var memeURL = 'https://memegen.link/custom/'+up+'/'+down+'.jpg?alt=https://s3.amazonaws.com/pantistuff/mvp.jpg';
    }
    // otherwise this will be a regular meme
    else {
    var memeURL = 'https://memegen.link/'+type+'/'+up+'/'+down+'.jpg'
    }
    bot.reply(message,{text: hereYouGo, files:[memeURL]})
  })
};
