import { Command } from '../../lib/handler.js';

Command.create({
  name: 'restart',
  category: 'owner',
  description: 'For restarting bot.',
  async run({ m, conn }) {
    if (!m.isOwner) {
      return m.reply("Maaf, command ini hanya dapat digunakan oleh owner.");
    }

    return new Promise((resolve, reject) => {
      m.reply("Bot berhasil di-restart.")
      .then(() => {
        process.exit(0);
        resolve();
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
        reject(err);
      });
    });
  },
});
