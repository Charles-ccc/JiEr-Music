// 定义一些对常量的操作，使用常量替代mutation事件类型
import * as types from './mutation-types'

const mutation = {
    // state 就是从state.js取的， singer 就是mutation的 payload(载荷)
    // 使用ES6的计算属性命名功能来使用一个常量作为函数名
    // 把修改的payload 也就是singer 赋值并修改state
    [types.SET_SINGER](state, singer) {
        state.singer = singer
    },
    [types.SET_PLAYING_STATE](state, flag) {
        state.playing = flag
    },
    [types.SET_FULL_SCREEN](state, flag) {
        state.fullScreen = flag
    },
    [types.SET_PLAYLIST](state, list) {
        // state.playlist = JSON.parse(JSON.stringify(list))
        state.playlist = Object.assign([], list)
            // state.playlist = list
    },
    [types.SET_SEQUENCE_LIST](state, list) {
        // state.sequenceList = JSON.parse(JSON.stringify(list))
        state.sequenceList = Object.assign([], list)
            // state.sequenceList = list
    },
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode
    },
    [types.SET_CURRENT_INDEX](state, index) {
        state.currentIndex = index
    },
    [types.SET_DISC](state, disc) {
        state.disc = disc
    }
}

export default mutation