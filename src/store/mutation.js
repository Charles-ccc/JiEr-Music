// 定义一些对常量的操作，使用常量替代mutation事件类型
import * as types from './mutation-types'

const mutation = {
    // state 就是从state.js取的， singer 就是mutation的 payload(载荷)
    // 使用 ES2015 风格的计算属性命名功能来使用一个常量作为函数名
    [types.SET_SINGER](state, singer) {
        state.singer = singer
    }
}

export default mutation