const ytfps = require('ytfps');
// TypeScript: import ytfps from 'ytfps'; //with --esModuleInterop

async function get_playlist_urls(id) {
   let a = await ytfps(id).then(playlist => {
        let array = []
        for (let i = 0; playlist.videos[i]; i++) {
            array[i] = playlist.videos[i].url
        }
        console.log(playlist)
        return array
    }).catch(err => {
        throw err;
    });
   return a
}

async function get_playlist_count(id) {
    let a = await ytfps(id).then(playlist => {
        return playlist.videos.length
    }).catch(err => {
        throw err;
    });
    return a
}


module.exports.get_playlist_urls = get_playlist_urls
module.exports.get_playlist_count = get_playlist_count


