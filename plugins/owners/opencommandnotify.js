import { Command } from '../../lib/handler.js';

Command.create({
  name: 'opencommandnotify',
  aliases: ['ocag'],
  category: 'Admin',
  description: 'Mengaktifkan atau menonaktifkan fungsi openCommandAsGroup',
  usage: '[enable/disable]',
  examples: ['enable', 'disable'],
  run({ conn, m, db }) {
    if (!m.isOwner) {
      return m.reply('Fitur ini hanya bisa digunakan oleh owner');
    }

    if (m.args.length !== 1) {
      return m.reply('Format penggunaan salah. Contoh: *opencommandasgroup enable*');
    }

    const input = m.args[0].toLowerCase();

    if (input !== 'enable' && input !== 'disable') {
      return m.reply('Pilihan yang valid adalah *enable* atau *disable*');
    }

    db.config.openCommandAsGroup = input === 'enable';

    return m.reply(`Fungsi openCommandAsGroup sekarang ${input === 'enable' ? 'diaktifkan' : 'dinonaktifkan'}`);
  },
});
