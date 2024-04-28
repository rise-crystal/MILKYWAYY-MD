import { writeFileSync } from 'fs';
import { Command } from '../lib/handler.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db, writeDB } from '../lib/database.js';
import { func } from '../lib/function.js';
import { format, inspect } from 'util';
import moment from 'moment-timezone';
import { exec } from 'child_process';

const padEnd = (str, length) => {
  const spacesToAdd = length - str.length;

  if (spacesToAdd <= 0) {
    return str;
  }

  return str + ' '.repeat(spacesToAdd);
};

export async function onMessageUpsert({ m, store }, conn, prefix) {
  try {
    if (!m.key) {
      console.error('Error: m.key is not defined.');
      return;
    }

    if (!m.isOwner && m.key.remoteJid == 'status@broadcast' && db.config.self) {
      return;
    } else if (!m.isOwner && !(m.key.remoteJid == 'status@broadcast') && db.config.self) {
      return;
    }

    if (m.isGroup && db.config.auto.read) {
      await conn.readMessages([m.key]);
    }
    
    if (m.message) {
      if (!db.user) db.user = {};
      if (!db.user[m.sender]) {
        db.user[m.sender] = { 
          product: [],
          level: 0,
          exp: 0,
          rank: 'Beginner',
          balance: 0
        };
      };

      if (m.isGroup && !db.group) db.group = {};
      if (m.isGroup && !db.group[m.chat]) {
        db.group[m.chat] = {
          antilink: {
            whatsapp: false,
            youtube: false,
            instagram: false,
            telegram: false,
            facebook : false,
            twitter: false,
            threads: false,
            snackvideo: false,
          },
          badword: {
            status: false,
            database: [],
          },
          mute: false,
          levelUpNotificationEnabled: false,
        };
      };

      if (m.isGroup && db.group[m.chat]) {
        if (!db.group[m.chat].welcome) {
          db.group[m.chat].welcome = {
            title: "Selamat Datang",
            mode: false,
            message: `Halo @${m.sender.split("@")[0]}, Selamat datang dalam grup *${(await conn.groupMetadata(m.chat)).subject}*.\n\n*Kartu Intro:*\nNama: \nUmur: \nStatus: \nAsal Kota: \nSuku: \nInstagram: `,
          };
        };
        if (!db.group[m.chat].remove) { 
          db.group[m.chat].remove = {
            title: "Keluar",
            mode: false,
            message: ` pengguna @${m.sender.split("@")[0]}, telah keluar dalam grup *${(await conn.groupMetadata(m.chat)).subject}*`,
          };
        };
        if (!db.group[m.chat].promote) { 
          db.group[m.chat].promote = {
            title: "Promote",
            mode: false,
            message: ` pengguna @${m.sender.split("@")[0]}, kini menjadi admin grup *${(await conn.groupMetadata(m.chat)).subject}*`,
          };
        };
        if (!db.group[m.chat].demote) { 
          db.group[m.chat].demote = {
            title: "Demote",
            mode: false,
            message: ` pengguna @${m.sender.split("@")[0]}, sudah bukan admin grup *${(await conn.groupMetadata(m.chat)).subject}* lagi`,
          };
        };
      };
      
      if (!db.config.isEnable) {
        db.config.isEnable = true;
      }
      
      if (!db.config.analyzeTag) {
        db.config.analyzeTag = true;
      }
      
      m.blockList = (await conn.fetchBlocklist().catch(() => undefined)) || [];
      m.isOwner = [
        conn.decodeJid(conn.user.id),
        ...db.config.authorNumber.map(number => number),
      ].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

      m.isMods =
        m.isOwner ||
        db.config.mods
          .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
          .includes(m.sender);

      m.isPremium =
        m.isOwner ||
        db.config.prems
          .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
          .includes(m.sender);

      m.groupMetadata = (m.isGroup
        ? await conn.groupMetadata(m.chat).catch(() => undefined)
        : {}) || {};
      
      m.participants = (m.isGroup ? m.groupMetadata.participants : []) || [];
      m.user = (m.isGroup
        ? m.participants.find(u => conn.decodeJid(u.id) === m.sender)
        : {}) || {};
      
      m.bot = (m.isGroup
        ? m.participants.find(u => conn.decodeJid(u.id) == conn.decodeJid(conn.user.id))
        : {}) || {};
      
      m.isRAdmin = m.user?.admin == 'superadmin' || false;
      m.isAdmin = m.isRAdmin || m.user?.admin == 'admin' || false;
      m.isBotAdmin = m.bot?.admin || false;
      
      m.extendEntry = (entry, extension) => {
        if (entry && typeof entry === 'object' && extension && typeof extension === 'object') {
          return { ...entry, ...extension };
        }
        return entry;
      };

      db.config.chat++;
      
      const logMessage = (type, name, content) => {
        const paddedType = type ? padEnd(type, 18) : '';
        const paddedName = name ? padEnd(name, 28) : '';
        const paddedContent = content ? padEnd(content, 39) : '';
        
        console.log(
          `\x1b[33m┌─────────────────────┬──────────────────────────────────┐\n` +
          `\x1b[33m│\x1b[0m \x1b[1mType:\x1b[0m ${paddedType} \x1b[33mName:\x1b[0m ${paddedName} \x1b[33m│\n` +
          `\x1b[33m│\x1b[0m \x1b[1mContent:\x1b[0m ${paddedContent} \x1b[33m│\n` +
          `\x1b[33m└─────────────────────┴──────────────────────────────────┘\x1b[0m`
        );
      }
      
      if (!m.isGroup && m.isCmd) {
        logMessage('Private Chat', m.pushName, m.command);
      } else if (m.isGroup && m.isCmd) {
        logMessage('Group Chat', m.pushName, m.command);
      } else if (!m.isGroup && !m.isCmd) {
        logMessage('Private Chat', m.pushName, m.body);
      } else if (m.isGroup && !m.isCmd) {
        logMessage('Group Chat', m.pushName, m.body);
      }

      if (m.sender && db.config.auto.post) {
        return conn.sendMessage(m.sender, {
          text: `Halo kak ${m.pushName}, Yuk gabung dengan kami di *${db.config.storeName}*, Disini kamu bisa menghasilkan uang lebih cepat dan penjualan kamu juga bakal lebih laris nantinya, Yuk daftar sekarang!\n\nUntuk melakukan pendaftaran kamu cukup melakukan registrasi dengan cara ketik *${prefix}reg nama toko*\n\nContoh : ${prefix}reg ${db.config.storeName}`,
        });
      }

      const pluginsPath = join(dirname(fileURLToPath(import.meta.url)), '../plugins');
      Command.initCommandsPath(pluginsPath);
      Command.reloadPlugins(pluginsPath);
      
      async function executeCommand(commandName) {
        return await Command.call(commandName, { m, conn, db, func, store });
      };
      
      executeCommand('eval');
      executeCommand('antilink');
      
      if (!db.config.auto.response) {
        db.config.auto.response = true;
      }
      
      if (db.config.auto.response) {
        executeCommand('getrespon')
      }
      
      if (!db.config.autobc) {
        db.config.autobc = false;
      }
      
      if (db.config.autobc) {
        await autobcgc({ m, conn, db, func });
      }
      
      const mute = (chatId) => {
        if (db.group[chatId] && db.group[chatId].mute) {
          return true;
        }
        return false;
      };
      
      if (mute(m.chat)) {
        return;
      }
      
      if (db.user[m.sender].mining) {
        if (db.user[m.sender].mining?.pemain?.find(v => v === m.sender)) {
          await tambangSumberDaya(m.sender, db.user)
        }
      }
      
      if (m.isCmd && m.command.length > 0) {
        try {
          const groupConfig = db.group[m.chat] || { openCommandAsGroup: false };
          
          if (groupConfig.openCommandAsGroup) {
            const isSenderInGroup = await conn.groupMetadata(m.chat)
            .then((metadata) => metadata.participants.map((participant) => participant.id).includes(m.sender))
            .catch((error) => {
              console.error(error);
              return false;
            });
          
            if (!isSenderInGroup) {
              if (!mute(m.chat)) {
                return m.reply(
                  `Maaf, Kamu harus bergabung dalam grup terlebih dahulu untuk menggunakan perintah ini.\n\nSilakan bergabung dalam grup untuk mendapatkan akses.\n\n${db.config.storeGLink}`
                );
              }
            }
          }
          
          if (!mute(m.chat) || m.isOwner) {
            const exists = Command.run(m.command, { conn, m, db, func, store });
            
            if (!exists) {
              String.prototype.startsWithInsensitive = function (prefix) {
                return this.toLowerCase().startsWith(prefix.toLowerCase());
              };
              
              if (m.body.startsWithInsensitive('=>') || m.body.startsWithInsensitive('$')) return;
              else if (db.config.noCommandNotice) {
                m.reply(`Maaf, Perintah ${m.command} tidak ditemukan.`);
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
      writeDB();
    }
  } catch (error) {
    console.error(error);
  }
}

async function autobcgc({ m, conn, db, func }) {
  try {
    if (!db.config.autobc) return;
    if (db.config.autobctxt === undefined) {
      return m.reply("Text broadcasting belum setel, setel text terlebih dahulu");
    }
    const autobcText = db.config.autobctxt || 'Default message';
    const all = Object.keys(await conn.groupFetchAllParticipating());
    for (let id of all) {
      await conn.sendMessage(id, {
        text: autobcText,
        mentions: [m.sender, ...func.parseMention(autobcText)]
      });
      await delay(5000);
    }
    
    return new Promise(async () => {
      await setTimeout(async () => {
        await autobcgc({ m, conn, db, func });
      }, db.config.autobctmout || 30 * 60 * 1000)
    })
  } catch (error) {
    console.error(error);
  }
}

async function tambangSumberDaya(pemain, user) {
  const intervalPertambangan = 1000; // Set interval to 1 second
  const areaPertambangan = user[pemain].mining;
  const peluangJebakan = areaPertambangan.peluangJebakan;
  let sumberDaya = { ...areaPertambangan.sumberDaya };
  let jebakan = false;

  const mineResource = () => {
    const keys = Object.keys(sumberDaya);
    const randomResource = keys[Math.floor(Math.random() * keys.length)];
    const kesulitan = sumberDaya[randomResource].kesulitan;
    const minedAmount = Math.floor(Math.random() * kesulitan * 10) + 1;

    sumberDaya[randomResource].jumlah -= minedAmount;
    if (sumberDaya[randomResource].jumlah < 0) {
      sumberDaya[randomResource].jumlah = 0;
    }
  };

  const checkForTrap = () => Math.random() < peluangJebakan;

  const miningLoop = async () => {
    while (user[pemain].afk) {
      if (checkForTrap()) {
        jebakan = true;
        break;
      } else {
        mineResource();
        await new Promise(resolve => setTimeout(resolve, intervalPertambangan));
      }
    }
  };

  await miningLoop();

  return { sumberDaya, jebakan };
}
