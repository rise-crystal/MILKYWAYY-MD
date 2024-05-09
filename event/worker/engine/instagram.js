//○ Create by @rifza.p.p
const { default:SETTING } = await r('../../machine/globally.js')
const modul = SETTING['modul']
const axios = modul['axios'];
const cheerio = modul['cheerio'];

let baseUrl = "https://v3.igdownloader.app"

const getMediaType = async (url) => {//@rifza.p.p
  return new Promise(async(resolve, reject) => {
  let get = await axios.get(url)
  let c = get.headers['content-disposition']
  let type = c.includes('webp') ? 'image'
             : c.includes('.mp4') ? 'video' 
             : c.includes('.jpeg') ? 'image' 
             : c.includes('.jpg') ? 'image'
             : c.includes('.png') ? 'image'        
             : c.includes('.gif') ? 'gif'        
             : 'image'
             console.log(type)
  resolve(type)
  })
}
export const instagram = async (url) => {//@rifza.p.p
  return new Promise(async(resolve, reject) => {
    let res = { status: false }
    const post = await axios.request({
      url: baseUrl + "/api/ajaxSearch",
      method: "POST",
      data: new URLSearchParams(
          Object.entries({
              recaptchaToken: "",
              q: url,
              type: "media",
              lang: "id"
      })),
      headers: {
       'content-type': 'application/x-www-form-urlencoded',
      }
    })
    let html = post.data.data
    const $ = cheerio.load(html);
    res.title = await axios.get(url).then(async a=> { let $$ = cheerio.load(a.data); return $$("title").text() })
    res.downloadLinks = [];
    let promises = $('ul li').map(async(index, element) => {
       let media = {}
       media.url = $(element).find(".download-items .download-items__btn a").attr("href")
       media.type = await getMediaType(media.url)
       res.downloadLinks.push(media)
     }).get()
     await Promise.all(promises)
    resolve(res)
  })
}
function r(_) { return import(_) }

//instagram("https://www.instagram.com/p/C6Dzzt0PGHG/?igsh=NTc4MTIwNjQ2YQ==").then(a => console.log(a))