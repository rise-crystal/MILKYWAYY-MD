import { Command } from '../../lib/handler.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

Command.create({
  name: 'addproduct',
  category: 'Store Management',
  run: async ({ db, m }) => {
    const regexPattern = /"([^"]+)"\s+-\s+(\d+)\s+"([^"]+)"/;
    const match = m.query.match(regexPattern);

    if (!match) {
      return m.reply('Format salah. Contoh penggunaan: `.addproduct "nama_produk" - harga "Deskripsi produk"`.');
    }

    const [, productName, productPrice, productDescription] = match;

    if (!m.isOwner) {
      return m.reply("Maaf, hanya owner bot yang dapat menggunakan fitur ini.");
    }

    if (!db.config) {
      db.config = { products: [] };
    } else if (!db.config.products) {
      db.config.products = [];
    }

    const productId = generateRandomId();

    db.config.products.push({ id: productId, name: productName, price: productPrice, description: productDescription });
    m.reply(`Produk '${productName}' dengan ID ${productId}, harga Rp.${formatRupiah(productPrice)}, berhasil ditambahkan.`);
  },
  description: 'Menambahkan produk baru ke dalam store beserta ID, harga, dan deskripsi.'
});

Command.create({
  name: 'delproduct',
  category: 'Store Management',
  run: async ({ db, m }) => {
    const productId = m.query.replace(/\s/g, '');

    if (!m.isOwner) {
      return m.reply("Maaf, hanya owner bot yang dapat menggunakan fitur ini.");
    }

    if (!db.config || !db.config.products || db.config.products.length === 0) {
      return m.reply('Tidak ada produk yang tersedia.');
    }

    const index = db.config.products.findIndex(product => product.id === productId);

    if (index === -1) {
      return m.reply('Produk tidak ditemukan.');
    }

    db.config.products.splice(index, 1);
    m.reply(`Produk dengan ID ${productId} berhasil dihapus.`);
  },
  description: 'Menghapus produk dari store berdasarkan ID.'
});

Command.create({
  name: 'getproduct',
  category: 'Store Management',
  run: async ({ db, m }) => {
    const productId = m.query.replace(/\s/g, '');

    if (!db.config || !db.config.products || db.config.products.length === 0) {
      return m.reply('Tidak ada produk yang tersedia.');
    }

    const product = db.config.products.find(product => product.id === productId);

    if (!product) {
      return m.reply('Produk tidak ditemukan.');
    }

    m.reply(`Informasi Produk:
    
ID: ${product.id}
Nama: ${product.name}
Harga: Rp.${formatRupiah(product.price)}
Deskripsi: ${product.description}`);
  },
  description: 'Mendapatkan informasi produk dari store berdasarkan ID.'
});

Command.create({
  name: 'listproduct',
  category: 'Store Management',
  run: async ({ db, m }) => {
    if (!db.config || !db.config.products || db.config.products.length === 0) {
      return m.reply('Tidak ada produk yang tersedia.');
    }

    const productList = db.config.products.map((product, index) => `${index + 1}. ${product.name}\n   • Harga: Rp.${product.price}\n   • ID: ${product.id}`).join('\n\n');
    m.reply(`Daftar Produk:\n\n${productList}\n\nUntuk menampilkan informasi lebih lengkap mengenai product silakan ketik: ${m.prefix}getproduct ID_produk`);
  },
  description: 'Menampilkan daftar semua produk beserta informasinya.'
});

Command.create({
  name: 'transfer',
  category: 'Financial Transactions',
  run: async ({ db, m }) => {
    const amount = Number(m.args[0].replace(/\./g, '').replace(',', '.'));

    if (isNaN(amount) || amount <= 0) {
      return m.reply("Mohon masukkan jumlah yang valid.");
    }

    // Cek apakah pengguna memiliki pesanan aktif
    if (!db.user[m.sender].isOrder || !db.user[m.sender].product) {
      return m.reply("Anda belum melakukan pemesanan atau waktu pembayaran telah habis.");
    }

    // Pengecekan saldo pengirim
    if (db.user[m.sender].balance < amount) {
      return m.reply("Saldo tidak cukup, silakan lakukan deposit terlebih dahulu.");
    }

    // Pengecekan apakah jumlah transfer cukup untuk pesanan yang diorder
    if (amount < db.user[m.sender].product.price) {
      return m.reply(`Jumlah transfer harus minimal Rp.${formatRupiah(db.user[m.sender].product.price)}.`);
    }

    // Melakukan pembayaran
    db.user[m.sender].balance -= amount;
    db.user[m.sender].isOrder = false; // Reset status order setelah pembayaran berhasil
    delete db.user[m.sender].product; // Hapus informasi produk setelah pembayaran berhasil

    m.reply(`Pembayaran sejumlah Rp.${formatRupiah(amount)} berhasil. Saldo saat ini: Rp.${formatRupiah(db.user[m.sender].balance)}`);
  },
  description: 'Melakukan pembayaran atas pesanan.',
});

