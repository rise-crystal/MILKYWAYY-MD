import { Command } from '../../lib/handler.js';

Command.create({
  name: 'restart',
  category: 'Special for Owner',
  description: 'For restarting bot.',
  async run({ m, conn }) {
    if (!m.isOwner) {
      return m.reply("Maaf, command ini hanya dapat digunakan oleh owner.");
    }

    return conn.sendMessage(m.chat, { text: "Bot berhasil di-restart." }, { quoted: m })
    .then(() => process.exit(0));
  },
});
