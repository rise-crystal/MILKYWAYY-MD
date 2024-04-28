import { Command } from '../../lib/handler.js';

Command.create({
  name: 'autoremove',
  category: 'Group',
  description: 'Mengaktifkan atau menonaktifkan fitur otomatis menghapus peserta.',
  usage: '[on/off]',
  async run({ m, conn, db }) {
    if (!m.isOwner) {
      return m.reply('Only the bot owner can use this command.');
    }
    const groupConfig = db.group[m.chat];
    
    if (m.args[0]?.toLowerCase() === 'on') {
      groupConfig.autoRemovedParticipants = true;
      return m.reply('Fitur otomatis menghapus peserta telah diaktifkan.');
    } else if (m.args[0]?.toLowerCase() === 'off') {
      groupConfig.autoRemovedParticipants = false;
      return m.reply('Fitur otomatis menghapus peserta telah dinonaktifkan.');
    } else {
      return m.reply('Penggunaan: .autoremove [on/off]');
    }
  }
});