Command.create({
  name: 'buyproduct',
  category: 'Store Management',
  run: async ({ db, m }) => {
    // Cek apakah sudah ada pesanan yang belum selesai
    if (db.user[m.sender].isOrder) {
      return m.reply("Anda masih memiliki pesanan yang belum diselesaikan. Silakan selesaikan pembayaran terlebih dahulu.");
    }

    // Lanjutkan dengan proses pembelian
    const regexPattern = /^([a-zA-Z0-9]{4}-[a-zA-Z0-9]{4})$/;
    const match = m.query.match(regexPattern);

    if (!match) {
      return m.reply('Format ID produk salah. Contoh penggunaan: `.buyproduct xxxx-yyyy`.');
    }

    const [productId] = match;

    // Cari produk dari db
    const product = db.config.products.find(p => p.id === productId);
    if (!product) {
      return m.reply("Produk tidak ditemukan.");
    }

    // Set isOrder menjadi true sebagai tanda pesanan sedang dalam proses
    db.user[m.sender].isOrder = true;
    db.user[m.sender].product = product; // Simpan informasi produk yang dipesan
    db.user[m.sender].orderStartTime = Date.now(); // Menyimpan waktu mulai pesanan

    // Menunggu pembayaran selama 5 menit
    const timeLimit = 300000; // 5 menit dalam milidetik
    setTimeout(() => {
      if (db.user[m.sender].isOrder) {
        db.user[m.sender].isOrder = false; // Reset isOrder menjadi false jika pembayaran tidak diselesaikan
        delete db.user[m.sender].product; // Hapus informasi produk jika waktu pembayaran habis
        m.reply(`@${m.sender.split("@")[0]}, waktu habis untuk melakukan pembayaran`);
      }
    }, timeLimit);

    m.reply(`Anda telah memesan ${product.name} dengan ID ${productId}. Harga: Rp.${formatRupiah(product.price)}. Mohon lakukan pembayaran dalam waktu 5 menit dengan mengetik .transfer [jumlah]. Jika Anda ingin membatalkan pesanan, ketik ".cancel".`);
  },
  description: 'Memesan produk berdasarkan ID dan memulai waktu pembayaran.'
});

Command.create({
  name: 'cancel',
  category: 'Store Management',
  run: async ({ db, m }) => {
    // Cek apakah pengguna memiliki pesanan aktif
    if (!db.user[m.sender].isOrder) {
      return m.reply("Anda tidak memiliki pesanan aktif yang bisa dibatalkan.");
    }

    // Batalkan pesanan
    db.user[m.sender].isOrder = false; // Reset isOrder ke false

    m.reply("Pesanan Anda telah berhasil dibatalkan.");
  },
  description: 'Membatalkan pesanan aktif.',
});

