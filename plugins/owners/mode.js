import { Command } from '../../lib/handler.js';

Command.create({
  name: 'enable',
  category: 'Special for Owner',
  description: 'Enable the specified action (welcome, remove, promote, demote).',
  async run({ m, db }) {
    if (!m.isOwner) {
      return m.reply("Maaf, command ini hanya dapat digunakan oleh owner.");
    }

    const action = m.args[0]?.toLowerCase(); // Assuming action is provided as the first argument

    if (!action) {
      return m.reply("Silakan masukkan action yang ingin diaktifkan, contoh: `.enable welcome`.");
    }

    const validActions = ['welcome', 'remove', 'promote', 'demote'];
    if (!validActions.includes(action)) {
      return m.reply("Pilihan action yang tersedia adalah 'welcome', 'remove', 'promote', atau 'demote'.");
    }

    if (!db.group[m.chat][action]) {
      db.group[m.chat][action] = { mode: false };
    }

    db.group[m.chat][action].mode = true;
    return m.reply(`Action ${action} berhasil diaktifkan.`);
  },
});

Command.create({
  name: 'disable',
  category: 'Special for Owner',
  description: 'Disable the specified action (welcome, remove, promote, demote).',
  async run({ m, db }) {
    if (!m.isOwner) {
      return m.reply("Maaf, command ini hanya dapat digunakan oleh owner.");
    }

    const action = m.args[0]?.toLowerCase(); // Assuming action is provided as the first argument

    if (!action) {
      return m.reply("Silakan masukkan action yang ingin dinonaktifkan, contoh: `.disable welcome`.");
    }

    const validActions = ['welcome', 'remove', 'promote', 'demote'];
    if (!validActions.includes(action)) {
      return m.reply("Pilihan action yang tersedia adalah 'welcome', 'remove', 'promote', atau 'demote'.");
    }

    if (!db.group[m.chat][action]) {
      db.group[m.chat][action] = { mode: false };
    }

    db.group[m.chat][action].mode = false;
    return m.reply(`Action ${action} berhasil dinonaktifkan.`);
  },
});

Command.create({
  name: 'setaction',
  category: 'Special for Owner',
  description: 'Set the title and message for specified action (welcome, remove, promote, demote).',
  async run({ m, db }) {
    if (!m.isOwner) {
      return m.reply("Maaf, command ini hanya dapat digunakan oleh owner.");
    }

    const action = m.args[0]?.toLowerCase(); // Assuming action is provided as the first argument
    const title = m.args[1]; // Assuming title is provided as the second argument
    const message = m.args.slice(2).join(' '); // Assuming message is provided as the third argument onwards

    if (!action || !title || !message) {
      return m.reply("Format yang benar: `.setaction <action> <title> <message>`\nContoh: `.setaction welcome Selamat Datang Selamat bergabung di grup kami!`");
    }

    const validActions = ['welcome', 'remove', 'promote', 'demote'];
    if (!validActions.includes(action)) {
      return m.reply("Pilihan action yang tersedia adalah 'welcome', 'remove', 'promote', atau 'demote'.");
    }

    if (!db.group[m.chat][action]) {
      db.group[m.chat][action] = {};
    }

    db.group[m.chat][action] = { title, mode: db.group[m.chat][action]?.mode || false, message };
    return m.reply(`Action ${action} berhasil diatur dengan title: ${title} dan message: ${message}.`);
  },
});
