import { Command } from '../../lib/handler.js';

// Command untuk tag semua anggota grup (hanya untuk admin)
Command.create({
  name: 'tagall',
  category: 'Group',
  description: 'Tag all members in the group (admin only)',
  usage: '[additional text]',
  async run({ conn, m }) {
    // Mengecek apakah pesan dari grup
    if (!m.isGroup) {
      return conn.sendMessage(m.chat, {
        text: 'Command ini hanya dapat digunakan dalam grup.',
      }, { quoted: m });
    }

    if (!m.isAdmin) {
      return conn.sendMessage(m.chat, {
        text: 'Fitur ini hanya dapat digunakan oleh admin grup.',
      }, { quoted: m });
    }

    // Mendapatkan teks tambahan dari argumen command
    const additionalText = m.args[0] ? m.args.join(' ') : '';

    // Mendapatkan daftar anggota grup dengan nomor urut
    const participants = m.participants.map((participant, index) => {
      const name = participant.id.split('@')[0];
      return `${index + 1}. @${name}`;
    }).join('\n') || '';

    // Menambahkan teks tambahan jika diinputkan oleh pengguna
    const notificationText = m.args[0] ? `\nPesan: ${additionalText}` : '';

    // Mengirim pesan dengan mention kepada semua anggota grup
    conn.sendMessage(m.chat, {
      text: `Tag all members!${notificationText}\n${participants}`,
      mentions: m.participants.map(participant => participant.id),
    }, { quoted: m });
  },
});

// Command untuk menyembunyikan tag semua anggota grup
Command.create({
  name: 'hidetag',
  category: 'Group',
  description: 'Hide tag all members in the group (admin only)',
  async run({ conn, m }) {
    // Mengecek apakah pesan dari grup
    if (!m.isGroup) {
      return conn.sendMessage(m.chat, {
        text: 'Command ini hanya dapat digunakan dalam grup.',
      }, { quoted: m });
    }

    if (!m.isAdmin) {
      return conn.sendMessage(m.chat, {
        text: 'Fitur ini hanya dapat digunakan oleh admin grup.',
      }, { quoted: m });
    }

    // Mendapatkan teks tambahan dari argumen command
    const additionalText = m.args[0] ? m.args.join(' ') : '';

    // Menambahkan teks tambahan jika diinputkan oleh pengguna
    const notificationText = m.args[0] ? `\n${additionalText}` : '';

    // Mengirim pesan tanpa mention kepada semua anggota grup
    conn.sendMessage(m.chat, {
      text: `${notificationText}`,
    }, { quoted: m });
  },
});