Command.create({
  name: 'deposit',
  category: 'Financial Transactions',
  run: async ({ db, m, conn }) => {
    if (!m.args || m.args.length === 0) {
      return m.reply("Mohon masukkan jumlah yang valid.");
    }
    
    const amount = Number(m.args[0].replace(/\./g, ''));

    if (isNaN(amount) || amount < 10000) {
      return m.reply("Minimal deposit adalah Rp10.000. Mohon masukkan jumlah deposit yang valid.");
    }
    
    // Memastikan objek `db.user[m.sender]` sudah didefinisikan
    if (!db.user[m.sender].pendingDeposits) {
      db.user[m.sender].pendingDeposits = [];
    }

    // Cek apakah pengguna memiliki deposit yang masih dalam proses
    const existingDeposit = db.user[m.sender].pendingDeposits.find(deposit => deposit.status === 'pending');
    if (existingDeposit) {
      return m.reply("Anda memiliki deposit yang masih dalam proses. Mohon tunggu konfirmasi deposit sebelum melakukan deposit baru.");
    }

    const depositId = uuidv4(); // ID deposit baru
    const user_id = m.sender.split("@")[0]; // ID pengguna

    const depositRequest = {
      id: depositId, // Menambahkan ID pelanggan
      amount: amount,
      sender: m.sender,
      status: 'pending',
    };

    // Memasukkan `depositRequest` ke dalam `db.user[m.sender].pendingDeposits`
    db.user[m.sender].pendingDeposits.push(depositRequest);

    // Set timeout untuk 15 menit
    setTimeout(() => {
      const index = db.user[m.sender].pendingDeposits.findIndex(deposit => deposit.id === depositId);
      if (index !== -1) {
        db.user[m.sender].pendingDeposits.splice(index, 1);
        conn.sendMessage(m.sender, { text: "Waktu pembayaran habis. Silakan melakukan deposit ulang." }, { quoted: m });
      }
    }, 15 * 60 * 1000); // 15 menit

    // Kirim pemberitahuan ke Owner
    const notificationText = `Ada permintaan deposit baru:\nID: ${depositId}\nDari: @${user_id}\nJumlah: Rp${amount.toLocaleString()}\n\nUntuk mengkonfirmasi deposit, gunakan .accept ${depositId}\nUntuk menolak deposit, gunakan .reject ${depositId}`;

    const result = Object.keys({ [`authorNumber`]: conn.newWASocket.jidNormalizedUser(conn.user.id) })
      .sort()
      .reduce((acc, key) => {
        if (key === 'authorNumber') {
          acc[key] = acc[key].split('@')[0];
        }
        return acc;
      }, { authorNumber: conn.newWASocket.jidNormalizedUser(conn.user.id) });
      
    let output = '';
    output += `${result.authorNumber}@s.whatsapp.net\n`;
    
    conn.sendMessage(output, { text: notificationText, mentions: [m.sender] }, { quoted: m })
      .then(() => {
        if(!db.config.payment) {
          db.config.payment = [];
          const paymentMethods = [
            {
              method: "Rekening BRI",
              number: "5320-01-018862-53-6",
              accountName: "ARIFI RAZZAQ"
            },
            {
              method: "DANA",
              number: "0831-9390-5842",
              accountName: "ARIFI RAZZAQ"
            },
            {
              method: "GOPAY",
              number: "0831-9390-5842",
              accountName: "ARIFI RAZZAQ"
            },
            {
              method: "Pulsa",
              number: "0831-9390-5842",
              note: "Kena rate + Rp5.000. Contoh: pesanan Rp30.000, transfer Rp35.000."
            }
          ];

          paymentMethods.forEach(method => {
            db.config.payment.push(method);
          });
        }

        const paymentText = db.config.payment.map((method, index) => {
          let text = `${index + 1}. ${method.method}\n`;
          if (method.method !== "Pulsa") {
            text += `- NO: ${method.number}\n`;
            text += `- A/N: ${method.accountName}\n\n`;
          } else {
            text += `- NO: ${method.number}\n`;
            text += `- ${method.note}\n\n`;
          }
          return text;
        }).join("");

        const message = `Permintaan deposit Anda telah dikirimkan ke owner.\n\nSilakan transfer ke salah satu metode pembayaran di bawah ini:\n\n${paymentText}\nSilahkan kirim bukti transfer dengan cara reply foto bukti menggunakan perintah .proof\n\nAnda memiliki waktu 15 menit untuk melakukan pembayaran.`;

        m.reply(message);
      });
  },
  description: 'Menambahkan saldo ke akun pengguna.',
});

Command.create({
  name: 'accept',
  category: 'Owner Commands',
  run: async ({ db, m, conn }) => {
    if (!m.isOwner) return m.reply("Perintah ini hanya bisa digunakan oleh owner.");

    const depositId = m.args[0]; // ID pesanan deposit

    // Cek apakah ID deposit yang dimasukkan kosong
    if (!depositId) {
      return m.reply("Maaf, ID yang dimasukkan salah atau tidak ditemukan.");
    }

    // Temukan dan konfirmasi deposit dari pendingDeposits
    let depositRequestUser;
    let depositRequestIndex;
    for (const userId of Object.keys(db.user)) {
      const user = db.user[userId];
      if (user.pendingDeposits) {
        depositRequestIndex = user.pendingDeposits.findIndex(deposit => deposit.id === depositId && deposit.status === 'pending');
        if (depositRequestIndex !== -1) {
          depositRequestUser = user;
          break;
        }
      }
    }

    if (!depositRequestUser) return m.reply("Tidak ada deposit pending dengan ID ini.");

    const depositRequest = depositRequestUser.pendingDeposits[depositRequestIndex];

    // Hapus catatan deposit dari database
    depositRequestUser.pendingDeposits.splice(depositRequestIndex, 1);

    // Pastikan db.user[depositRequest.sender] sudah terdefinisi
    if (!db.user[depositRequest.sender]) {
      db.user[depositRequest.sender] = {
        balance: 0, // Atau nilai awal saldo yang sesuai
      };
    }

    // Update saldo pengguna
    db.user[depositRequest.sender].balance += depositRequest.amount;

    const confirmationText = `Deposit Anda sejumlah Rp.${formatRupiah(depositRequest.amount)} telah dikonfirmasi oleh owner.\n\nuntuk melihat informasi saldo silakan ketik ${m.prefix}menu`;
    conn.sendMessage(depositRequest.sender, { text: confirmationText }, { quoted: m });

    m.reply(`Deposit pengguna @${depositRequest.sender.split("@")[0]} sejumlah Rp.${formatRupiah(depositRequest.amount)} telah dikonfirmasi.`);
  },
  description: 'Menyetujui permintaan deposit.',
});

