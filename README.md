# vue-music

### 关于QQ音乐数据请求的方法

由于QQ音乐的限制，在请求歌单和歌手列表数据的时候，在请求头下的 referer 和 host 做了要求，所以在前端是没有办法实现的，只能在 `webpack.dev.conf.js` 中利用nodejs的 `devServer` 为其配置然后将 Url 地址和 Header 一起进行 `axios` 请求。

```javascript
// build/webpack.dev.conf.js
devServer: {
    // ...
    before(app){
        //获取推荐歌单
        app.get('/api/getDiscList', function(req, res) {
          const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg';
          axios.get(url, {
            headers: {
              referer: 'https://c.y.qq.com/',
              host: 'c.y.qq.com'
            },
            params: req.query
          }).then((response) => {
            res.json(response.data);
          }).catch((e) => {
            console.log(e);
          });
        });
        //获取歌手列表数据
        app.get('/api/getSingers', function(req, res) {
          const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg';
          axios.get(url, {
            headers: {
              referer: 'https://c.y.qq.com/',
              host: 'c.y.qq.com'
            },
            params: req.query
          }).then((response) => {
            res.json(response.data);
          }).catch((e) => {
            console.log(e);
          });
        })
    }
}
```

另外在查看QQ音乐请求头下的 `Query String Parameters` 的时候发现还有一些其他的参数需要一起发送过去，我们对其进行了一些封装
```javascript
// src/api/recommend.js
export function getDiscList() {
    const url = '/api/getDiscList'

    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        hostUin: 0,
        sin: 0,
        ein: 29,
        sortId: 5,
        needNewCode: 0,
        categoryId: 10000000,
        rnd: Math.random(),
        format: 'json'
    })
    
    return axios.get(url, {
        params: data
    }).then( res => {
        console.log(res.data);
        return Promise.resolve(res.data)
    })
}
```

这样拿到在 `webpack.dev.conf.js` 中请求后，暴露出来的一个接口，然后再加上这些参数，就可以顺利的发送请求啦。但是，到这里还没有结束。
众所周知，这个请求是跨域的，所以我们安装了一个 `jsonp` 的库，对jsonp方法进行了封装

```javascript
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
```
最后，在拼接Url的时候，发现还有一些参数是固定不变的，所以也进行了再一次的封装，然后统一在 `recommend.js` 中继续调用

```javascript
// src/api/config.js
export const commonParams = {
    g_tk: 1928093487,
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    format: 'jsonp'
}

export const options = {
    param: 'jsonpCallback'
}

export const ERR_OK = 0
```

vuex报错 `[vuex] Do not mutate vuex store state outside mutation handlers` 
可能问题出在了 actions.js 的 payload，在这的 list 是一个数组，是一个引用类型，所以就有可能在 vuex 之外的地方改变了 list。那么就有可能 this._committing 的值就不会变为 true， 所以就会报这个错。