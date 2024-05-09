import { watch, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { format } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fileToWatch = join(__dirname, '../../event/modem/case.js');

watch(fileToWatch, async (eventType, filename) => {
  if (eventType === 'change') {
    try {
      const content = await readFile(fileToWatch, 'utf8');
      console.log('File changed:', content);
    } catch (err) {
      console.error('Error reading file:', err);
    }
  }
});

console.log('\x1b[1m\x1b[33m%s\x1b[0m', `New ${fileToWatch}`);

class CASE {
  constructor({ m, db, conn, func, store }) {
    this.m = m;
    this.db = db;
    this.conn = conn;
    this.func = func;
    this.store = store;
  }

  async online() {
    try {
      const { m, db, conn, func, store } = this;
      
      switch (m.command) {
        case "test": {
          category: "other";
          if (m.args[0] === 'case') {
            const responses = [
              'hello i am case',
              'nice to meet you, i am case',
              'how can i help you? i am case'
            ];
            const randomIndex = Math.floor(Math.random() * responses.length);
            return m.reply(responses[randomIndex]);
          } else if (m.args[0] === 'button') {
            let { proto, generateWAMessageFromContent } = conn.newWASocket;
            const responses = [
              'Hello, I am Button.',
              'Nice to meet you, I am Button.',
              'How can I help you? I am Button.'
            ];
            const randomIndex = Math.floor(Math.random() * responses.length);
            let msg = generateWAMessageFromContent(m.chat, {
              viewOnceMessage: {
                message: {
                  "messageContextInfo": {
                    "deviceListMetadata": {},
                    "deviceListMetadataVersion": 2
                  },
                  interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                      text: responses[randomIndex]
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                      text: responses[randomIndex]
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                      title: responses[randomIndex],
                      subtitle: responses[randomIndex],
                      hasMediaAttachment: false
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                      buttons: [
                        {
                          "name": "single_select",
                          "buttonParamsJson": "{\"title\":\"title\",\"sections\":[{\"title\":\"title\",\"highlight_label\":\"label\",\"rows\":[{\"header\":\"header\",\"title\":\"title\",\"description\":\"description\",\"id\":\"id\"},{\"header\":\"header\",\"title\":\"title\",\"description\":\"description\",\"id\":\"id\"}]}]}"
                        },
                        {
                          "name": "quick_reply",
                          "buttonParamsJson": "{\"display_text\":\"quick_reply\",\"id\":\".play a thousand year\"}"
                        },
                        {
                          "name": "cta_url",
                          "buttonParamsJson": "{\"display_text\":\"url\",\"url\":\"https://www.google.com\",\"merchant_url\":\"https://www.google.com\"}"
                        },
                        {
                          "name": "cta_call",
                          "buttonParamsJson": "{\"display_text\":\"call\",\"id\":\"message\"}"
                        },
                        {
                          "name": "cta_copy",
                          "buttonParamsJson": "{\"display_text\":\"copy\",\"id\":\"123456789\",\"copy_code\":\"message\"}"
                        },
                        {
                          "name": "cta_reminder",
                          "buttonParamsJson": "{\"display_text\":\"cta_reminder\",\"id\":\"message\"}"
                        },
                        {
                          "name": "cta_cancel_reminder",
                          "buttonParamsJson": "{\"display_text\":\"cta_cancel_reminder\",\"id\":\"message\"}"
                        },
                        {
                          "name": "address_message",
                          "buttonParamsJson": "{\"display_text\":\"address_message\",\"id\":\"message\"}"
                        },
                        {
                          "name": "send_location",
                          "buttonParamsJson": ""
                        }
                      ],
                    })
                  })
                }
              }
            }, {});

            await conn.relayMessage(msg.key.remoteJid, msg.message, {
              messageId: msg.key.id
            });
          }
        }
        break;
          
        case "getuint8array": {
          category: "other";
          if (m.quoted && m.quoted.message) {
            if (m.quoted.type === 'imageMessage') {
              return m.reply(format(new Uint8Array(Buffer.from(m.quoted.message[m.quoted.type].url))))
            } else {
              return m.reply(" Maaf, ini bukan gambar, tolong reply pesan dengan tipe gambar!")
            }
          } else {
            return m.reply(" reply gambar yang ingin diambil kode Uint 8 array-nya!")
          }
        }
        break 
        
        case "getuint32array": {
          category: "other";
          if (m.quoted && m.quoted.message) {
            if (m.quoted.type === 'imageMessage') {
              return m.reply(format(new Uint32Array(Buffer.from(m.quoted.message[m.quoted.type].url))))
            } else {
              return m.reply(" Maaf, ini bukan gambar, tolong reply pesan dengan tipe gambar!")
            }
          } else {
            return m.reply(" reply gambar yang ingin diambil kode Uint 32 array-nya!")
          }
        }
        break 
        
        case "menucase": {
          category: "other";
          try {
            const caseFile = "./event/modem/case.js";
            const content = await readFile(caseFile, 'utf8');
            const cases = content.match(/case\s+"([^"]+)":\s+?{\s+?category:\s+"([^"]+)"/g).map((match) => {
              const [_, caseName, category] = match.match(/"([^"]+)":\s+?{\s+?category:\s+"([^"]+)"/);
              return { name: caseName, category };
            });
            
            const categorizedCases = cases.reduce((acc, cur) => {
              acc[cur.category] = acc[cur.category] || [];
              acc[cur.category].push(cur.name);
              return acc;
            }, {});

            const menuText = Object.entries(categorizedCases)
              .map(([category, cases]) => {
                const formattedCases = cases.map((c, i) => `${i + 1}. ${m.prefix}${c}`).join('\n');
                return `Kategori ${category}:\n${formattedCases}`;
              })
              .join('\n\n');

            conn.sendText(m.chat, menuText, m);
          } catch (error) {
            console.error(error);
            conn.sendText(m.chat, 'Gagal membaca file case.js', m);
          }
        }
        break
        
        case "getcase": {
          category: "owner";
          if (m.isOwner) {
            if (!m.args.join(' ')) {
              return m.reply ("Maaf, Masukan input spasi tidak di per bolehkan.")
            } else if (m.args[0]) {
              return this.getcodecase(m.args[0])
            } else {
              return m.reply("Maaf, Input masukan anda tidak valid / kosong, Harap kirim masukan nama case yang ingin di ambil.")
            }
          }
        }
        break
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  async getcodecase(caseName) {
    const { m, conn } = this;
    try {
      const caseFile = "./event/modem/case.js";
      const content = await readFile(caseFile, 'utf8');
      const regex = new RegExp(`case\\s+"${caseName}"\\s*:([\\s\\S]*?)break;`, 'g');
      const match = regex.exec(content);
      if (!match) {
        conn.sendText(m.chat, `Case ${caseName} tidak ditemukan`, m);
        return;
      }

      conn.sendText(m.chat,  `case '${caseName}': ${match[1].trim()}\nbreak;`, m);
    } catch (error) {
      console.error(error);
      conn.sendText(m.chat, 'Gagal membaca file case.js', m);
    }
  }
}

export { CASE };
