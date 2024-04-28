import { Command } from "../../lib/handler.js";
import { createRequire } from 'module';

const dynamicImport = async (modulePath) => {
  const require = createRequire(import.meta.url);
  return await require(modulePath);
};

Command.create({
  name: 'cuaca',
  category: 'Utility',
  description: 'Dapatkan informasi cuaca untuk lokasi tertentu menggunakan OpenWeatherMap.',
  async run({ m, conn, db }) {
    const axios = await dynamicImport('axios');

    const API_KEY = '077544409851790565a085614f44ccf2';
    const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

    const location = m.args.join(' ');

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: location,
          appid: API_KEY,
          units: 'metric',
          lang: 'id',
        },
      });

      const weatherData = response.data;
      const weatherDescription = weatherData.weather[0].description;
      const temperature = weatherData.main.temp;
      const feelsLike = weatherData.main.feels_like;
      const humidity = weatherData.main.humidity;
      const windSpeed = weatherData.wind.speed;

      const cuacaInfo = `Cuaca di ${location}:\n🌤️ ${weatherDescription}\n🌡️ Temperatur: ${temperature}°C\n💧 Kelembaban: ${humidity}%\n🌬️ Kecepatan Angin: ${windSpeed} m/s`;

      conn.sendMessage(m.chat, { text: cuacaInfo }, { quoted: m });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(m.chat, { text: 'Gagal mengambil informasi cuaca. Silakan coba lagi nanti.' }, { quoted: m });
    }
  }
});
