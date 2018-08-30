<template>
    <transition name="slide">
        <div class="singer-detail"></div>
    </transition>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail} from '../../api/singer'
import {ERR_OK} from '../../api/config'
import {createSong} from '../../common/js/song'
export default {
    data() {
        return {
            songs: []
        }
    },
    computed: {
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
                    console.log(this.songs)
                }
            })
        },
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                let {musicData} = item //对象的解构赋值，拿到item里的musicData
                if(musicData.songid && musicData.albummid) {
                    ret.push(createSong(musicData))
                }
            })
            return ret
        }
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/variable"

    .singer-detail
        position: fixed
        z-index: 100
        top: 0
        left: 0
        right: 0
        bottom: 0
        background: $color-background
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s
    .slide-enter, .slide-leave
        transform: translate3d(100%, 0, 0)
</style>
