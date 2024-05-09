const { default:SETTING } = await r('../../machine/globally.js')
const modul = SETTING['modul']
const axios = modul['axios'];

export const Twitter = async (url) =>{//@rifza.p.p
   return new Promise(async(resolve, reject) => {
       let { job_id } = await ( await axios.post("https://app.publer.io/hooks/media", { url, iphone: false })).data
       let tryng = 0
       while(tryng < 50){
          let { status, payload } = await (await axios.get("https://app.publer.io/api/v1/job_status/"+ job_id)).data
          if(status == "complete") { return resolve({ data: payload }) }
          await new Promise(resolve => setTimeout(resolve, 1500));
       }       
   })  
  }
function r(_) { return import(_) }
