import { Command } from '../../lib/handler.js';

const database = {
  pemain: [],
  sumberDaya: {
    berlian: { nama: "Berlian", emoji: "💎", kesulitan: 0.2, jumlah: 100 },
    emas: { nama: "Emas", emoji: "🥇", kesulitan: 0.3, jumlah: 200 },
    zamrud: { nama: "Zamrud", emoji: "💚", kesulitan: 0.4, jumlah: 150 },
    besi: { nama: "Besi", emoji: "⛏️", kesulitan: 0.1, jumlah: 300 }
  },
  peluangJebakan: 0.1
};

Command.create({
  name: 'pertambangan',
  category: 'game mining',
  description: 'Mulai pertambangan untuk mendapatkan sumber daya berharga.',
  async run({ m, db, conn }) {
    const { args, command, sender, chat, reply } = m;
    const { user } = db;

    user[m.sender].mining = database;
    const areaPertambangan = user[m.sender].mining;

    if (areaPertambangan.pemain.includes(sender)) {
      reply('Anda sudah sedang melakukan pertambangan.');
      return;
    }

    areaPertambangan.pemain.push(sender);

    const { sumberDaya, jebakan, response } = await tambangSumberDaya(sender, user);

    if (jebakan) {
      reply('Oh tidak! Anda terkena jebakan dan berhenti melakukan pertambangan.');
    } else {
      user[sender].sumberDaya = sumberDaya;
      reply(response);
    }
  }
});

Command.create({
  name: 'profil',
  category: 'game mining',
  description: 'Cek profil pemain.',
  async run({ m, db, conn }) {
    const { reply } = m;
    const { user } = db;
    const profil = user[m.sender];
    
    let response = `Profil Anda:\n`;
    response += `Sumber Daya:\n`;
    for (const resource in profil.sumberDaya) {
      if (database.sumberDaya[resource]) { // Pastikan sumber daya ada dalam database
        response += `${database.sumberDaya[resource].emoji} ${database.sumberDaya[resource].nama}: ${profil.sumberDaya[resource]?.jumlah ?? 0}\n`;
      }
    }
    
    reply(response);
  }
});

Command.create({
  name: 'dashboard',
  category: 'game mining',
  description: 'Lihat informasi tentang area pertambangan.',
  async run({ m, db, conn }) {
    const { reply } = m;
    const { user } = db;
    
    let response = `Dashboard Pertambangan:\n`;
    response += `Pemain:\n`;
    for (const pemain in user) {
      response += `- ${pemain}\n`;
    }
    response += `Sumber Daya Tersedia:\n`;
    for (const resource in database.sumberDaya) {
      response += `${database.sumberDaya[resource].emoji} ${database.sumberDaya[resource].nama}: ${database.sumberDaya[resource].jumlah}\n`;
    }
    
    reply(response);
  }
});

Command.create({
  name: 'ranking',
  category: 'game mining',
  description: 'Lihat peringkat pemain berdasarkan jumlah sumber daya yang dimiliki.',
  async run({ m, db, conn }) {
    const { reply } = m;
    const { user } = db;
    const ranking = Object.keys(user).sort((a, b) => {
      const emasA = user[a].sumberDaya ? user[a].sumberDaya.emas : 0;
      const emasB = user[b].sumberDaya ? user[b].sumberDaya.emas : 0;
      return emasB - emasA;
    });
    
    let response = `Ranking Pemain:\n`;
    for (let i = 0; i < ranking.length; i++) {
      const emas = user[ranking[i]].sumberDaya ? user[ranking[i]].sumberDaya.emas : 0;
      response += `${i + 1}. ${ranking[i]}: ${emas} emas\n`;
    }
    
    reply(response);
  }
});

