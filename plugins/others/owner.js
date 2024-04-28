import { Command } from "../../lib/handler.js";

// Command .owner
Command.create({
  name: 'owner',
  category: 'Utility',
  description: 'Send contact information of the bot owner.',
  async run({ m, conn, db }) {
    const authorNumber = db.config.authorNumber[0];
    const authorName = db.config.authorName;
    
    if (!db.config.authorName) {
      db.config.authorName = conn.user.name
    }

    const arr = [[authorName, authorNumber, '']]; // Tambahan '' untuk organisasi (optional)
    conn.sendContact(m.chat, authorName, arr, m.quoted);
  }
});
