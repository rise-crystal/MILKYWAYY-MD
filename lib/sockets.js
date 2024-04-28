import newWASocket, { jidDecode, areJidsSameUser } from "@whiskeysockets/baileys";
import PhoneNumber from 'awesome-phonenumber';

export async function sockets(conn, options = {}) {
  const chats = options.chats || {};

  Object.defineProperties(conn, {
    chats: {
      value: chats,
      writable: true,
      enumerable: true,
    },
    newWASocket: {
      value: newWASocket,
      enumerable: true,
    },
    chatCount: {
      get() {
        return Object.keys(conn.chats).length;
      },
      enumerable: true,
    },
    addChat: {
      value(jid, chatInfo = {}) {
        conn.chats[jid] = chatInfo;
      },
      enumerable: true,
    },
    removeChat: {
      value(jid) {
        if (conn.chats[jid]) {
          delete conn.chats[jid];
        }
      },
      enumerable: true,
    },
    clearChats: {
      value() {
        conn.chats = {};
      },
      enumerable: true,
    },
    decodeJid: {
      value(jid) {
        if (/:\d+@/gi.test(jid)) {
          const decode = jidDecode(jid) || {};
          return ((decode.user && decode.server && decode.user + "@" + decode.server) || jid).trim();
        } else {
          return jid.trim();
        }
      },
      enumerable: true,
    },
    getChatInfo: {
      value(jid) {
        return conn.chats[jid] || null;
      },
      enumerable: true,
    },
    getChatList: {
      value() {
        return Object.keys(conn.chats);
      },
      enumerable: true,
    },
    getName: {
      value: function (jid = '', withoutContact = false) {
        jid = conn.decodeJid(jid);
        withoutContact = conn.withoutContact || withoutContact;
        let v;
        if (jid.endsWith('@g.us')) return new Promise(async (resolve) => {
          v = conn.user[jid] || {};
          if (!(v.name || v.subject)) v = await conn.groupMetadata(jid) || {};
          resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'));
        });
        else v = jid === '0@s.whatsapp.net' ? { jid, vname: 'WhatsApp' } : areJidsSameUser(jid, conn.user.id) ? conn.user : (conn.user[jid] || {});
        return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
      },
      enumerable: true,
    },
    sendContact: {
      value: function (chat, teks, arr = [...[satu = "", dua = "", tiga = ""]], quoted = '', opts = {}) {
        return conn.sendMessage(chat, { 
          contacts: { 
            displayName: teks, 
            contacts: arr.map(i => ({ 
              displayName: '', 
              vcard: 'BEGIN:VCARD\n'+'VERSION:3.0\n'+'FN:'+i[0]+'\n'+'ORG:'+i[2]+';\n'+'TEL;type=CELL;type=VOICE;waid='+i[1]+':'+i[1]+'\n'+'END:VCARD' 
            })) 
          }, ...opts
        }, { quoted });
      },
      enumerable: true,
    },
    // Add more properties and methods as needed
  });
  return conn;
}