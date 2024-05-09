const { default:SETTING } = await r('../../machine/globally.js')
const modul = SETTING['modul']
const a = modul['axios'];
const f = modul['form']
const fs = modul['fs']

export const enhance = async(file, scale)=>{//@rifza.p.p
  return new Promise(async(resolve, reject)=>{
    let nm = Math.random() + ".jpg"
    let fd = new f()
        fd.append("img", file, { filename: nm })
        fd.append("sign", "SBbHJOh4WvWGu1da/Jnr6dIVZyRR77Qh0Ik3VfwwsIbmv3/MCoLdeHe3frDZA47X")
        fd.append("name", nm)
    let { token } = await(await a("https://ai-api.anyrec.io/v4/sr/upload",
    {
      method: "POST",
      data: fd,
      headers: {
        'Content-Type': "multipart/form-data;",
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    }
    ))
    .data
    let { key } = await(await a("https://ai-api.anyrec.io/v4/sr/sr",
    {
      method: "POST",
      data: {
        imgmd5: token,
        scale: scale,
        sign: "Z6B5bCuoQKDbKNpOOL/PT6kpBBdFuSVctEzB6MZRCtyy6PZjWedmewjXwQ/8WpN+"
      },
      headers: {
        'Content-Type': "multipart/form-data;",
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    }
    ))
    .data
    let tryng = 0
    while(true){
        await new Promise(resolve => setTimeout(resolve, 2000));
        tryng = tryng +1
        if(tryng > 40) break
        let { data } = await a("https://ai-api.anyrec.io/v4/sr/status",
         {
          method: "POST",
          data: {
            code: key
          },
          headers: {
            'Content-Type': "multipart/form-data;",
            'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        }
        )
        let { status, message, url, run_Time } = data
        console.log(status)
      if(status == 200 && message == "success"){
        resolve({ status, message, url, run_Time })
        break
      }
      }
    console.log(key)
  })
}

function r(_) { return import(_) }
