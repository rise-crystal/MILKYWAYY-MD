export async function connectionUpdate(update, start) {
  if (update.connection === 'close') {
    console.log('Info Koneksi: Menyambung!');
    start();
  } else if (update.connection === 'open') {
    const currentDate = new Date();
    console.log(`Tanggal dan Waktu Saat Ini: ${currentDate.toLocaleString()}`);
    
    await new Promise(resolve => {
      setTimeout(() => {
        console.log('Info Koneksi: Menghubungkan...');
        resolve();
      }, 3000); // Sesuaikan durasinya sesuai kebutuhan
    });

    console.log('Info Koneksi: Tersambung!');
  }
}