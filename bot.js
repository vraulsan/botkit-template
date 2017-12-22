//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License
//

//
// BotKit configuration
//

// Load environment variables from project .env file
require('node-env-file')(__dirname + '/.env');
var notifier = require('mail-notifier');

if (!process.env.SPARK_TOKEN) {
    console.log("Could not start as bots require a Cisco Spark API access token.");
    console.log("Please add env variable SPARK_TOKEN on the command line or to the .env file");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node bot.js");
    process.exit(1);
}

// Get public URL where Cisco Spark will post spaces notifications (webhook registration)
var public_url = process.env.PUBLIC_URL;
// Infer the app domain for popular Cloud PaaS
if (!public_url) {
    // Heroku hosting: available if dyno metadata are enabled, https://devcenter.heroku.com/articles/dyno-metadata
    if (process.env.HEROKU_APP_NAME) {
        public_url = "https://" + process.env.HEROKU_APP_NAME + ".herokuapp.com";
    }
    // Glitch hosting
    if (process.env.PROJECT_DOMAIN) {
        public_url = "https://" + process.env.PROJECT_DOMAIN + ".glitch.me";
    }
}
if (!public_url) {
    console.log("Could not start as this bot must expose a public endpoint.");
    console.log("Please add env variable PUBLIC_URL on the command line or to the .env file");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node bot.js");
    process.exit(1);
}

//
// Create bot
//
var Botkit = require('botkit');
var env = process.env.NODE_ENV || "development";
var configuration = {
    log: true,
    public_address: public_url,
    ciscospark_access_token: process.env.SPARK_TOKEN,
    secret: process.env.SECRET, // this is a RECOMMENDED security setting that checks of incoming payloads originate from Cisco Spark
    webhook_name: process.env.WEBHOOK_NAME || ('built with BotKit (' + env + ')')
}

if (process.env.REDIS_URL) {
    // Initialize Redis storage
    var redisConfig = {
        // for local dev:  redis://127.0.0.1:6379
        // if on heroku :  redis://h:PASSWORD@ec2-54-86-77-126.compute-1.amazonaws.com:60109
        url: process.env.REDIS_URL
        // uncomment to add extra global key spaces to store data, example:
        //, methods: ['activities']
        // uncomment to override the Redis namespace prefix, Defaults to 'botkit:store', example:
        //, namespace: 'cisco:devnet'
    };

    // Create Redis storage for BotKit
    try {
        var redisStorage = require('botkit-storage-redis')(redisConfig);
        configuration.storage = redisStorage;
        console.log("Redis storage successfully initialized");
        // Note that we did not ping'ed Redis yet
        // then a 'ECONNREFUSED' error will be thrown if the Redis can be ping'ed later in the initialization process
        // which is fine in a "Fail Fast" strategy
    }
    catch (err) {
        console.log("Could not initialise Redis storage, check the provided Redis URL, err: " + err.message);
    }
}
var controller = Botkit.sparkbot(configuration);
var bot = controller.spawn({ });

//
// Launch bot
//
var port = process.env.PORT || 3000;
controller.setupWebserver(port, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        console.log("Cisco Spark: Webhooks set up!");
    });

    // installing Healthcheck
    var healthcheck = {
        "up-since": new Date(Date.now()).toGMTString(),
        "hostname": require('os').hostname() + ":" + port,
        "version": "v" + require("./package.json").version,
        "bot": "unknown",   // loaded asynchronously
        "botkit": "v" + bot.botkit.version()
    };
    webserver.get(process.env.HEALTHCHECK_ROUTE, function (req, res) {

        // As the identity is load asynchronously from Cisco Spark token, we need to check until it's fetched
        if (healthcheck.bot == "unknown") {
            var identity = bot.botkit.identity;
            if (bot.botkit.identity) {
                healthcheck.bot = bot.botkit.identity.emails[0];
            }
        }

        res.json(healthcheck);
    });
    console.log("Cisco Spark: healthcheck available at: " + process.env.HEALTHCHECK_ROUTE);
});

var imap = {
  user: "vraulsan",
  password: process.env.MAILERPASSWORD,
  host: "imap.gmail.com",
  port: 993, //imap port
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

notifier(imap)
  .on('mail', mail => console.log(mail))
  .start();
const n = notifier(imap);
n.on('end', () =>  n.start())
  .on('mail', mail => console.log(mail.from[0].address, mail.subject))
  .start();



//
// Load skills
//
var normalizedPath = require("path").join(__dirname, "skills");
require("fs").readdirSync(normalizedPath).forEach(function (file) {
    try {
        require("./skills/" + file)(controller, bot);
        console.log("Cisco Spark: loaded skill: " + file);
    }
    catch (err) {
        if (err.code == "MODULE_NOT_FOUND") {
            if (file != "utils") {
                console.log("Cisco Spark: could not load skill: " + file);
            }
        }
    }
});


//
// Cisco Spark Utilities
//

// Utility to add mentions if Bot is in a 'Group' space
bot.appendMention = function (message, command) {

    // if the message is a raw message (from a post message callback such as bot.say())
    if (message.roomType && (message.roomType == "group")) {
        var botName = bot.botkit.identity.displayName;
        return "`@" + botName + " " + command + "`";
    }

    // if the message is a Botkit message
    if (message.raw_message && (message.raw_message.data.roomType == "group")) {
        var botName = bot.botkit.identity.displayName;
        return "`@" + botName + " " + command + "`";
    }

    return "`" + command + "`";
}
