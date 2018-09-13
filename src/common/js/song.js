import { getLyric } from '../../api/song'
import { ERR_OK } from '../../api/config'
import { Base64 } from 'js-base64'

export default class Song {
    constructor({ id, mid, singer, name, album, duration, image, url }) {
        this.id = id
        this.mid = mid
        this.singer = singer
        this.name = name
        this.album = album
        this.duration = duration
        this.image = image
        this.url = url
    }
    getLyric() {
        // 如果Song类中已经有lyric
        if (this.lyric) {
            // Promise.resolve(value)方法返回一个以给定值解析后的Promise对象
            return Promise.resolve(this.lyric)
        }
        return new Promise((resolve, reject) => {
            getLyric(this.mid).then((res) => {
                if (res.retcode === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric)
                    resolve(this.lyric)
                } else {
                    reject('no lyric')
                }
            })
        })
    }
}

// QQ音乐的多个musicData的数据结构是一样的，所以可以创建工厂方法来抽象
// 经过抓取QQ音乐的歌曲，发现url中还有vkey,guid这样的参数，所以在webpack.dev.cong.js中
// 进行了代理请求，方法写在singer.js中
export function createSong(musicData, songVKey) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        url: `http://isure.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?vkey=${songVKey}&guid=1819638027&uin=0&fromtag=66`
    })
}

function filterSinger(singer) {
    let ret = []
    if (!singer) {
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join('/')
}