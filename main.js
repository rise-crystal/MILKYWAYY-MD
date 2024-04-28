import newWASocket, {
  useMultiFileAuthState,
  PHONENUMBER_MCC,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import NodeCache from 'node-cache';
import readline from 'readline';
import fs from 'fs';
import { db } from './lib/database.js';
import pino from 'pino';
import { createRequire } from 'module';
import { connectionUpdate } from './event/connection.js';
import { onMessageUpsert } from './event/message.js';
import { sockets } from './lib/sockets.js';
import serialize from './lib/serialize.js';
import chalk from 'chalk';
import options, { logger, store } from './lib/options.js';
import { CustomGroupEvents } from './event/groups.js';

class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
  }
}

let phoneNumber = db.config.pairingNumber;
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const require = createRequire(import.meta.url);

class CollectionModel {
  constructor() {
    this.collection = new Map();
  }

  add(key, value) {
    this.collection.set(key, value);
  }

  get(key) {
    return this.collection.get(key);
  }

  has(key) {
    return this.collection.has(key);
  }

  delete(key) {
    return this.collection.delete(key);
  }

  clear() {
    this.collection.clear();
  }

  toSet() {
    const set = new Set();
    for (const value of this.collection.values()) {
      set.add(value);
    }
    return set;
  }

  isArray() {
    return Array.isArray([...this.collection.values()]);
  }
}

async function start() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(`session`);
    const msgRetryCounterCache = new NodeCache();
    const conn = newWASocket.default(
      Object.assign(
        new options(pairingCode, useMobile), {
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
          },
        }
      )
    );

    sockets(conn);
    store?.bind(conn.ev);

    const messageCollection = new CollectionModel();

    if (pairingCode && !conn.authState.creds.registered) {
      if (useMobile) {
        throw new CustomError('Cannot use pairing code with mobile API');
      }
      if (!!phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
          throw new CustomError('Start with the country code of your WhatsApp Number, example: 628xxxxx');
        }
      } else {
        phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number: `)));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
          throw new CustomError('Start with the country code of your WhatsApp Number, example: 628xxxx');
        }
      }
      setTimeout(async () => {
        let code = await conn.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(chalk.black(chalk.bgGreen(`Your Pairing Code: `)), chalk.black(chalk.white(code)));
      }, 3000);
    }

    conn.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"];
        connectionUpdate(update, start);
      }
      if (events["creds.update"]) {
        await saveCreds();
      }
      if (events["messages.upsert"]) {
        const messages = events["messages.upsert"].messages;
        let index = 0;
        do {
          const message = messages[index];
          const serializedMessage = new serialize(message, conn);
          messageCollection.add(index, serializedMessage);
          onMessageUpsert({ m: serializedMessage, store }, conn);
          index++;
        } while (index < messages.length);
      }
      if (events["group-participants.update"]) {
        // Membuat instance dari kelas CustomGroupEvents dengan menyediakan parameter events, conn, dan db
        const groupEvents = new CustomGroupEvents(events, conn, db); // Sesuaikan dengan nilai events, conn, dan db yang sesuai
        
        // Memanggil method handleGroupParticipantsUpdate dari instance groupEvents
        await groupEvents.handleGroupParticipantsUpdate();
      };
    });

    // Additional features based on AI suggestions

    // Feature 1: Use Set
    const messageSet = messageCollection.toSet();
    console.log("Message Set:", messageSet);

    // Feature 2: Check if the collection is an array
    const isArray = messageCollection.isArray();
    console.log("Is Collection an Array:", isArray);
  } catch (error) {
    console.error(`[${error.timestamp}] An error occurred:`, error.message);
  } finally {
    rl.close();
  }
}

start();