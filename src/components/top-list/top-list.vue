<template>
    <transition name="slide">
        <music-list :rank="rank" :title="title" :bgImage="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script>
    import MusicList from "../../components/music-list/music-list"
    import {mapGetters} from 'vuex'
    import {getMusicList} from "../../api/rank"
    import {ERR_OK} from "../../api/config"
    import {createSong} from "../../common/js/song"
    import {getMusicDetail} from '../../api/singer'
    export default {
        data() {
            return {
                songs: [],
                rank: true
            }
        },
        components: {
            MusicList
        },
        created () {
            this._getMusicList()
        },
        methods: {
            _getMusicList() {
                if(!this.topList.id) {
                    this.$router.push('/rank')
                    return
                }
                getMusicList(this.topList.id).then((res) => {
                    if(res.code === ERR_OK) {
                        this.songs = this._normalizeSongs(res.songlist)
                    }
                })
            },
            _normalizeSongs(list) {
                let ret =[]
                list.forEach((item) => {
                    const musicData = item.data
                    if(musicData.songid && musicData.albumid) {
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
        },
        computed: {
            title() {
                return this.topList.topTitle
            },
            bgImage() {
                if(this.songs.length) {
                    return this.songs[0].image
                }
                return ''
            },
            ...mapGetters ([
                'topList'
            ]),
        }
    }
</script>

<style lang="stylus" scoped>
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s ease
    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>
