import { Command } from "../../lib/handler.js";
import Axios from 'axios';
import cheerio from 'cheerio';
import google from 'google-it';

Command.create({
  name: 'owner',
  category: 'Utility',
  description: 'Send contact information of the bot owner.',
  async run({ m, conn, db }) {
    if (m.query) {
      return m.reply(brainly(query))
    } else {
      return m.reply("Textnya mana ?")
    }
  }
});

function brainly(query) {
  return google({ query: `intext:"${query}" site:brainly.co.id`, disableConsole: true })
    .then((result) => {
      return Axios.get(result[0].link).then(({ data }) => {
        const $ = cheerio.load(data);
        const answer = $('div[data-test="answer-box-text"]').map((rest) =>
          $(rest).text().replace(/\n/g, '').trim()
        ).get();
        const media = $('div[data-test="answer-box-attachments"] > div > div > div > img.brn-qpage-next-attachments-viewer-image-preview__image').map((rest) =>
          $(rest).attr('src')
        ).get();
        const media_question = $('div[data-test="question-box-attachments"] > div > div > div > img.brn-qpage-next-attachments-viewer-image-preview__image').map((rest) =>
          $(rest).attr('src')
        ).get();
        const time = $('div.sg-text.sg-text--xsmall.sg-text--gray-secondary > time').attr('datetime');
        const mapel = $('a[data-test="question-box-subject"]').text().replace(/\n/g, '');
        const kelas = $('a[data-test="question-box-grade"]').text().replace(/\n/g, '');
        const pertanyaan = $('h1[data-test="question-box-text"] > span').text().replace(/\n/g, '').trim();
        const jawaban = answer.map((a, idx) => ({
          teks: a,
          media: media[idx] || []
        }));
        const result = {
          status: pertanyaan !== '',
          pertanyaan,
          foto_pertanyaan: media_question,
          waktu_dibuat: time,
          kelas,
          mapel,
          jawaban
        }
        return result;
      })
    })
    .catch(() => ({
      status: false,
      message: 'Jawaban tidak ditemukan!'
    }));
}