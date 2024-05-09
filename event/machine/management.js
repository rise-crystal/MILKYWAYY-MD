import './globally.js';
import { fileURLToPath } from 'url';
import { watch, readFile } from 'fs';
import { createRequire } from 'module';
import { EventEmitter } from 'events';

import jimp from 'jimp';
import FileType from 'file-type';

const emitter = new EventEmitter();

emitter.setMaxListeners(20);

const {
  default: SET 
} = await r('./globally.js');

const { 
  color, 
  bgcolor 
} = await r('./asset/color.js');
const { 
  getBuffer, 
  fetchJson,
  query 
} = await r('./asset/function.js');
const { 
  addInventory, 
  checkInventory, 
  addCoin, 
  kurangCoin, 
  getCoin,
  getUmpan
} = await r('./asset/inventory.js');
const {
  expiredCheck,
  checkPremiumUser
} = await r('./asset/premium.js');

let { 
  getCmd
} = await r("./asset/sticker.js");

let harga = SET['harga'];
let modul = SET['modul'];
let fs = modul['fs'];
let chalk = modul['chalk'];
let moment = modul['time'];
let util = modul['util'];
let axios = modul['axios'];
let cheerio = modul['cheerio'];
let { 
  default: getContentType, 
  generateWAMessageFromContent, 
  proto,
  downloadContentFromMessage
} = modul['baileys'];
let { 
  spawn, 
  exec
} = modul['child'];

const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss');

const __filename = fileURLToPath(import.meta.url);

global.fetchJson = fetchJson;
global.getBuffer = getBuffer;
global.SETTING = SET;
global.query = query;

