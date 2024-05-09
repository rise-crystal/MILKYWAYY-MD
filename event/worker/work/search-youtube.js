const { youtubeSearch } = await import("../engine/youtube.js")

export default {
    order: ['ytsr','ytsearch'],
    tags: 'search',
    command: ['ytsr','ytsearch'],
    quoted: 'Harap judulnya!!',
    coin: 'medium',
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
        try {
            let search = await youtubeSearch(q)
    	    let { items } = search.data 
            
            let lts = "```[ YOUTUBE - SEARCH🔎 ]```\n";
            let sections = [];
            
            for (let i = 0; i < items.length; i++) {
                let list = {
                    title: `[${i + 1}] ▪︎${items[i].title}`,
                    rows: [
                        { title: "AUDIO/M4A", rowId: `${prefix}ytm4a ${items[i].url}` },
                        { title: "AUDIO/MP3", rowId: `${prefix}ytmp3 ${items[i].url}` },                  
                        { title: "VIDEO/MP4", rowId: `${prefix}playvideo ${items[i].url}` }
                    ]
                };
                sections.push(list);
            }
            const listMessage = {
                text: `LIST RESULT`,
                footer: "©rifza.p.p",
                title: `Silahkan pilih untuk me download!`,
                buttonText: "Open here",
                sections
            };
            await client.sendMessage(from, listMessage, { quoted: msg });
        } catch (e) {
        console.log(e)
            msg.reply("Error!, mungkin videl tidak ditemukan!");
        }
    }
};
