const { TelegraPh } = await r('../engine/telegraph.js')
const fs = await r("fs")
const { enhance } = await r('../engine/enhance.js')

export default {
	tags: 'tools',
	command: ['removebg'],
	coin: "normal",
    order: ['removebg'],
	maintenance: false,
	owner: false,
	group: false,
	groupAdmins: false,
	botGroupAdmins: false,
	quotedVideo: false, //quotedVideo: "pesannya"
	quotedImage: "Reply imagenya!",  //quotedImage: "pesannya"
	quotedAudio: false,  //quotedAudio: "pesannya"	
	quoted: false, //quoted: "pesannya"
	quotedSticker: false, //quotedSticker: "pesannya"
	quotedStickerVideo: false, //quotedStickerVideo: "pesannya"
	quotedUrl: false, // quotedUrl: { url: 'instagram.com', reply: 'Gunakan link instagram!' },
	exec: async (msg, client, from, {
		q,
		args,
		order,
		prefix
	}) => {
	try{
	 	let media = await client.downloadAndSaveMediaMessage(msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image')
         let tph = await TelegraPh(media)
          fs.unlinkSync(media)

     let opts = {
                path: "/api/tools/remove-bg",
                params: {
                    link: tph,
                    key: api.rifza.key
                }
            };
            let _url = query(api.rifza.url + opts.path, opts.params);
  client.sendMessage(from, { image: { url: _url } }, { quoted: msg })                
    } catch (e) {
      msg.reply("!Type error:\n" + e)
    }
	}
}
function r(_) { return import(_) }
