import { Command } from '../../lib/handler.js';

Command.create({
  name: 'kick',
  category: 'Admin',
  description: 'Kick member from group',
  async run({ m, conn }) {
    if (!(m.isAdmin || m.isOwner || m.key.fromMe)) return m.reply('Only owner and admins can use this command.');
    
    let participants = [];
    if (m.quoted) {
      participants.push(`${m.quoted.participant}@s.whatsapp.net`);
    } else if (m.query || m.args[0].join(' ')) {
      participants = m.query.split(',').map(num => `${num}@s.whatsapp.net`);
    } else {
      return m.reply('Reply to a message or provide a number to kick the user.');
    }

    for (const participant of participants) {
      if (m.isAdmin) {
        m.reply('Sorry, you cannot kick an admin.');
        return;
      }
      await conn.groupParticipantsUpdate(m.chat, [participant], 'remove');
    }

    m.reply('User(s) have been kicked from the group.');
  }
});

Command.create({
  name: 'add',
  category: 'Admin',
  description: 'Add member to group',
  async run({ m, conn }) {
    if (!(m.isAdmin || m.isOwner || m.key.fromMe)) return m.reply('Only owner and admins can use this command.');
    
    let participants = [];
    if (m.quoted) {
      participants.push(`${m.quoted.participant}@s.whatsapp.net`);
    } else if (m.query || m.args[0].join(' ')) {
      participants = m.query.split(',').map(num => `${num}@s.whatsapp.net`);
    } else {
      return m.reply('Reply to a message or provide a number to add the user.');
    }

    for (const participant of participants) {
      if (m.isAdmin) {
        m.reply('Sorry, you cannot add an admin.');
        return;
      }
      await conn.groupParticipantsUpdate(m.chat, [participant], 'add');
    }

    m.reply('User(s) have been added to the group.');
  }
});
