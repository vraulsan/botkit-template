const EWS = require('node-ews');
const fs = require('fs');

const ewsConfig = {
  username: process.env.MSOUSERNAME,
  password: process.env.MSOPASSWORD,
  host: 'https://outlook.charter.com'
};
const ews = new EWS(ewsConfig);

const GetFolderArgs = {
	FolderShape: {
    BaseShape:'Default'
  },
  FolderIds: {
    DistinguishedFolderId: {
      attributes: {
        Id: 'inbox'
      }
    }
  }
};
const FindFolderArgs = {
  attributes: {
    Traversal: 'Shallow'
  },
  FolderShape: {
    BaseShape: 'Default'
  },
  ParentFolderIds: {
    DistinguishedFolderId: {
      attributes: {
        Id: 'inbox'
      }
    }
  }
}
///

module.exports = function(controller) {
  controller.hears('mailer', 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, 'One sec, let me fetch that real quick...');
    ews.run('GetFolder', GetFolderArgs)
      .then(result => {
        var inbox = result.ResponseMessages.GetFolderResponseMessage.Folders.Folder;
        ews.run('FindFolder', FindFolderArgs)
          .then (result => {
            var folders = result.ResponseMessages.FindFolderResponseMessage.RootFolder.Folders.Folder;
            var botMessage = generateMarkdown(inbox, folders)
            console.log(botMessage);
            bot.reply(message,{text: 'If you had markdown enabled you would be able to see something cool...', markdown: botMessage});
          })
          .catch(err => {console.log(err.message)});
      })
      .catch(err => {console.log(err.message)});
  });
};


var generateMarkdown = function (inbox, folders) {
  var inboxMessage = ''+ /*+ '   id: ' + inbox.FolderId.attributes.Id + '\n'*/
                    '> totals messages: ' + '**'+inbox.TotalCount+'**' + '\n\n' +
                    '> unread messages: ' + '**'+inbox.UnreadCount+'**' + '\n\n';
  var foldersMessage = ''
  for (var i=0;i<folders.length;i++) {
    var foldersMessage = foldersMessage +
                        '**'+folders[i].DisplayName+'**' + '\n\n' + '- - -' + '\n\n' +/*+ '   id: ' + folders[i].FolderId.attributes.Id + '\n'*/
                        '> total messages: ' + '**'+folders[i].TotalCount+'**' + '\n\n' +
                        '> unread messages: ' + '**'+folders[i].UnreadCount+'**' + '\n\n'
  }
  var headerMessage = '## EIP Inbox\n\n'+'- - -\n\n'
  var footerMessage = '- - -' + '\n\n' + 'You can say something like **"expand inbox"** or **"expand cisco"** to see the last few subject lines (coming soon)'
  var finalMessage = headerMessage + inboxMessage + foldersMessage + footerMessage;
  return finalMessage
}