async function defaultPlugins({ m, conn, db, func, store }, plugins) {
  try {
    global.plugins = plugins
    
    m.xtype = m.type;
    m.content = JSON.stringify(m.message);
    m.isQuotedImage = m.xtype === 'extendedTextMessage' && m.content.includes('imageMessage');
    m.isQuotedVideo = m.xtype === 'extendedTextMessage' && m.content.includes('videoMessage');
    m.isQuotedAudio = m.xtype === 'extendedTextMessage' && m.content.includes('audioMessage');
    m.isQuotedSticker = m.xtype === 'extendedTextMessage' && m.content.includes('stickerMessage');
    m.isQuotedTag = m.xtype === 'extendedTextMessage' && m.content.includes('mentionedJid');
    m.isQuotedReply = m.xtype === 'extendedTextMessage' && m.content.includes('Message');
    m.isQuotedLocation = m.xtype === 'extendedTextMessage' && m.content.includes('locationMessage');

    let prefix = m.prefix;
    let from = m.chat;
    let q = m.query;
    let args = m.args;
    let isCmd = m.isCmd;
    let order = m.command;
    let isMedia = (m.xtype === 'imageMessage' || m.xtype === 'videoMessage' || m.xtype === 'viewOnceMessageV2');
    let isInventory = checkInventory(m.sender);
    let isBotGroupAdmins = m.isBotAdmin;
    let isOwner = m.isOwner;
    let isGroup = m.isGroup;
    let isGroupAdmins = m.isAdmin;
    let isCoin = getCoin(m.sender);
    let isPremium = m.isPremium;
    let orderPlugins = m.isCmd ? m.command : null;
    let chatmessage = m.body;

    conn.getGroupMembers = function(participants) {
      let adminz = []
      for (let i of participants) {
        i.id !== null ? adminz.push(i.id) : ''
      }
      return adminz
    }

    conn.getGroupAdmins = function(participants) {
      let admins = []
      for (let i of participants) {
        i.admin !== null ? admins.push(i.id) : ''
      }
      return admins
    }

    conn.fkontak = (from) => { 
      let xfkontak = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' }, message: { "contactMessage":{"displayName": SETTING["botName"],"vcard":`BEGIN:VCARD\nVERSION:3.0\nN:2;rifza;;;\nFN:rifza\nitem1.TEL;waid=00000:00000\nitem1.X-ABLabel:Mobile\nEND:VCARD` }}}
      return xfkontak
    }
  
    conn.speech = async (id, teks, teks2) => {
      let { default: gtt } = await r('../worker/engine/gtts.js')
      let gttsp = gtt(teks)
      let heh = teks2
      let ranm = getRandom('.mp3')
      let rano = getRandom('.ogg')
      gttsp.save(ranm, heh, function() {
        exec(`ffmpeg -i ${ranm} -ar 48000 -vn -c:a libopus ${rano}`, (err) => {
          fs.unlinkSync(ranm)
          let buff = fs.readFileSync(rano)
          let aud = {
            audio: buff,
            ptt: true,
            mimetype: 'audio/mp4',
            duration: 32668,
            contextInfo: {
              externalAdReply: {
                title: time,
                body: `${m.sayingtime + m.timoji + ' ' + m.pushName}`,
                thumbnail: thumb,
                sourceUrl: "https://instagram.com/ar.zzq",
                mediaUrl: "https://instagram.com/ar.zzq",
                mediaType: 1
              }
            }
          }
          conn.sendMessage(id, aud, { quoted: m })
          fs.unlinkSync(rano)
        })
      })
    }

    const times = moment().tz('Asia/Jakarta').format('HH:mm:ss')
      
    if(times < "23:59:00"){
      conn.sayingtime = 'Good night'
      conn.timoji = '🌃'
    }
    if(times < "19:00:00"){
      conn.sayingtime  = 'Good night'
      conn.timoji = '🏙️'
    }
    if(times < "18:00:00"){
      conn.sayingtime = 'Good afternoon'
      conn.timoji = '🌇'
    }
    if(times < "15:00:00"){
      conn.sayingtime = 'Good afternoon'
      conn.timoji = '🌞'
    }
    if(times < "11:00:00"){
      conn.sayingtime = 'Good morning'
      conn.timoji = '🌅'
    }
    if(times < "05:00:00"){
      conn.sayingtime = 'Good night'
      conn.timoji = '🌃'
    }

    conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
      let quoted = message.msg ? message.msg : message
      let mime = (message.msg || message).mimetype || ''
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
      const stream = await downloadContentFromMessage(quoted, messageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
      let type = await FileType.fromBuffer(buffer)
      let trueFileName;
      trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
      await fs.writeFileSync(trueFileName, buffer)
      return trueFileName
    }

    conn.downloadMediaMessage = async (message, MessageType) => {
      const stream = await downloadContentFromMessage(message, MessageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
      return buffer
    }

    conn.editMessage = async(idmsg, keymsg, editedmsg) => {
      let prex = generateWAMessageFromContent(idmsg, proto.Message.fromObject(
        {
          "editedMessage":
          {
            "message":
            {
              "protocolMessage":{
                "key":{
                  "remoteJid":idmsg,
                  "fromMe":true,
                  "id":keymsg
                },
                "type":"MESSAGE_EDIT",
                "editedMessage":{
                  "conversation": editedmsg
                }
              }
            }
          }
        }),
        {
          userJid: idmsg,
          quoted: m
        })
      conn.relayMessage(idmsg, prex.message,
        {
          messageId: prex.key.id
        })
    }

    conn.generateProfilePicture = async (buffer) => {
      const jimpread = await jimp.read(buffer);
      const result = jimpread.getWidth() > jimpread.getHeight() ? jimpread.resize(550, jimp.AUTO) : jimpread.resize(jimp.AUTO, 650)
      let jump = await jimp.read(await result.getBufferAsync(jimp.MIME_JPEG));
      return {
        bufferzzz: await result.getBufferAsync(jimp.MIME_JPEG)
      }
    }

    conn.parseMention = async (text) => {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }

    conn.d = async(from, id, qu, y) => {
      conn.sendMessage(from, { delete: { remoteJid: from, fromMe: y, id: id, participant: qu } })
    } 
    
    conn.addCmd = () => {
      global.USE_CMD.total += 1;
      fs.writeFileSync('./database/cmd.json', JSON.stringify(global.USE_CMD, null, 2));
    };

    conn.addCMDForTop = (NAMEQ, timw) => {
      try {
        let cekhN = global.USE_CMD.cmd.find(i => i.name.includes(NAMEQ));
        if (cekhN) {
          let cemed = global.USE_CMD.cmd.find(i => i.name == NAMEQ);
          var ussd = global.USE_CMD.cmd.indexOf(cemed);
          if (!global.USE_CMD.cmd[ussd]) {
            global.USE_CMD.cmd[ussd].use = 0;
          }
          global.USE_CMD.cmd[ussd].use += 1;
          global.USE_CMD.cmd[ussd].times = timw;
          fs.writeFileSync('./database/cmd.json', JSON.stringify(global.USE_CMD, null, 2));
        } else {
          global.USE_CMD.cmd.push({ name: NAMEQ, use: 1,  times: timw});
          fs.writeFileSync('./database/cmd.json', JSON.stringify(global.USE_CMD, null, 2));
        }
      } catch (e) {
        console.error(e);
      }
    };

    conn.cmdS = () => {
      return Object.entries(global.USE_CMD.cmd).sort((a, b) => b[1].use - a[1].use);
    };

    conn.topCmd = (i=10) => {
      const cmdS = conn.cmdS();
      const LIST_TOP = cmdS.slice(0, i).map(([name, data]) => `${prefix}${data.name}(${data.use}) || ${data.times}`);
      return LIST_TOP;
    };

    for (let name in plugins) {
      let plugin = plugins[name];
      if (plugin.order && plugin.order.includes(orderPlugins)) {
        let turn = plugin.order instanceof Array ?
          plugin.order.includes(orderPlugins) :
          plugin.order instanceof String ?
          plugin.order == orderPlugins :
          !1;
        if (!turn) continue;

        await conn.addCMDForTop(order.slice(1), time);
        await conn.addCmd();

        if (!isInventory) { await addInventory(m.sender); }
        if (plugin.maintenance) {
          m.reply(`Maaf, Fitur : ${order} sedang dalam pemeliharaan,\nSilahkan coba lain kali ya :(`);
          continue;
        }
        if (plugin.owner && !isOwner) {
          m.reply(SETTING['message'][2]);
          continue;
        }
        if (plugin.group && !isGroup) {
          m.reply(SETTING['message'][1]);
          continue;
        }
        if (plugin.private && isGroup) {
          m.reply("Khusus Private!");
          continue;
        }
        if (plugin.groupAdmins && !isGroupAdmins) {
          m.reply(SETTING['message'][3]);
          continue;
        }
        if (plugin.botGroupAdmins && !isBotGroupAdmins) {
          m.reply(SETTING['message'][4]);
          continue;
        }
        if (plugin.co_owner && !isOwner) {
          m.reply(SETTING['message'][2]);
          continue;
        }
        if (plugin.premium && !isPremium && !isOwner) {
          m.reply(SETTING['message'][9]);
          continue;
        }
        if (plugin.quotedSticker && !m.isQuotedSticker){
          m.reply(plugin.quotedSticker);
          continue;
        }
        if (plugin.quotedStickerVideo && !m.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage?.isAnimated == !0){
          m.reply(plugin.quotedStickerVideo);
          continue;
        }
        if (plugin.quotedVideo && !m.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage){
          m.reply(plugin.quotedVideo);
          continue;
        }
        if (plugin.quotedImage && !m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage){
          m.reply(plugin.quotedImage);
          continue;
        }
        if (plugin.quotedAudio && !m.message.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage){
          m.reply(plugin.quotedAudio);
          continue;
        }
        if (plugin.quoted && !q) {
          m.reply(plugin.quoted);
          continue;
        }
        if (plugin.quotedUrl && !q.includes(plugin.quotedUrl.url)){
          m.reply(plugin.quotedUrl.reply);
          continue;
        }
        if (plugin.coin && !isPremium) {
          let _harga = harga[plugin.coin];
          if (isCoin < _harga) {
            return m.reply(`Coin kamu tidak mencukupi untuk melakukan tindakan ini!\n • Coin tersisa: 🪙${isCoin} \n • Membutuhkan: 🪙${_harga}\n\n_Untuk mendapatkan koin, kamu bisa meminta teman untuk mentransfer coin ke kamu_\n -> .transfer 628********** jumlah`);
          }
          await kurangCoin(m.sender, parseInt(_harga));
          m.reply(`-${_harga} 🪙coin`);
        }
        
        let msg = m;
        let client = conn;
        await plugin.exec(msg, client, from, {
          q,
          args,
          order,
          prefix,
          isMedia,
          store
        });
      }
    }

  } catch (error) {
    console.error(error);
  }
}

function r(_) { return import(_) }
export { defaultPlugins }