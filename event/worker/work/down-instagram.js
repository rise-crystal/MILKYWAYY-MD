const { instagram } = await r("../engine/instagram.js")
const { default:SETTING } = await r('../../machine/globally.js')
const modul = SETTING['modul'];
const axios = modul['axios']
const { sleep } = await r('../../machine/asset/function.js');

export default {
	order: ['igdl','ig','instagram'],
	tags: 'downloader',
	command: ['instagran'],
	quoted: 'Harap sertakan url instagramnya!',
	coin: 'normal',
	quotedSticker: false,
	quotedStickerVideo: false,
	quotedUrl: false,
	owner: false,
	co_owner: false,
	group: false,
	groupAdmins: false,
	botGroupAdmins: false,
	quotedVideo: false,
	exec: async (msg, client, from, {
		q,
		args,
		order,
		prefix
	}) => {
	await sleep(1000)
	     const { key } = await client.sendMessage(from, {text: '```Processing..```'}, { quoted: msg });      	    
    	try{
           let m = await instagram(q)
           	 await client.sendMessage(from, { text: "Sending...", edit: key})
           	 for(let i of m.downloadLinks){
           	     await client.sendMessage(from, { [i.type]: { url: i.url } }, { quoted: msg })
           	 }
           	 client.sendMessage(from, { edit: key, text: "Success"})
    	} catch (e) {
    	  	 await client.sendMessage(from, { text: "TypeErr: "+e, edit: key})
    	}	

	}
}
function r(_) { return import(_) }

