import { Command } from '../../lib/handler.js';
import { performance } from 'perf_hooks';
import { sizeFormatter } from 'human-readable';
import { promises } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import moment from 'moment-timezone';
import { format } from 'util';

Command.create({
  name: 'ping',
  category: 'Utility',
  run: async ({ db, m, conn }) => {
    const startTime = performance.now();
    let orderStatus = '';
    if (db.user[m.sender].isOrder) {
      const timeRemaining = 300000 - (Date.now() - db.user[m.sender].orderStartTime);
      if (timeRemaining <= 0) {
        db.user[m.sender].isOrder = false; // Reset isOrder menjadi false jika pembayaran tidak diselesaikan
        return m.reply(`Waktu habis untuk melakukan pembayaran`);
      } else {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        orderStatus = `Anda masih memiliki pesanan yang belum diselesaikan. Sisa waktu pembayaran: ${minutes} menit ${seconds} detik.\n`;
      }
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packagePath = join(__dirname, '../../package.json');
    const packageData = JSON.parse(await promises.readFile(packagePath, 'utf-8'));

    const uptime = os.uptime();
    const totalmem = os.totalmem();
    const freemem = os.freemem();
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus();

    const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.jid.endsWith('@g.us'));
    const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));
    
    const date = moment.tz('Asia/Jakarta').format("dddd, Do MMMM, YYYY");
    const time = moment.tz('Asia/Jakarta').format('HH:mm:ss');
    
    const endTime = performance.now();
    const responseTime = (endTime - startTime).toFixed(1);

    const formatBytes = (bytes) => {
      const format = sizeFormatter({
        std: 'IEC',
        decimalPlaces: 2,
        render: (literal, symbol) => `${literal} ${symbol}B`,
      });
      return format(bytes);
    };
    
    const cpuUsage = process.cpuUsage();
    const totalCpuUsage = getTotalCpuUsage(cpuUsage);
    
    const formatUptime = (uptime) => {
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const milliseconds = Math.floor((uptime % 1) * 1000);
      
      return `${hours} jam ${minutes} menit ${seconds} detik ${milliseconds} milidetik`;
    }; 
    
    let capti = `Info Bot:\n`
    capti += `1. Nama: ${packageData.name}\n`
    capti += `2. Versi: ${packageData.version}\n`
    capti += `3. Deskripsi: ${packageData.description}\n\n`
    capti += `Uptime: ${formatUptime(uptime)}\n`
    capti += `Database: ${Object.keys(db.user)?.length} Pengguna\n\n`
    capti += `Tanggal: ${date}\n`
    capti += `Waktu: ${time} (GMT+5:30)\n\n`
    capti += `Info Server:\n`
    capti += `- Ping: ${responseTime} Ms\n`
    capti += `- RAM: ${formatBytes(totalmem - freemem)} / ${formatBytes(totalmem)}\n`
    capti += `- Sistem Operasi: ${platform} ${arch}\n`
    capti += `- Total CPU Usage: ${cpus.length === 0 ? totalCpuUsage : totalCpuUsage} Core(s)\n\n`
    capti += `Status WhatsApp:\n`
    capti += `- Group Chats: ${groupsIn.length}\n`
    capti += `- Groups Joined: ${groupsIn.length}\n`
    capti += `- Groups Left: ${groupsIn.length - groupsIn.length}\n`
    capti += `- Personal Chats: ${chats.length - groupsIn.length}\n`
    capti += `- Total Chats: ${chats.length}\n`;
 
    m.reply(`${orderStatus}${capti}`);
  },
  description: 'Mengecek waktu respon bot dan informasi lainnya.'
});

function getTotalCpuUsage(cpuUsage) {
  const totalUsage = cpuUsage.user + cpuUsage.system;
  let formattedUsage;
  if (totalUsage < 1024) {
    formattedUsage = `${totalUsage.toFixed(2)} s`;
  } else if (totalUsage < 1048576) {
    formattedUsage = `${(totalUsage / 1024).toFixed(2)} MB`;
  } else {
    formattedUsage = `${(totalUsage / 1048576).toFixed(2)} GB`;
  }
  return formattedUsage;
}