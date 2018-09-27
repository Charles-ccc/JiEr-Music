import { playMode } from '../common/js/config'

// 定义需要传递的原始数据
const state = {
    singer: {}, // 歌手
    playing: false, // 播放状态
    fullScreen: false, // 播放全屏
    playlist: [], // 播放列表
    sequenceList: [], //顺序播放列表
    mode: playMode.sequence,
    currentIndex: -1, // 当前播放索引
    disc: {}, // 推荐歌单
    topList: {} // 排行详情 

}

export default state