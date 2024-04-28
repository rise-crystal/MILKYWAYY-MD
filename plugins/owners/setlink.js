import { Command } from '../../lib/handler.js';

Command.create({
  name: 'setantilink',
  description: 'Setel pengaturan perlindungan antilink untuk grup.',
  category: 'Admin Commands',
  usage: '[enable/disable] [linktype]',
  pattern: /^[!\/](enable|disable) (whatsapp|youtube|instagram|telegram|facebook|twitter|threads|snackvideo)$/i,
  owner: true,
  async run({ m, conn, db }) {
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di dalam grup');
    if (!m.isAdmin || !m.isOwner || m.sender === conn.user.jid) return m.reply('Anda tidak memiliki izin untuk menggunakan fitur ini');
    if (!m.isBotAdmin) return m.reply('Untuk menggunakan fitur ini bot harus menjadi admin');
    let _return = '';
    let type = m.args[1]?.toLowerCase();
    let chat = m.chat;
    let enabled = m.args[0]?.toLowerCase() === 'enable';

    if (m.args[0]?.toLowerCase() === '-help') {
      return m.reply(`Setel pengaturan perlindungan antilink untuk grup.\nPenggunaan: .setantilink [enable/disable] [linktype]\n\nTipe link yang tersedia:\n- whatsapp\n- youtube\n- instagram\n- telegram\n- facebook\n- twitter\n- threads\n- snackvideo\n- wame\n\nGunakan \`.setantilink -help\` untuk melihat cara penggunaannya.`);
    }
    
    if (!['whatsapp', 'youtube', 'instagram', 'telegram', 'facebook', 'twitter', 'threads', 'snackvideo', 'wame', 'bitly'].includes(type)) {
      return m.reply(`Tipe link tidak valid. Gunakan \`.setantilink -help\` untuk melihat daftar tipe link yang tersedia dan cara penggunaannya.`);
    }

    if (!db.group[chat]) {
      db.group[chat] = {};
    }

    db.group[chat].antilink = db.group[chat].antilink || {};

    if (!db.group[chat].antilink.whatsapp) db.group[chat].antilink.whatsapp = false;
    if (!db.group[chat].antilink.youtube) db.group[chat].antilink.youtube = false;
    if (!db.group[chat].antilink.instagram) db.group[chat].antilink.instagram = false;
    if (!db.group[chat].antilink.telegram) db.group[chat].antilink.telegram = false;
    if (!db.group[chat].antilink.facebook) db.group[chat].antilink.facebook = false;
    if (!db.group[chat].antilink.twitter) db.group[chat].antilink.twitter = false;
    if (!db.group[chat].antilink.threads) db.group[chat].antilink.threads = false;
    if (!db.group[chat].antilink.snackvideo) db.group[chat].antilink.snackvideo = false;
    if (!db.group[chat].antilink.wame) db.group[chat].antilink.wame = false;
    if (!db.group[chat].antilink.bitly) db.group[chat].antilink.bitly = false;
 
    db.group[chat].antilink[type] = enabled;
    _return = `Berhasil ${enabled ? 'mengaktifkan' : 'menonaktifkan'} antilink untuk ${type}`;
    m.reply(_return);
  }
});
