import axios from 'axios';
import moment from 'moment';
import { Command } from '../../lib/handler.js';
import fs from 'fs';
import { from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

Command.create({
  name: 'gempa',
  category: 'Info Gempa',
  description: 'Menampilkan informasi gempa terkini di Indonesia',
  run({ conn, m }) {
    const url = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';

    let imageBuffer;
    let text;

    from(axios.get(url)).pipe(
      switchMap((response) => {
        const { gempa } = response.data.Infogempa;

        if (!gempa || !gempa.Tanggal) {
          throw new Error('Data gempa tidak lengkap');
        }

        const waktu = moment(gempa.Tanggal + ' ' + gempa.Jam, 'DD MMMM YYYY HH:mm:ss').format('DD MMMM YYYY, HH:mm:ss');
        const magnitudo = gempa.Magnitude;
        const kedalaman = gempa.Kedalaman;
        const lokasi = gempa.Wilayah;
        const potensi = gempa.Potensi;
        const dirasakan = gempa.Dirasakan;
        text = `*Info Gempa Terkini*\n\nTanggal: ${waktu}\nMagnitude: ${magnitudo}\nKedalaman: ${kedalaman}\nWilayah: ${lokasi}\nPotensi: ${potensi}\nDirasakan: ${dirasakan}`;

        const imageUrl = 'https://data.bmkg.go.id/DataMKG/TEWS/' + gempa.Shakemap;
        const filename = 'image.jpg';

        return from(downloadImage(imageUrl, filename)).pipe(
          switchMap(() => {
            imageBuffer = fs.readFileSync(filename);
            return conn.sendMessage(m.chat, { image: imageBuffer, caption: text }, { quoted: m }).catch((error) => {
              console.error('Error sending message with image:', error);
              m.reply('Maaf, terjadi kesalahan dalam mengirim pesan dengan gambar.');
            });
          }),
          catchError((error) => {
            console.error('Error sending message with image:', error);
            m.reply('Maaf, terjadi kesalahan dalam mengirim pesan dengan gambar.');
            return [];
          })
        );
      }),
      catchError((error) => {
        console.error('Error fetching earthquake data:', error);
        m.reply('Maaf, terjadi kesalahan dalam mengambil data gempa.');
        return [];
      })
    ).subscribe({
      complete: () => {
        fs.unlinkSync('image.jpg');
      },
    });
  },
});

async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filename, response.data);
    console.log(`Image downloaded successfully as ${filename}`);
    return Promise.resolve(); // mengembalikan promise resolve jika gambar berhasil diunduh
  } catch (error) {
    console.error('Failed to download image:', error);
    return Promise.reject(error); // mengembalikan promise reject jika terjadi kesalahan saat mengunduh gambar
  }
}
