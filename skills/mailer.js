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
        var inboxMessage = 'Folder name: ' + inbox.DisplayName + '\n\n' + '   id: ' + inbox.FolderId.attributes.Id + '\n\n' + '   total items: ' + inbox.TotalCount + '\n\n' + '   unread items: ' + inbox.UnreadCount + '\n\n';
        ews.run('FindFolder', FindFolderArgs)
          .then (result => {
            var folders = result.ResponseMessages.FindFolderResponseMessage.RootFolder.Folders.Folder;
            var foldersMessage = '';
            for (var i=0;i<folders.length;i++) {
              var foldersMessage += 'Folder name: ' + folders[i].DisplayName + '\n\n' + '   id: ' + folders[i].FolderId.attributes.Id + '\n\n' + '   total items: ' + folders[i].TotalCount + '\n\n' + '   unread items: ' + folders[i].UnreadCount + '\n\n';
            }
            var botMessage = inboxMessage + foldersMessage
            bot.reply(message,{text: 'If you had markdown enabled you would be able to see something cool...', markdown: botMessage});
          })
          .catch(err => {console.log(err.message)});
      })
      .catch(err => {console.log(err.message)});
  });
};
