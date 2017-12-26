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
  var inboxMessage = '**' + inbox.DisplayName + '** \n\n' + /*+ '   id: ' + inbox.FolderId.attributes.Id + '\n'*/
                    'totals messages: **' + inbox.TotalCount + '** \n' +
                    'unread messages: **' + inbox.UnreadCount + '** \n';
  var foldersMessage = ''
  for (var i=0;i<folders.length;i++) {
    var foldersMessage = foldersMessage +
                        '- - - \n' +
                        '**' + folders[i].DisplayName + '** \n\n' + /*+ '   id: ' + folders[i].FolderId.attributes.Id + '\n'*/
                        'total messages: **' + folders[i].TotalCount + '** \n' +
                        'unread messages: **' + folders[i].UnreadCount + '** \n'
  }
  var headerMessage = '## EIP Team Inbox Status \n - - - \n'
  return headerMessage + inboxMessage + foldersMessage
}


/*

## EIP Team Inbox Status \n
- - - \n
**FOLDER-NAME** \n
total messages: **n** \n
unread messages: **n** \n
- - - \n

*/
