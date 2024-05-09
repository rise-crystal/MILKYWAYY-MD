import { Command } from '../../lib/handler.js';

Command.create({
  name: 'checkmode',
  category: 'Special for Owner',
  description: 'Check the mode for welcome, remove, promote, and demote actions.',
  async run({ m, db }) {
    if (!m.isOwner) {
      return m.reply("Maaf, command ini hanya dapat digunakan oleh owner.");
    }

    const action = m.args[0]?.toLowerCase(); // Assuming action is provided as the first argument

    if (!action) {
      return m.reply("Silakan masukkan action yang ingin dicek, contoh: `.checkmode welcome`.");
    }

    const validActions = ['welcome', 'remove', 'promote', 'demote'];
    if (!validActions.includes(action)) {
      return m.reply("Pilihan action yang tersedia adalah 'welcome', 'remove', 'promote', atau 'demote'.");
    }

    const mode = db.group[m.chat][action]?.mode ? 'On' : 'Off';
    return m.reply(`Mode for ${action} is ${mode}.`);
  },
});