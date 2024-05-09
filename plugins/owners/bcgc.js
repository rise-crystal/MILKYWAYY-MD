import { Command } from '../../lib/handler.js';

function query(prefix, command, parameter) {
  return `Usage: ${prefix}${command} ${parameter}`;
}

Command.create({
  name: 'bcgc',
  category: 'Group Management',
  description: 'Send a broadcast message to all groups',
  async run({ m, conn, func }) {
    try {
      if (!m.query) return m.reply(query(m.prefix, m.command, 'query'));
      const all = Object.keys(await conn.groupFetchAllParticipating());
      void await m.reply(`Sending broadcast to ${all.length} groups`);
      for (let id of all) {
        await conn.sendMessage(id, {
          text: m.query,
          mentions: [m.sender, ...func.parseMention(m.query)]
        });
        // Delay between sending messages to different groups
        await new Promise(resolve => setTimeout(resolve, 5000)); // delay 5 seconds
      }
      await m.reply(`Successfully sent broadcast to ${all.length} groups`);
    } catch (error) {
      console.error(error);
      return m.reply('Failed to send broadcast.');
    }
  }
});