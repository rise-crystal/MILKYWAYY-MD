import { Command } from '../../lib/handler.js';

Command.create({
  name: 'settimeoutautobc',
  category: 'Group Management',
  description: 'Set the timeout for autobroadcast',
  usage: '[timeout in minutes]',
  async run({ m, db }) {
    if (!m.isOwner) return m.reply("Maaf perintah ini khusus untuk owner");
    try {
      if (!m.query) return m.reply(`Usage: ${m.prefix}${m.command} ${m.usage}`);
      const timeout = parseInt(m.query);
      if (isNaN(timeout) || timeout <= 0) return m.reply('Invalid timeout. Timeout must be a positive number in minutes.');

      db.config.autobctmout = timeout * 60 * 1000; // Convert minutes to milliseconds
      return m.reply(`Autobroadcast timeout set to ${timeout} minutes.`);
    } catch (error) {
      console.error(error);
      return m.reply('Failed to set autobroadcast timeout.');
    }
  }
});

Command.create({
  name: 'autobcgc',
  category: 'Group Management',
  description: 'Enable or disable autobroadcast feature',
  async run({ m, db }) {
    try {
      const isEnabled = db.config.autobc ?? false;
      if (!m.query) return m.reply(`Autobroadcast is currently ${isEnabled ? 'enabled' : 'disabled'}. To toggle, use: ${m.prefix}${m.command} [enable|disable]`);

      const action = m.query.toLowerCase();
      if (action === 'enable') {
        db.config.autobc = true;
        return m.reply('Autobroadcast is now enabled.');
      } else if (action === 'disable') {
        db.config.autobc = false;
        return m.reply('Autobroadcast is now disabled.');
      } else {
        return m.reply(`Invalid action. Usage: ${m.prefix}${m.command} [enable|disable]`);
      }
    } catch (error) {
      console.error(error);
      return m.reply('Failed to toggle autobroadcast.');
    }
  }
});

Command.create({
  name: 'settextautobc',
  category: 'Group Management',
  description: 'Set the text for autobroadcast',
  usage: '[text]',
  async run({ m, db }) {
    if (!m.isOwner) return m.reply("Maaf perintah ini khusus untuk owner");
    try {
      if (!m.query) return m.reply(`Usage: ${m.prefix}${m.command} ${m.usage}`);
      db.config.autobctxt = m.query;
      return m.reply('Autobroadcast text set.');
    } catch (error) {
      console.error(error);
      return m.reply('Failed to set autobroadcast text.');
    }
  }
});
