var text = `
## PIE bot - a0.1
- - -
I'm a spark bot, when interacting with me in a group space such as "TEAM PIE/General" please use DM's i.e. @PIE
* You can say ***PIE show tasks*** or ***PIE add task "task"*** or ***PIE complete task "id"***
* You can say ***PIE meme "type" "upText" "downText"***\n\n
This app is hosted and developed by Victor, let him know if you want to contribute to this project.
`


module.exports = function(controller) {
  // yoyo salutation skill
  controller.hears('yoyo', 'direct_message,direct_mention', function(bot, message) {
    var name = message.raw_message.data.personEmail.split('.')[0]
    bot.reply(message, 'yoyo ' + name);
  });

  controller.hears('meme', 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, 'Let me put on my painting beret, just a sec...');
    var type = message.text.split(' ')[1]
    var up = message.text.split(' ')[2]
    var down = message.text.split(' ')[3]
    var hereYouGo = 'Here\'s your meme ' + message.raw_message.data.personEmail.split('.')[0]
    if (type == 'mvp') {
      var memeURL = 'https://memegen.link/custom/'+up+'/'+down+'.jpg?alt=https://s3.amazonaws.com/pantistuff/mvp.jpg';;;;;;;;;;
    }
    else {
    var memeURL = 'https://memegen.link/'+type+'/'+up+'/'+down+'.jpg'
    }
    bot.reply(message,{text: hereYouGo, files:[memeURL]})
  })
  controller.hears('help', 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, {
      text: 'If you had markdown enabled you would be able to see something cool...',
      markdown: text
    });
  });
};
