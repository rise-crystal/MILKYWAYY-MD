import { Command } from '../../lib/handler.js';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import os from 'os';
import moment from 'moment-timezone';
import { listFont } from '../../lib/font.js';
import { EventEmitter } from 'events';
import { runtime } from '../../event/machine/asset/function.js';
import { getCoin } from '../../event/machine/asset/inventory.js';
import { checkPremiumUser } from '../../event/machine/asset/premium.js';
import SETTING from '../../event/machine/globally.js';

const emitter = new EventEmitter();

emitter.setMaxListeners(20);

Command.create({
  name: 'menu',
  category: 'Other',
  description: 'menampilkan daftar perintah pada bot',
  async run({ m, db, conn }) {
    try {
      const listcategories = [...new Set(Array.from(Command.commands.values(), command => command.category))];
      const expNeeded = expNeededForNextLevel(db.user[m.sender].level);
      const currentTime = moment().tz('Asia/Jakarta').locale('id').format('dddd, D MMMM YYYY HH:mm:ss');
      const productLength = db.user[m.sender].product ? db.user[m.sender].product.length : 0;
      
      if (!db.config.styleMenu) {
        db.config.styleMenu = {
          prefix: '╭─',
          line: '│',
          closing: '╰'
        };
      } 
      
      const player = m.sender;
      const playerData = db.user[player];
      const playerInfo = playerData ?
        `${db.config.styleMenu['line']} 👤 Player: ${playerData.nama || '-'}\n` +
        `${db.config.styleMenu['line']} ⚔️ Level: ${playerData.level !== undefined ? playerData.level : 0}\n` +
        `${db.config.styleMenu['line']} ❤️ Health: ${playerData.health !== undefined ? playerData.health : '-'}\n` +
        `${db.config.styleMenu['line']} 💪 Strength: ${playerData.strength !== undefined ? playerData.strength : '-'}\n` +
        `${db.config.styleMenu['line']} 🛡️ Defense: ${playerData.defense !== undefined ? playerData.defense : '-'}\n` +
        `${db.config.styleMenu['line']} 🎮 Playing: ${playerData.isPlaying !== undefined ? (playerData.isPlaying ? '🏁 Active Player' : '🚫 Not a Player') : '🚫 Not a Player'}\n` : `🚫 Not a player\n`;

      const totalPlayers = Object.keys(db.user).length;

      let widget, text;
      let speed = SETTING.modul.speed
      let timestampe = speed();
      let latensie = speed() - timestampe 
      let prem = await checkPremiumUser(m.sender, global.USER_PREMIUM) ? "Ya" : "Tidak"    

      widget = `Server: ` + os.hostname() + '\n' +
        `Platform: ` + os.platform() + `\n` +
        `\n${db.config.styleMenu['prefix']} *STATUS RPG DUNGEON* ⛰️\n` + playerInfo +
        `${db.config.styleMenu['line']} ⏫ Level Chat: ${db.user[m.sender].level} > ${db.user[m.sender].level + 1}\n` +
        `${db.config.styleMenu['line']} 💡 Xp Chat: ${formatAngka(db.user[m.sender].exp)} / ${formatAngka(expNeeded)}\n` +
        `${db.config.styleMenu['line']} 🏆 Rank Chat: ${db.user[m.sender].rank}\n` +
        `${db.config.styleMenu['line']} 👥 Total Pengguna: ${formatAngka(totalPlayers)}\n` +
        `${db.config.styleMenu['closing']}\n` +
        `\n${db.config.styleMenu['prefix']} *INFO BOT AUTOMATION 🤖*\n` +
        `${db.config.styleMenu['line']} 🪙 Koin: ${getCoin(m.sender)}\n` +
        `${db.config.styleMenu['line']} 🚀 Kecepatan: ${latensie.toFixed(4)} detik\n` +
        `${db.config.styleMenu['line']} 🌟 Premium: ${prem}\n` +
        `${db.config.styleMenu['line']} 🏃 Run time: ${runtime(process.uptime())}\n` +
        `${db.config.styleMenu['closing']}\n` +
        `\n${db.config.styleMenu['prefix']} *INFO PRODUCT SHOPPING* 🧺\n` +
        `${db.config.styleMenu['line']} 💰 Uang: Rp${formatRupiah(db.user[m.sender].balance)}\n` +
        `${db.config.styleMenu['line']} 📦 Produk: ${productLength === 0 ? 0 : formatAngka(productLength)}\n` +
        `${db.config.styleMenu['closing']}\n\n`;

let { listforcmd_, end_counter } = await Command.indexMenu(m)
text += `\n\n*MENU (CALL PLUGIN)*\n`;
text += listforcmd_;

      const content = await readFile("./event/modem/case.js", 'utf8');
      const cases = content.match(/case\s+"([^"]+)":\s+?{\s+?category:\s+"([^"]+)"/g).map((match) => {
        const [_, caseName, category] = match.match(/"([^"]+)":\s+?{\s+?category:\s+"([^"]+)"/);
        return { name: caseName, category };
      });
      
      
      const categorizedCases = cases.reduce((acc, cur) => {
        acc[cur.category] = acc[cur.category] || [];
        acc[cur.category].push(cur.name);
        return acc;
      }, {});

text += `\n\n*MENU (CASE DEFAULT)*\n`;
Object.entries(categorizedCases).forEach(([category, cases]) => {
  text += `╭─❒ 「 *${category.toUpperCase()}* 」 \n`;
  const formattedCases = cases.map((c, i) => `│❒ ${m.prefix}${c}`).join('\n');
  text += `${formattedCases}\n╰❒\n\n`;
});

      const caseFileRxjs = "./event/modem/rxjs.js";
      const contentRxjs = await readFile(caseFileRxjs, 'utf8');
      const casesRxjs = contentRxjs.match(/case\s+['"]([^'"]+)['"]:\s*{\s*category:\s*['"]([^'"]+)['"]/g).map((match) => {
        const [_, caseName, category] = match.match(/case\s+['"]([^'"]+)['"]:\s*{\s*category:\s*['"]([^'"]+)['"]/);
        return { name: caseName, category };
      });
      
      const categoriesRxjs = [...new Set(casesRxjs.map(command => command.category))];
      const categorizedCasesRxjs = {};
      categoriesRxjs.forEach(category => {
        categorizedCasesRxjs[category] = casesRxjs.filter(command => command.category === category).map(command => command.name);
      });
text += `\n\n*MENU (RXJS SWITCH)*\n`;
Object.entries(categorizedCasesRxjs).forEach(([category, cases]) => {
  text += `╭─❒ 「 *${category.toUpperCase()}* 」 \n`;
  const formattedCases = cases.map((c, i) => `│❒ ${c}`).join('\n');
  text += `${formattedCases}\n╰❒\n\n`;
});

      const commands = Object.values(global.plugins).map(plugin => plugin);
      const tags = [...new Set(commands.flatMap(cmd => cmd.tags || []))];
      const tagNames = {
        ai: 'Artificial Intelligence',
        downloader: 'Media Downloader',
        group: 'Only Group!',
        maker: 'Maker',
        baileys: 'Baileys',
        owner: 'Only owner!',
        religion: 'Religion',
        game: 'Game',
        RPG: 'RPG Survival',
        tools: 'Tools',
        search: 'Search',
        art: 'Art Works',
        stablediffusion: 'Stable Diffusion (AI)',
        tts: 'Text To Speech (AI)',
        voice_changer: 'Voice Changer (AI)',
        other: 'Others',
        bluearchive: 'Blue Archive TTS (AI)',
        random: 'Random',
        primbon: 'Primbon'
      };

      function getCommandsByTag(tag) {
        const matchingCommands = commands.filter(cmd => cmd.tags === tag);
        const commandTexts = matchingCommands.flatMap(cmd => cmd.command);
        return commandTexts;
      }

let output = '';

function generateOutputByTags(tags) {
  let output = '';
  for (const tag of tags) {
    const tagName = tagNames[tag] || tag;
    const matchingCommands = getCommandsByTag(tag);
    output += `╭─❒ 「 *${tagName.toUpperCase()}* 」 \n`;
    matchingCommands.forEach((cmd) => {
      output += `│❒ .${cmd}\n`;
    });
    output += '╰❒\n\n';
  }
  return output.trim();
}

text += `\n\n*MENU (BOX PLUGIN)*\n`;
text += generateOutputByTags(tags)

      if (db.config.menuType === 'DEFAULT') {
        const caption = await setfont(widget + text, db.config.font);
        return m.reply(caption);
      } else if (db.config.menuType === 'IMAGE') {
        const caption = await setfont(widget + text, db.config.font);
        return conn.sendMessage(m.chat, {
          caption,
          image: readFileSync('./media/image/background.jpg'),
          mimetype: 'image/jpeg',
        }, { quoted: m });
      } else if (db.config.menuType === 'PRODUCT_LIST') {
        const caption = await setfont(widget, db.config.font);
        for (const category of listcategories) {
          const categoryCommands = Array.from(Command.commands.values()).filter(command => command.category === category);
          if (m.isGroup) {
            const rows = categoryCommands.map(
              command => ({
                title: command.name,
                rowId: `${m.prefix}${command.name}`,
                description: command.description
              })
            );
            return conn.sendList(m.sender, caption.slice(0, -2), db.config.botName, "Tap di sini!", category, rows, m);
          } else {
            const rows = categoryCommands.map(
              command => ({
                title: command.name,
                rowId: `${m.prefix}${command.name}`,
                description: command.description
              })
            );
            return conn.sendList(m.chat, caption.slice(0, -2), db.config.botName, "Tap di sini!", category, rows, m);
          }
        }
      }
    } catch (error) {
      console.error(error);
      return m.reply('Terjadi kesalahan dalam menampilkan menu. Silakan coba lagi nanti.');
    }
  }
});

function setfont(text, font = "default") {
  if (!font || !listFont[font]) {
    return text;
  }

  for (const char in listFont[font]) {
    if (listFont[font].hasOwnProperty(char)) {
      const regex = new RegExp(char, "g");
      text = text.replace(regex, listFont[font][char]);
    }
  }

  return text;
}

function expNeededForNextLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level)); // Contoh: setiap level memerlukan 100 * 1.5^level exp tambahan
}

function formatRupiah(angka) {
  let reverse = angka.toString().split('').reverse().join('');
  let ribuan = reverse.match(/\d{1,3}/g);
  let result = ribuan.join('.').split('').reverse().join('');
  return result;
}

function formatAngka(angka) {
  const satuan = ['', 'RB', 'JT', 'M', 'T'];
  const ukuranSatuan = 3;
  const angkaString = angka.toString().replace(/\./g, '');

  let hasil = '';
  let index = angkaString.length % ukuranSatuan || ukuranSatuan;
  let i = 0;

  while (index <= angkaString.length) {
    if (hasil) hasil = '.' + hasil;
    hasil = angkaString.substring(index - ukuranSatuan, index) + hasil;
    if (angkaString.substring(index, index + 3) && i < satuan.length - 1) hasil += ` ${satuan[i]}`;
    index += ukuranSatuan;
    i++;
  }

  return hasil.trim();
}
