const axios = require('axios');

const ticket_count_url = process.env.NGROK+"/ticket_count"
const bhn_tickets_url = process.env.NGROK+"/bhn_tickets"
const twc_tickets_url = process.env.NGROK+"/twc_tickets"

module.exports = function(controller) {

  controller.hears([/^tickets$/], 'direct_message,direct_mention', function(bot, message) {
    axios.get(ticket_count_url)
      .then(res => {
        finalText = generateTicketCountMD(res.data)
        bot.reply(message, finalText)
      })
      .catch(err => {
        bot.reply(message, 'Sorry, the request to the remedy servers failed, you can try again but the API may be broken...')
      })
    bot.reply(message, 'This may take me a few seconds...');
  })

  controller.hears([/^bhn tickets$/], 'direct_message,direct_mention', function(bot, message) {
    axios.get(bhn_tickets_url)
      .then(res => {
        finalText = generateBHNticketsMD(res.data)
        bot.reply(message, finalText)
      })
      .catch(err => {
        bot.reply(message, 'Sorry, the request to the remedy server failed, you can try again but the API may be broken...')
      })
    bot.reply(message, 'One sec, let me fetch that real quick...');
  })

  controller.hears([/^twc tickets$/], 'direct_message,direct_mention', function(bot, message) {
    axios.get(twc_tickets_url)
      .then(res => {
        finalText = generateTWCticketsMD(res.data)
        bot.reply(message, finalText)
      })
      .catch(err => {
        bot.reply(message, 'Sorry, the request to the remedy server failed, you can try again but the API may be broken...')
      })
    bot.reply(message, 'One sec, let me fetch that real quick...');
  })

}


var generateTicketCountMD = results => {
  var bhn_open = results['bhn']['open'];
  var bhn_una = results['bhn']['una'];
  var twc_cms = results['twc']['cms'];
  var twc_open = results['twc']['open'];
  var twc_una = results['twc']['una'];
  var text = '## DAC and TRB Ticket count\n' +
              '```\nDAC Tickets\n' +
              '============\n' +
              'Open: ' + bhn_open +'\n' + 'Unassigned: ' + bhn_una + '\n\n' +
              'TRB Tickets\n' +
              '=============\n' +
              'CMS: ' + twc_cms + '\n' + 'Open: ' + twc_open + '\n' + 'Unassigned: ' + twc_una + '\n' + '```\n' +
              'You can also say **bhn tickets** or **twc tickets** to get the full list'
  return text
}


var generateBHNticketsMD = results => {
  var text = ''
  var ticketCount = 0;
  var ticketUna = 0;
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

var generateTWCticketsMD = results => {
  var text = ''
  var ticketCount = 0;
  var ticketUna = 0;
  Object.keys(results).forEach( key => {
    var topKey = results[key];
    ticketCount = ticketCount + 1
    if (topKey['Assigned To'] == null) {
        ticketUna = ticketUna + 1
        topKey['Assigned To'] = 'Unassigned'
      }
    Object.keys(topKey).forEach( key => {
      text = text + key + ': ' + topKey[key] + '\n'
    })
    text = text + '-----------------------------------------------------------' + '\n'
  })
  text = '```\n' + text + '```\n### Total Tickets: ' + ticketCount + '\n\n' + '### Total Unassigned: ' + ticketUna;
  return text
}