Command.create({
  name: 'reject',
  category: 'Owner Commands',
  run: async ({ db, m, conn }) => {
    if (!m.isOwner) return m.reply("Perintah ini hanya bisa digunakan oleh owner.");

    const depositId = m.args[0]; // ID pesanan deposit

    // Cek apakah ID deposit yang dimasukkan kosong
    if (!depositId) {
      return m.reply("Maaf, ID yang dimasukkan salah atau tidak ditemukan.");
    }

    // Cari dan tolak request deposit
    let depositRequestUser;
    let depositRequestIndex;
    for (const userId of Object.keys(db.user)) {
      const user = db.user[userId];
      if (user.pendingDeposits) {
        depositRequestIndex = user.pendingDeposits.findIndex(deposit => deposit.id === depositId && deposit.status === 'pending');
        if (depositRequestIndex !== -1) {
          depositRequestUser = user;
          break;
        }
      }
    }

    if (!depositRequestUser) return m.reply("Tidak ada deposit pending dengan ID ini.");

    const depositRequest = depositRequestUser.pendingDeposits.find(deposit => deposit.id === depositId && deposit.status === 'pending');

    // Hapus catatan deposit dari database
    depositRequestUser.pendingDeposits.splice(depositRequestIndex, 1);

    const rejectionText = `Permintaan deposit Anda dengan ID ${depositId} telah ditolak oleh owner.`;
    conn.sendMessage(depositRequest.sender, { text: rejectionText }, { quoted: m });

    m.reply(`Permintaan deposit pengguna @${depositRequest.sender.split("@")[0]} dengan ID ${depositId} telah ditolak.`);
  },
  description: 'Menolak permintaan deposit.',
});

Command.create({
  name: 'proof',
  category: 'Financial Transactions',
  run: async ({ db, m, conn }) => {
    if (!m.quoted || m.quoted.type !== 'imageMessage') {
      return m.reply("Mohon balas dengan foto bukti transfer.");
    }

    const result = Object.keys({ [`authorNumber`]: conn.newWASocket.jidNormalizedUser(conn.user.id) })
      .sort()
      .reduce((acc, key) => {
        if (key === 'authorNumber') {
          acc[key] = acc[key].split('@')[0];
        }
        return acc;
      }, { authorNumber: conn.newWASocket.jidNormalizedUser(conn.user.id) });
      
    let output = '';
    output += `${result.authorNumber}@s.whatsapp.net\n`;
    
    const fileName = `proof_${m.sender.split("@")[0]}.jpg`; // Nama file untuk menyimpan foto
    const filePath = `./media/image/${fileName}`; // Path untuk menyimpan foto

    // Unduh foto bukti transfer
    await m.quoted.download(filePath);

    // Kirim foto bukti transfer ke Owner
    conn.sendMessage(output, { image: fs.readFileSync(filePath), caption: `Bukti transfer dari pengguna @${m.sender.split("@")[0]}`, mentions: [m.sender] }, { quoted: m });

    // Hapus file gambar setelah dikirim
    fs.unlinkSync(filePath);

    m.reply("Foto bukti transfer Anda telah dikirimkan ke owner untuk konfirmasi.");
  },
  description: 'Mengirimkan bukti transfer ke owner.'
});

function formatRupiah(angka) {
  let reverse = angka.toString().split('').reverse().join('');
  let ribuan = reverse.match(/\d{1,3}/g);
  let result = ribuan.join('.').split('').reverse().join('');
  return result;
}

function generateRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.replace(/(.{4})/g, '$1-').slice(0, -1);
}