import { Command } from '../../lib/handler.js';

Command.create({
  name: 'nocommandnotify',
  aliases: ['ncn'],
  category: 'Admin',
  description: 'Mengaktifkan atau menonaktifkan fitur noCommandNotice',
  usage: '[enable/disable]',
  examples: ['enable', 'disable'],
  run({ conn, m, db }) {
    if (!m.isOwner) {
      return m.reply('Fitur ini hanya bisa digunakan oleh owner');
    }

    if (m.args.length !== 1) {
      return m.reply('Format penggunaan salah. Contoh: *.nocommandnotice enable*');
    }

    const input = m.args[0].toLowerCase();

    if (input !== 'enable' && input !== 'disable') {
      return m.reply('Pilihan yang valid adalah *enable* atau *disable*');
    }

    db.config.noCommandNotice = input === 'enable';

    return m.reply(`Fitur noCommandNotice sekarang ${input === 'enable' ? 'diaktifkan' : 'dinonaktifkan'}`);
  },
});
