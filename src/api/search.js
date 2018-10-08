import jsonp from '../common/js/jsonp'
import { commonParams, options } from './config'

export function getHotKey() {
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        uin: 0,
        needNewCode: 1,
        notice: 0,
        g_tk: 5381
    })
    return jsonp(url, data, options)
}