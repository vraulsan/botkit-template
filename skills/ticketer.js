const axios = require('axios');

const url = "https://23782374.ngrok.io/tickets"

module.exports = function(controller) {
  controller.hears('tickets', 'direct_message,direct_mention', function(bot, message) {
    axios.get(url)
      .then(res => {
        //console.log(res.data);
        //console.log(typeof res.data)
        finalText = generateTicketList(res.data)
        //console.log(finalText);
        bot.reply(message, {text: 'If you had markdown...', markdown: finalText})
      })
      .catch(err => { console.log(err) })
    bot.reply(message, 'One sec, let me fetch that real quick...');
  })
}

var generateTicketList = results => {
  var text = ''
  var ticketCount = 0;
  var ticketUna = 0;
  console.log('HERE FULL RESULTS: ', results)
  Object.keys(results).forEach( key => {
    var topKey = results[key];
    ticketCount = ticketCount + 1
    if (topKey['Assignee Name'] == null) {
        ticketUna = ticketUna + 1
      }
    Object.keys(topKey).forEach( key => {
      text = text +'**'+key + ':** ' + topKey[key] + '\n\n'
    })
    text = text + '- - -' + '\n\n'
  })
  text = text + '## Total Tickets: ' + ticketCount + '\n\n' + '## Total Unassigned: ' + ticketUna;
  return text
}
