<template>
    <transition name="slide">
        <music-list :songs="songs" :bg-image="bgImage" :title="title"></music-list>
    </transition>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail, getMusicDetail} from '../../api/singer'
import {ERR_OK} from '../../api/config'
import {createSong} from '../../common/js/song'
import MusicList from '../music-list/music-list'
export default {
    data() {
        return {
            songs: []
        }
    },
    components: {
        MusicList
    },
    computed: {
        title() {
            return this.singer.name
        },
        bgImage() {
            return this.singer.avatar
        },
        ...mapGetters([
            'singer' // 对应到store/getters的singer
        ])
    },
    created () {
        // console.log(this.singer)
        this._getDetail()
    },
    methods: {
        _getDetail() {
            // 边界处理，当在歌手详情刷新的时候，vux中没有set singe.id，所以就拿不到对应的数据
            if(!this.singer.id) {
                this.$router.push("/singer")
            }
            getSingerDetail(this.singer.id)
            .then((res) => {
                if (res.code === ERR_OK) {
                    this.songs = this._normalizeSongs(res.data.list)
                    // console.log(this.songs)
                }
            })
        },
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                let {musicData} = item //对象的解构赋值，拿到item里的musicData
                // songid 和 albummid 必传，所以先行判断
                if(musicData.songid && musicData.albummid) {
                    getMusicDetail(musicData.songmid)
                    .then((res) => {
                        if(res.code === ERR_OK) {
                            const svkey = res.data.items
                            const songVKey = svkey[0].vkey
                            const newSong = createSong(musicData, songVKey)
                            ret.push(newSong)
                        }
                    })
                }
            })
            return ret
        }
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/variable"
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s
    .slide-enter, .slide-leave
        transform: translate3d(100%, 0, 0)
</style>
