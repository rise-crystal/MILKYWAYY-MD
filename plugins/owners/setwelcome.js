import { Command } from '../../lib/handler.js';

async function replaceCustomText(text, m, conn) {
  return text
    .replace(/"/g, ''); // Menghapus semua tanda kutip ganda dari teks
}

// Command .setwelcome
Command.create({
  name: 'setwelcome',
  category: 'Manajemen Grup',
  description: 'Set pesan selamat datang kustom',
  usage: '[pesan] [-title judul]',
  async run({ m, conn, db }) {
    if (!m.isOwner) return m.reply('Hanya pemilik grup yang dapat menggunakan perintah ini.');
    const args = m.args;
    if (!args[0] || args[0] === '-help') {
      return m.reply('Penggunaan: .setwelcome [pesan] [-title judul]\nContoh: .setwelcome Halo @user, Selamat datang di grup @groupname -title Selamat Datang');
    }

    let title = 'Selamat Datang';
    if (args.includes('-title')) {
      const index = args.indexOf('-title');
      title = args[index + 1];
      args.splice(index, 2);
    }

    let message = args.join(' ');
    if (!message && !title) {
      return m.reply('Silakan berikan pesan selamat datang dan/atau judul.\n\nPenggunaan: .setwelcome [pesan] [-title judul]\nContoh: .setwelcome Halo @user, Selamat datang di grup @groupname -title Selamat Datang');
    }

    if (title) {
      db.group[m.chat].welcome.title = await replaceCustomText(title, m, conn);
    }

    if (message) {
      db.group[m.chat].welcome.message = await replaceCustomText(message, m, conn);
    }

    await m.reply('Pesan selamat datang kustom berhasil diatur.');
    console.log('Pesan selamat datang kustom:', db.group[m.chat].welcome.message);
  }
});

// Command .setremove
Command.create({
  name: 'setremove',
  category: 'Manajemen Grup',
  description: 'Set pesan keluar kustom',
  usage: '[pesan] [-title judul]',
  async run({ m, conn, db }) {
    if (!m.isOwner) return m.reply('Hanya pemilik grup yang dapat menggunakan perintah ini.');
    const args = m.args;
    if (!args[0] || args[0] === '-help') {
      return m.reply('Penggunaan: .setremove [pesan] [-title judul]\nContoh: .setremove @user telah keluar dari grup @groupname -title Keluar');
    }

    let title = 'Keluar';
    if (args.includes('-title')) {
      const index = args.indexOf('-title');
      title = args[index + 1];
      args.splice(index, 2);
    }

    let message = args.join(' ');
    if (!message && !title) {
      return m.reply('Silakan berikan pesan keluar dan/atau judul.\n\nPenggunaan: .setremove [pesan] [-title judul]\nContoh: .setremove @user telah keluar dari grup @groupname -title Keluar');
    }

    if (title) {
      db.group[m.chat].remove.title = await replaceCustomText(title, m, conn);
    }

    if (message) {
      db.group[m.chat].remove.message = await replaceCustomText(message, m, conn);
    }

    await m.reply('Pesan keluar kustom berhasil diatur.');
    console.log('Pesan keluar kustom:', db.group[m.chat].remove.message);
  }
});

// Command .setpromote
Command.create({
  name: 'setpromote',
  category: 'Manajemen Grup',
  description: 'Set pesan promosi kustom',
  usage: '[pesan] [-title judul]',
  async run({ m, conn, db }) {
    if (!m.isOwner) return m.reply('Hanya pemilik grup yang dapat menggunakan perintah ini.');
    const args = m.args;
    if (!args[0] || args[0] === '-help') {
      return m.reply('Penggunaan: .setpromote [pesan] [-title judul]\nContoh: .setpromote @user kini menjadi admin di grup @groupname -title Promote');
    }

    let title = 'Promosi';
    if (args.includes('-title')) {
      const index = args.indexOf('-title');
      title = args[index + 1];
      args.splice(index, 2);
    }

    let message = args.join(' ');
    if (!message && !title) {
      return m.reply('Silakan berikan pesan promosi dan/atau judul.\n\nPenggunaan: .setpromote [pesan] [-title judul]\nContoh: .setpromote @user kini menjadi admin di grup @groupname -title Promote');
    }

    if (title) {
      db.group[m.chat].promote.title = await replaceCustomText(title, m, conn);
    }

    if (message) {
      db.group[m.chat].promote.message = await replaceCustomText(message, m, conn);
    }

    await m.reply('Pesan promosi kustom berhasil diatur.');
    console.log('Pesan promosi kustom:', db.group[m.chat].promote.message);
  }
});

// Command .setdemote
Command.create({
  name: 'setdemote',
  category: 'Manajemen Grup',
  description: 'Set pesan demosi kustom',
  usage: '[pesan] [-title judul]',
  async run({ m, conn, db }) {
    if (!m.isOwner) return m.reply('Hanya pemilik grup yang dapat menggunakan perintah ini.');
    const args = m.args;
    if (!args[0] || args[0] === '-help') {
      return m.reply('Penggunaan: .setdemote [pesan] [-title judul]\nContoh: .setdemote @user tidak lagi menjadi admin di grup @groupname -title Demote');
    }

    let title = 'Demosi';
    if (args.includes('-title')) {
      const index = args.indexOf('-title');
      title = args[index + 1];
      args.splice(index, 2);
    }

    let message = args.join(' ');
    if (!message && !title) {
      return m.reply('Silakan berikan pesan demosi dan/atau judul.\n\nPenggunaan: .setdemote [pesan] [-title judul]\nContoh: .setdemote @user tidak lagi menjadi admin di grup @groupname -title Demote');
    }

    if (title) {
      db.group[m.chat].demote.title = await replaceCustomText(title, m, conn);
    }

    if (message) {
      db.group[m.chat].demote.message = await replaceCustomText(message, m, conn);
    }

    await m.reply('Pesan demosi kustom berhasil diatur.');
    console.log('Pesan demosi kustom:', db.group[m.chat].demote.message);
  }
});