Command.create({
  name: 'beli',
  category: 'game mining',
  description: 'Beli sumber daya dari area pertambangan.',
  async run({ m, db, conn }) {
    const { args, sender, reply } = m;
    const { user } = db;
    const areaPertambangan = database; // Gunakan database sebagai sumber daya
    
    const resource = args[0];
    if (!resource || !areaPertambangan.sumberDaya[resource]) {
      reply('Sumber daya tidak valid.');
      return;
    }
    
    const harga = 10; // Harga beli dari database
    if (user[sender].sumberDaya.emas < harga) {
      reply('Maaf, Anda tidak memiliki cukup emas untuk membeli sumber daya ini.');
      return;
    }
    
    // Perbarui sumber daya pengguna dan kurangi emasnya
    user[sender].sumberDaya[resource] += 1;
    user[sender].sumberDaya.emas -= harga;
    reply(`Anda berhasil membeli 1 unit ${areaPertambangan.sumberDaya[resource].nama}.`);
  }
});

Command.create({
  name: 'jual',
  category: 'game mining',
  description: 'Jual sumber daya ke area pertambangan.',
  async run({ m, db, conn }) {
    const { args, sender, reply } = m;
    const { user } = db;
    const areaPertambangan = database; // Gunakan database sebagai sumber daya
    
    const resource = args[0];
    if (!resource || !areaPertambangan.sumberDaya[resource]) {
      reply('Sumber daya tidak valid.');
      return;
    }
    
    const harga = 5; // Harga jual dari database
    if (user[sender].sumberDaya[resource] < 1) {
      reply('Maaf, Anda tidak memiliki sumber daya ini untuk dijual.');
      return;
    }
    
    // Perbarui sumber daya pengguna dan tambahkan emasnya
    user[sender].sumberDaya[resource] -= 1;
    user[sender].sumberDaya.emas += harga;
    reply(`Anda berhasil menjual 1 unit ${areaPertambangan.sumberDaya[resource].nama} dan mendapatkan ${harga} emas.`);
  }
});

Command.create({
  name: 'afk',
  category: 'game mining',
  description: 'Mulai atau hentikan pertambangan AFK.',
  async run({ m, db, conn }) {
    const { args, sender, reply } = m;
    const { user } = db;

    if (args[0] === 'start') {
      if (user[sender].afk) {
        reply('Anda sudah mulai pertambangan AFK.');
        return;
      }
      user[sender].afk = true;
      reply('Anda telah memulai pertambangan AFK.');
      const { sumberDaya, response } = await tambangSumberDaya(sender, user);
      user[sender].sumberDaya = sumberDaya;
      reply(response);
    } else if (args[0] === 'stop') {
      if (!user[sender].afk) {
        reply('Anda belum memulai pertambangan AFK.');
        return;
      }
      user[sender].afk = false;
      reply('Anda telah menghentikan pertambangan AFK.');
    } else if (args[0] === 'update') {
      if (!user[sender].afk) {
        reply('Anda belum memulai pertambangan AFK.');
        return;
      }
      const { sumberDaya, response } = await tambangSumberDaya(sender, user);
      user[sender].sumberDaya = sumberDaya;
      reply(response);
    } else {
      reply('Perintah tidak valid. Gunakan "start" untuk memulai, "stop" untuk menghentikan, atau "update" untuk memperbarui pertambangan AFK.');
    }
  },
});

async function tambangSumberDaya(pemain, user) {
  const intervalPertambangan = 3000; // Set interval to 3 seconds
  const areaPertambangan = user[pemain].mining;
  const peluangJebakan = areaPertambangan.peluangJebakan;
  let sumberDaya = { ...areaPertambangan.sumberDaya };
  let jebakan = false;
  let response = '';

  const mineResource = () => {
    const keys = Object.keys(sumberDaya);
    const randomResource = keys[Math.floor(Math.random() * keys.length)];
    const kesulitan = sumberDaya[randomResource].kesulitan;
    const minedAmount = Math.floor(Math.random() * kesulitan * 10) + 1;

    sumberDaya[randomResource].jumlah -= minedAmount;
    if (sumberDaya[randomResource].jumlah < 0) {
      sumberDaya[randomResource].jumlah = 0;
    }
    response += `Selamat! Kamu mendapatkan ${minedAmount} ${sumberDaya[randomResource].nama}\n`;
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

  return { sumberDaya, jebakan, response };
}
