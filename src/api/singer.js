import jsonp from '../common/js/jsonp'
import { commonParams, options } from './config'
import axios from 'axios'

export function getSingerList() {
    const url = '/api/getSingers'
    const data = Object.assign({}, commonParams, {
        channel: 'singer',
        page: 'list',
        key: 'all_all_all',
        pagenum: 1,
        pagesize: 100,
        hostUin: 0,
        g_tk: 759984046,
        needNewCode: 0,
        platform: 'yqq'
    })
    return axios.get(url, { params: data })
        .then((res) => {
            return Promise.resolve(res.data)
        })
}

export function getSingerDetail(singerId) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
    const data = Object.assign({}, commonParams, {
        hostUin: 0,
        needNewCode: 0,
        platform: 'yqq',
        order: 'listen',
        begin: 0,
        num: 100,
        songstatus: 1,
        g_tk: 5381,
        singermid: singerId
    })
    return jsonp(url, data, options)
}