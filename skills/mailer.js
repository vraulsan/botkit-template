const EWS = require('node-ews');
const fs = require('fs');

// exchange server connection info
const ewsConfig = {
  username: 'victor.sanchezmaggiolo@charter.com',
  password: process.env.OUTLOOKPASS,
  host: 'https://outlook.charter.com'
};

const ews = new EWS(ewsConfig);

// specify listener service options
const serviceOptions = {
  port: 8000, // defaults to port 8000
  path: '/', // defaults to '/notification'
  // If you do not have NotificationService.wsdl it can be found via a quick Google search
  xml: fs.readFileSync('../NotificationService.wsdl', 'utf8') // the xml field is required
};

const ewsArgs = {
  PushSubscriptionRequest: {
    FolderIds: {
      DistinguishedFolderId: {
        attributes: {
          Id: 'inbox'
        }
      }
    },
    EventTypes: {
      EventType: ['CreatedEvent']
    },
    StatusFrequency: 1,
    // subscription notifications will be sent to our listener service
    URL: 'https://spark-piebot.herokuapp.com:8000/'
  }
};

module.exports = function(controller) {
  controller.hears('mailer', 'direct_message,direct_mention', function(bot, message) {
    ews.notificationService(serviceOptions, function(response) {
      console.log(new Date().toISOString(), '| Received EWS Push Notification');
      console.log(new Date().toISOString(), '| Response:', JSON.stringify(response));
      // Do something with response
      return {SendNotificationResult: { SubscriptionStatus: 'OK' } }; // respond with 'OK' to keep subscription alive
      // return {SendNotificationResult: { SubscriptionStatus: 'UNSUBSCRIBE' } }; // respond with 'UNSUBSCRIBE' to unsubscribe
    });
    ews.run('Subscribe', ewsArgs)
    .then(result => {
      console.log(prettyjson.render(result));
    })
    .catch(err => {
      console.log(err.message);
    });
    bot.reply(message, 'yoyo ' + name);
  });
