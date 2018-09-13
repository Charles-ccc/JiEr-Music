// 一般进行异步操作或者对 mutation 操作的封装
import * as types from './mutation-types'
import { playMode } from '../common/js/config'
import { shuffle } from '../common/js/util'

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

export const selectPlay = function({ commit, state }, { list, index }) {
    commit(types.SET_SEQUENCE_LIST, list)
        // 根据state取当前的mode
    if (state.mode === playMode.random) {
        // 如果是随机播放，就打乱播放列表
        let randomlist = shuffle(list)
        commit(types.SET_PLAYLIST, randomlist)
            // 找到顺序列表的index对应到随机列表的index并返回
        index = findIndex(randomlist, list[index])
    } else {
        commit(types.SET_PLAYLIST, list)
    }

    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function({ commit }, { list }) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomlist = shuffle(list)
    commit(types.SET_PLAYLIST, randomlist)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}