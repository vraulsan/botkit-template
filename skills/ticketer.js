const axios = require('axios');

const ticket_count_url = "https://cf379163.ngrok.io/ticket_count"
const bhn_tickets_url = "https://cf379163.ngrok.io/bhn_tickets"

module.exports = function(controller) {
  controller.hears('tickets', 'direct_message,direct_mention', function(bot, message) {
    axios.get(ticket_count_url)
      .then(res => {
        console.log(res.data[bhn])
        //finalText = generateTicketCountMD(res.data)
        //bot.reply(message, finalText)
      })
      .catch(err => { console.log(err) })
    bot.reply(message, 'One sec, let me fetch that real quick...');
  })
}


module.exports = function(controller) {
  controller.hears('bhn tickets', 'direct_message,direct_mention', function(bot, message) {
    axios.get(bhn_tickets_url)
      .then(res => {
        finalText = generateBHNticketsMD(res.data)
        bot.reply(message, finalText)
      })
      .catch(err => { console.log(err) })
    bot.reply(message, 'One sec, let me fetch that real quick...');
  })
}




var generateTicketCountMD = results => {
  // here goes the ticket count markdown generation
  //var bhn_open = results[bhn][open]
}


var generateBHNticketsMD = results => {
  var text = ''
  var ticketCount = 0;
  var ticketUna = 0;
  //console.log('HERE FULL RESULTS: ', results)
  Object.keys(results).forEach( key => {
    var topKey = results[key];
    ticketCount = ticketCount + 1
    if (topKey['Assignee Name'] == null) {
        ticketUna = ticketUna + 1
        topKey['Assignee Name'] = 'Unassigned'
      }
    Object.keys(topKey).forEach( key => {
      text = text + key + ': ' + topKey[key] + '\n'
    })
    text = text + '-----------------------------------------------------------' + '\n'
  })
  text = '```\n' + text + '```\n### Total Tickets: ' + ticketCount + '\n\n' + '### Total Unassigned: ' + ticketUna;
  return text
}
