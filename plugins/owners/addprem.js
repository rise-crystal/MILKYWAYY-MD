import { Command } from '../../lib/handler.js';

const refreshInterval = 1000; // 1 second

Command.create({
  name: 'addprem',
  description: 'Menambahkan user menjadi premium.',
  category: 'owner',
  usage: '[duration]',
  pattern: /^[!\/]addpremium/i,
  owner: true,
  async run({ m, conn, db }) {
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di dalam grup');
    if (!m.isOwner || !m.key.fromMe) return m.reply('Anda tidak memiliki izin untuk menggunakan fitur ini');
    if (!m.quoted) return m.reply('Balas pesan pengguna yang ingin diberikan status premium');
    
    let duration = m.args[0];
    if (!duration) return m.reply('Masukkan durasi premium (contoh: 1h, 1m, 1b)');

    let target = m.quoted.participant || m.chat;
    let user = db.user[target];
    if (!user) return m.reply('Pengguna tidak ditemukan di database');

    let days;
    if (duration.endsWith('h')) {
      days = parseInt(duration) / 24;
    } else if (duration.endsWith('m')) {
      days = parseInt(duration) / (24 * 30);
    } else if (duration.endsWith('b')) {
      days = parseInt(duration) / (24 * 30 * 30);
    } else {
      days = parseInt(duration);
    }

    user.expiredPremium = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    m.reply(`Berhasil menambahkan status premium untuk pengguna selama ${days} hari.`);
  }
});

Command.create({
  name: 'delprem',
  description: 'Menghapus status premium dari user.',
  category: 'owner',
  usage: '',
  pattern: /^[!\/]deletepremium/i,
  owner: true,
  async run({ m, conn, db }) {
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di dalam grup');
    if (!m.isOwner || !m.key.fromMe) return m.reply('Anda tidak memiliki izin untuk menggunakan fitur ini');
    if (!m.quoted) return m.reply('Balas pesan pengguna yang ingin dihapus status premiumnya');
    
    let target = m.quoted.participant || m.chat;
    let user = db.user[target];
    if (!user) return m.reply('Pengguna tidak ditemukan di database');

    user.expiredPremium = undefined;
    m.reply(`Berhasil menghapus status premium dari pengguna.`);
  }
});

Command.create({
  name: 'listprem',
  description: 'Menampilkan daftar pengguna premium.',
  category: 'owner',
  usage: '',
  pattern: /^[!\/]listpremium/i,
  owner: true,
  async run({ m, conn, db }) {
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di dalam grup');
    if (!m.isOwner || !m.key.fromMe) return m.reply('Anda tidak memiliki izin untuk menggunakan fitur ini');

    let premiumUsers = Object.entries(db.user).filter(([_, user]) => user.expiredPremium && new Date(user.expiredPremium).getTime() > Date.now()).map(([key, user]) => {
      let name = conn.getName(key);
      return name + ' (' + new Date(user.expiredPremium).toLocaleString() + ')';
    });
    
    if (premiumUsers.length > 0) {
      m.reply('Daftar pengguna premium:\n' + premiumUsers.join('\n'));
    } else {
      m.reply('Tidak ada pengguna premium saat ini.');
    }
  }
});

// Set interval to refresh expired premium status
setInterval(() => {
  let now = Date.now();
  for (let key in db.user) {
    let user = db.user[key];
    if (user.expiredPremium && new Date(user.expiredPremium).getTime() <= now) {
      user.expiredPremium = undefined;
    }
  }
}, refreshInterval);
