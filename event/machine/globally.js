import fs, { watch } from 'fs';
import fetch from 'node-fetch';
import chalk from 'chalk';
import axios from 'axios';
import baileys from "@whiskeysockets/baileys";
import boom from '@hapi/boom';
import cheerio from "cheerio";
import child from 'child_process';
import chokidar from 'chokidar';
import https from 'https';
import jimp from 'jimp';
import ms from 'parse-ms';
import NodeCache from "node-cache";
import path from "path";
import pino from "pino";
import qrcode from 'qrcode';
import request from 'request';
import readline from "readline";
import speed from 'performance-now';
import time from "moment-timezone";
import util from "util";
import cekprem from 'parse-ms';
import form from 'form-data'
import { fileURLToPath } from 'url';
import { db } from '../../lib/database.js';

const __filename = fileURLToPath(import.meta.url);

if (!fs.existsSync('./database/' + 'cmd.json')) {
  fs.writeFileSync('./database/' + 'cmd.json', JSON.stringify({
  "total": 0,
  "cmd": []
  }, null, 2))
}
if (!fs.existsSync('./database/' + 'userchat.json')) {
  fs.writeFileSync('./database/' + 'userchat.json', JSON.stringify([]))
}
if (!fs.existsSync('./database/' + 'mute.json')) {
  fs.writeFileSync('./database/' + 'mute.json', JSON.stringify([]))
}
if (!fs.existsSync('./database/' + 'co_owner.json')) {
  fs.writeFileSync('./database/' + 'co_owner.json', JSON.stringify([]))
}
if (!fs.existsSync('./database/' + 'premium.json')) {
  fs.writeFileSync('./database/' + 'premium.json', JSON.stringify([]))
}
if (!fs.existsSync('./database/' + 'inventory.json')) {
  fs.writeFileSync('./database/' + 'inventory.json', JSON.stringify([]))
}

global.ownerNumber = db.config.authorNumber
global.MUTE = JSON.parse(fs.readFileSync('./database/mute.json'));
global.USE_CMD = JSON.parse(fs.readFileSync('./database/cmd.json'))
global.USER_PREMIUM = JSON.parse(fs.readFileSync('./database/premium.json'));

global.use = []
global.game = []
global._tebakkata = []
global._tebakgambar = []
global._siapakahaku = []
global._tebakbendera = []
global._math = []
global._susunkata = []
global._family100 = []
global._asahotak = []
global._tekateki = []
global._tebaklagu = []
global._pilihanganda = []
const gameTypes = [
  'game',
  'tebakkata',
  'susunkata',
  'siapakahaku',
  'tebakbendera',
  'tebakgambar',
  'family100',
  'asahotak',
  'tekateki',
  'tebaklagu',
  'pilihanganda'
];

gameTypes.forEach(type => {
  const filename = `${type}.json`
  const filePath = './database/' + filename;
  if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
  global[["game"].includes(type) ? "game": `_${type}`] = [];
  } else {
  global[["game"].includes(type) ? "game": `_${type}`] = [];
  }
})

global.api = {
  rifza: {
    key: "",
    url: "https://rifza.me"
  },
  neoxr: {
    key: "",
    url: "https://api.neoxr.eu"
  },
  yanz: {
    url: "https://api.yanzbotz.my.id"
  }
}

export default {
  ig: db.config.sourceUrl,
  botName: db.config.botName,
  ownerName: db.config.authorName,
  coinawal: 1000,
  darahawal: 100,
  besiawal: 15,
  emasawal: 10,
  emeraldawal: 5,
  umpanawal: 5,
  expawal: 0,
  potionawal: 1,
  rpg: {
    mining: {
      max: 5,
      cd: 3600000
    },
    mancing: {
      max: 5,
      cd: 3600000
    },
    berburu: {
      max: 5,
      cd: 3600000
    }
  },
  harga: {
    normal: 45,
    medium: 65,
    high: 100,
    expensive: 150,
    tiktok: 59,
    threads: 47,
    ytmp3: 64,
    ytmp4: 87,
    ssweb: 65,
    img_generation: 100,
    chatbot: 900
  },
  message: ['[ *[❗]CHAT DITERUSKAN[❗]* ]', 'Khusus Group!', 'Khusus Owner!', 'Khusus Admin!', 'Bot bukan Admin!', '```「▰▰▱▱▱▱▱▱▱▱」Loading...```', '```「▰▰▰▰▰▰▰▰▱▱」Sending...```', '「▰▰▰▰▰▰▰▰▰▰」Success✓!', 'Masukan nomer target', 'Khusus member premium!'],
  chats: ['@s.whatsapp.net', '@g.us'],
  mode: ['[ PUBLIC - MODE ]', '[ SELF - MODE ]'],
  modul: {
    axios,
    baileys,
    boom,
    chalk,
    cheerio,
    child,
    chokidar,
    fs,
    https,
    jimp,
    ms,
    nodecache: NodeCache,
    path,
    pino,
    qrcode,
    request,
    readline,
    speed,
    time,
    util,
    cekprem,
    form
  }
};

watch(__filename, async() => {
  const timestamp = new Date().getTime();
  console.log(chalk.yellow(`New ${__filename}`))
  await import(__filename+`?t=${timestamp}`)
})
