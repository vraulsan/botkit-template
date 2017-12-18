// require firebase and add config variables
var firebase = require('firebase');
var config = {
    apiKey: process.env.FIREBASE_KEY,
    authDomain: process.env.FIREBASE_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
}
// initialize firebase and obtain a database reference
firebase.initializeApp(config);
var database = firebase.database()
var ref = database.ref("tasks/");

module.exports = function(controller) {
    // add task functionality
    controller.hears(['add task (.*)'],'direct_message,direct_mention', function(bot, message) {
        var newtask = message.match[1];
        var author = message.raw_message.data.personEmail.split('.')[0]
        ref.once('value', function (snap) {
            tasksObject = snap.val();
            id = Object.keys(tasksObject).length + 1
            ref.push({
                description: newtask,
                author: author,
                completed: false,
                id: id
            });
            bot.reply(message, {
              text: 'If you had markdown enabled you would be able to see something cool...',
              markdown: '### Your task has been added and the ID is ' + String(id) + '\n\n`key is ' + ref.push().key+ '`'
            });
        });
    });
    // show tasks functionality
    controller.hears(['show tasks'], 'direct_message,direct_mention', function(bot, message) {
        bot.reply(message, 'Let me fetch that real quick for you bro...');
        ref.once('value', function (snap) {
            tasksObject = snap.val();
            listLength = Object.keys(tasksObject).length
            var tasksList = generateTaskList(tasksObject);
            //var testText = "# Message Formatting!\nSpark clients now render\nrich text"
            bot.reply(message,{text: 'If you had markdown enabled you would be able to see something cool...', markdown: tasksList});
        });
    })
    // complete a task functionality
    controller.hears(['complete task (.*)'],'direct_message,direct_mention', function(bot, message) {
        var taskToComplete = Number(message.match[1]);
        ref.orderByChild('id').equalTo(taskToComplete).once('value', function (snap) {
            var taskObj = snap.val()[Object.getOwnPropertyNames(snap.val())[0]];
            var isCompleted = taskObj.completed;
            if (isCompleted)
              return bot.reply(message, 'This task is already completed, fool');
            else
              var taskId = Object.keys(snap.val())[0]
              refPath = 'tasks/'+taskId
              var taskRef = database.ref(refPath);
              taskRef.update({completed: true})
                .then(function() {
                  return bot.reply(message, 'Task has been marked completed, good job bro.');
                })
                .catch(function(error) {
                  return bot.reply(message, 'I crashed trying to do this, tell Victor');
                });
        });
    });
};


function generateTaskList (tasksObject) {
  var text = ''
  Object.keys(tasksObject).forEach(function (key) {
    var obj = tasksObject[key];
    if (obj.completed)
        text = text +obj.id+'. ' + obj.description + ' // by ' + obj.author + '\n\n';
    else
        text = text +obj.id+'. **' + obj.description + ' // by ' + obj.author+'**' + '\n\n';
  });
  console.log(text)
  finalText = '## EIP Team Task list\n'+ '- - -\n' + text
  return finalText;
};
