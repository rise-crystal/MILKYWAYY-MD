import { Command } from '../../lib/handler.js';

async function replaceCustomText(text, m, conn) {
  return text
    .replace(/@pushname/g, m.sender)
    .replace(/@groupname/g, (await conn.groupMetadata(m.chat)).subject || '')
    .replace(/"/g, ''); // Menghapus semua tanda kutip ganda dari teks
}

// Command .setwelcome
Command.create({
  name: 'setwelcome',
  category: 'Group Management',
  description: 'Set custom welcome message',
  usage: '[message] [-title title]',
  async run({ m, conn, db }) {
    if (!m.isOwner) return m.reply('Only group owner can use this command.');
    const args = m.args;
    if (!args[0] || args[0] === '-help') {
      return m.reply('Usage: .setwelcome [message] [-title title]\nExample: .setwelcome Halo @pushname, Selamat datang di grup @groupname -title Selamat Datang');
    }

    let title = 'Selamat Datang';
    if (args.includes('-title')) {
      const index = args.indexOf('-title');
      title = args[index + 1];
      args.splice(index, 2);
    }

    let message = args.join(' ');
    if (!message && !title) {
      return m.reply('Please provide a welcome message and/or title.\n\nUsage: .setwelcome [message] [-title title]\nExample: .setwelcome Halo @pushname, Selamat datang di grup @groupname -title Selamat Datang');
    }

    if (title) {
      db.group[m.chat].welcome.title = await replaceCustomText(title, m, conn);
    }

    if (message) {
      db.group[m.chat].welcome.message = await replaceCustomText(message, m, conn);
    }

    await m.reply('Custom welcome message set successfully.');
    console.log('Custom welcome message:', db.group[m.chat].welcome.message);
  }
});

// Command .setremove
Command.create({
  name: 'setremove',
  category: 'Group Management',
  description: 'Set custom remove message',
  usage: '[message] [-title title]',
  async run({ m, conn, db }) {
    if (!m.isOwner) return m.reply('Only group owner can use this command.');
    const args = m.args;
    if (!args[0] || args[0] === '-help') {
      return m.reply('Usage: .setremove [message] [-title title]\nExample: .setremove @pushname telah keluar dari grup @groupname -title Keluar');
    }

    let title = 'Keluar';
    if (args.includes('-title')) {
      const index = args.indexOf('-title');
      title = args[index + 1];
      args.splice(index, 2);
    }

    let message = args.join(' ');
    if (!message && !title) {
      return m.reply('Please provide a remove message and/or title.\n\nUsage: .setremove [message] [-title title]\nExample: .setremove @pushname telah keluar dari grup @groupname -title Keluar');
    }

    if (title) {
      db.group[m.chat].remove.title = await replaceCustomText(title, m, conn);
    }

    if (message) {
      db.group[m.chat].remove.message = await replaceCustomText(message, m, conn);
    }

    await m.reply('Custom remove message set successfully.');
    console.log('Custom remove message:', db.group[m.chat].remove.message);
  }
});