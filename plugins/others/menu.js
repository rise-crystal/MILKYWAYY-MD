import { Command } from '../../lib/handler.js';
import fs from 'fs';

var listFont = Object.create(null);

Object.defineProperties(listFont, {
  doublestruck: {
    value: {
      a: '𝕒', b: '𝕓', c: '𝕔', d: '𝕕', e: '𝕖', f: '𝕗', g: '𝕘', h: '𝕙', i: '𝕚', j: '𝕛',
      k: '𝕜', l: '𝕝', m: '𝕞', n: '𝕟', o: '𝕠', p: '𝕡', q: '𝕢', r: '𝕣', s: '𝕤', t: '𝕥', u: '𝕦',
      v: '𝕧', w: '𝕨', x: '𝕩', y: '𝕪', z: '𝕫', A: '𝔸', B: '𝔹', C: 'ℂ', D: '𝔻', E: '𝔼', F: '𝔽',
      G: '𝔾', H: 'ℍ', I: '𝕀', J: '𝕁', K: '𝕂', L: '𝕃', M: '𝕄', N: 'ℕ', O: '𝕆', P: 'ℙ', Q: 'ℚ',
      R: 'ℝ', S: '𝕊', T: '𝕋', U: '𝕌', V: '𝕍', W: '𝕎', X: '𝕏', Y: '𝕐', Z: 'ℤ'
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
  fullwidth: {
    value: {
      a: 'ａ', b: 'ｂ', c: 'ｃ', d: 'ｄ', e: 'ｅ', f: 'ｆ', g: 'ｇ', h: 'ｈ', i: 'ｉ', j: 'ｊ',
      k: 'ｋ', l: 'ｌ', m: 'ｍ', n: 'ｎ', o: 'ｏ', p: 'ｐ', q: 'ｑ', r: 'ｒ', s: 'ｓ', t: 'ｔ', u: 'ｕ',
      v: 'ｖ', w: 'ｗ', x: 'ｘ', y: 'ｙ', z: 'ｚ', A: 'Ａ', B: 'Ｂ', C: 'Ｃ', D: 'Ｄ', E: 'Ｅ', F: 'Ｆ',
      G: 'Ｇ', H: 'Ｈ', I: 'Ｉ', J: 'Ｊ', K: 'Ｋ', L: 'Ｌ', M: 'Ｍ', N: 'Ｎ', O: 'Ｏ', P: 'Ｐ', Q: 'Ｑ',
      R: 'Ｒ', S: 'Ｓ', T: 'Ｔ', U: 'Ｕ', V: 'Ｖ', W: 'Ｗ', X: 'Ｘ', Y: 'Ｙ', Z: 'Ｚ'
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
  smallcaps: {
    value: {
      a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
      k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ',
      v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ', A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ',
      G: 'ɢ', H: 'ʜ', I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ', Q: 'ǫ',
      R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x', Y: 'ʏ', Z: 'ᴢ'
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
});

Command.create({
  name: 'menu',
  category: 'General For Users',
  run: async ({ db, conn, m }) => {
    const user = db.user[m.sender];
    if (!user.font) {
      user.font = 'default';
    }
    if (m.args.length > 0 && m.args[0].startsWith('-')) {
      if (m.query.startsWith('-setfont')) {
        let requestedFont = m.query.substring(9).trim().toLowerCase();
        let availableFonts = Object.keys(listFont);
        if (availableFonts.includes(requestedFont)) {
          user.font = requestedFont;
          await conn.sendMessage(m.chat, { text: `Font telah diubah menjadi ${requestedFont}` }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, { text: `Font '${requestedFont}' tidak tersedia. Font yang tersedia adalah: ${availableFonts.join(', ')}` }, { quoted: m });
        }
      } else if (m.query.startsWith('-setimage')) {
        if (m.isOwner) {
          if (m.quoted && m.quoted.type === 'imageMessage') {
            let imagePath = `media/image/background.jpeg`; // set the image path to the default background image
            await m.quoted.download(imagePath); // download the image and overwrite the existing background image
            await conn.sendMessage(m.chat, { text: `Image telah diubah.` }, { quoted: m });
          } else {
            await conn.sendMessage(m.chat, { text: `Reply dengan gambar yang ingin dijadikan background.` }, { quoted: m });
          }
        } else {
          await conn.sendMessage(m.chat, { text: 'Fitur ini hanya bisa digunakan oleh owner.' }, { quoted: m });
        }
      }
    } else {
      let widget = `Halo @${m.sender.split("@")[0]}, semoga harimu menyenangkan!\n\n`;
      widget += `• *Info Pengguna*\n`;
      widget += `  - Saldo : Rp.${formatRupiah(db.user[m.sender].balance)}\n`;
      widget += `  - Status : ${db.user[m.sender].isOrder ? 'Menunggu pembayaran' : 'Belum melakukan order'}\n\n`;
      widget += `• *Info Command*\n`;
      widget += `🅞 = khusus owner\n🅟 = khusus premium user\n🅖 = khusus dalam grup\n🅛 = menggunakan limit\n\n`;
      const menu = Command.indexMenu(m, "\n\n", user);
      const index = widget + menu;
      
      let imagePath = `media/image/background.jpeg`;
      await conn.sendMessage(m.chat, {
        image: fs.readFileSync(imagePath),
        caption: applyFont(index, user.font),
        mimetype: "image/jpeg",
        mentions: [m.sender]
      }, { quoted: m });
    };
  },
  description: 'Menampilkan status akun dan menu penjual.',
  pattern: /^!menu$/i,
});

function formatRupiah(angka) {
let reverse = angka.toString().split('').reverse().join('');
let ribuan = reverse.match(/\d{1,3}/g);
let result = ribuan.join('.').split('').reverse().join('');
return result;
}

function applyFont(text, font) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let replacement = listFont[font]?.[char] || char; // Mengambil karakter yang sesuai dengan font, jika tidak tersedia, gunakan karakter asli
    result += replacement;
  }
  return result;
}
