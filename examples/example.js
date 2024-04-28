import { Command } from '../../lib/handler.js';

Command.create({
  name: 'command',
  category: 'category',
  description: 'description',
  async run({ m, db, conn }) {
    const { args, query, command, prefix, body, isGroup, isOwner, isPremium, isAdmin, isBotAdmin, sender, chat, reply, groupMetadata } = m;
    const { user, group, config = db;
    
    // example sendMessage
    // conn.sendMessage(chat, { text: '' }, { quoted: m }) || reply('')
    
    // example input
    // args[0] || query || body
    
    // example database 
    // user[sender]?... || group[chat]?...

  }
})