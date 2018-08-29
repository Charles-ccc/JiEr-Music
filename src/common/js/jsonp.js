import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
    //需要把url拼好再去调用库，query通过data来封装
    url += (url.indexOf('?')<0 ? '?' : '&') + param(data)

    return new Promise((resolve, reject) => {
        originJSONP(url, option, (err, data) => {
            if(!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}

//拼接url
function param(data) {
    let url = ''
    for(var k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        url += `&${k}=${encodeURIComponent(value)}`
    }
    return url ? url.substring(1) : ''
    // 由于是拼接，所以把第一个&符号删掉
}