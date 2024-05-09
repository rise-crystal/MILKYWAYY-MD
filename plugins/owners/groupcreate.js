import { Command } from '../../lib/handler.js';

Command.create({
  name: 'creategroup',
  category: 'Group Management',
  description: 'Create a new group',
  async run({ m, conn }) {
    if (!m.isOwner) {
      return m.reply('Only the bot owner can use this command.');
    }

    if (!m.query) {
      return m.reply('Please provide a group name and participants.');
    }

    try {
      const parts = m.query.split('"');
      const subject = parts[1].trim();
      const mentions = parts[2].split(',').map(mention => {
        const match = mention.match(/@(\d{9,})/);
        return match ? match[1] + '@c.us' : null;
      }).filter(Boolean);

      await conn.groupCreate(subject, mentions);
      const example = `Contoh penggunaan:\n.setantilink "Nama Grup" @1234567890,@2345678901`;
      return m.reply('Group created successfully.\n' + example);
    } catch (error) {
      console.error(error);
      return m.reply('Failed to create group.');
    }
  }
});
