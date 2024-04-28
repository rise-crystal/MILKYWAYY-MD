import { Command } from '../../lib/handler.js';

Command.create({
  name: 'antilink',
  category: 'function',
  hidden: true,
  isFunction: true,
  async run({ conn, m, db }) {
    const groupConfig = db.group[m.chat];
    const userDb = db.user[m.sender];

    if (!userDb.warning) {
      userDb.warning = 0;
    }

    if (!groupConfig.antilink || typeof groupConfig.antilink !== 'object') return;

    if (!groupConfig.autoRemovedParticipants) {
      groupConfig.autoRemovedParticipants = false;
    }

    const antilinkTypes = {
      whatsapp: { regex: /(chat.whatsapp.com)/gi, name: 'WhatsApp' },
      snackvideo: { regex: /(sckv)/gi, name: 'SnackVideo' },
      youtube: { regex: /(youtube\.com|youtu\.be)/gi, name: 'YouTube' },
      instagram: { regex: /(instagram\.com)/gi, name: 'Instagram' },
      telegram: { regex: /(t\.me|telegram\.me)/gi, name: 'Telegram' },
      facebook: { regex: /(facebook\.com)/gi, name: 'Facebook' },
      twitter: { regex: /(twitter\.com)/gi, name: 'Twitter' },
      wame: { regex: /(wa\.me)/gi, name: 'WhatsApp Direct' },
      bitly: { regex: /(bit\.ly)/gi, name: 'Bitly' }
    };

    for (const [type, antilink] of Object.entries(groupConfig.antilink)) {
      if (!antilink) continue;
      const antilinkType = antilinkTypes[type];
      if (!antilinkType) continue;

      const acceptMessage = groupConfig.autoRemovedParticipants ?
        `*Antilink ${antilinkType.name} Detected!*\n\nMaaf, Kamu dikeluarkan dalam grup ${(await conn.groupMetadata(m.chat)).subject}` :
        `*Antilink ${antilinkType.name} Detected!*\n\nMaaf, Pesan Anda dihapus. Tolong patuhi peraturan dalam grup ${(await conn.groupMetadata(m.chat)).subject}`;

      if (m.body.match(antilinkType.regex)) {
        if (m.sender === conn.user.jid && m.key.fromMe || m.isOwner || m.isAdmin) return;
        else if (!m.isBotAdmin) return m.reply("Maaf, Fungsi ini hanya bisa bekerja ketika bot menjadi admin.");
        else return conn.sendMessage(m.chat, { text: acceptMessage }).then(() => {
          if (!groupConfig.autoRemovedParticipants) {
            userDb.warning++;
            if (userDb.warning >= 5) {
              delete userDb.warning;
              void conn.sendMessage(m.chat, { delete: m.key })
                .then(() => conn.sendMessage(m.chat, { text: `*Warning!* Pengguna @${m.sender.split("@")[0]} telah melakukan pelanggaran sebanyak 5 kali, Maaf kamu dikeluarkan dalam grup ini.` })
                  .then(() => conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')));
            } else {
              void conn.sendMessage(m.chat, { delete: m.key })
                .then(() => m.reply(`⚠ Warning! Anda telah melakukan pelanggaran sebanyak ${userDb.warning} kali. Jika kamu sudah melakukan pelanggaran sebanyak 5 kali maka kamu secara otomatis akan dikeluarkan dalam grup ini.`));
            }
          } else {
            void conn.sendMessage(m.chat, { delete: m.key })
              .then(() => conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove'));
          }
        });
        return;
      }
    }
  }
});
