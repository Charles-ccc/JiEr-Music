<template>
  <div class="singer">
    <list-view :data="singers" @select="selectSinger"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import {getSingerList} from '../../api/singer'
import {ERR_OK} from '../../api/config'
import Singer from '../../common/js/singer'
import ListView from '../../base/listview/listview'
import {mapMutations} from 'vuex'

const HOT_NAME = "热门"
const HOT_SINGER_LEN = 10

export default {
  data() {
    return {
      singers: []
    }
  },
  components: {
    ListView
  },
  created() {
    this._getSingerList()
  },
  methods: {
    selectSinger(singer) {
      // 编程式动态路由
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      // setSinger 的实例 singer 是在 listview 中派发当前所点击的歌手数据
      // 然后将这个歌手的数据通过 ...mapMutations 传递到 mutation 然后保存在 state.singer
      this.setSinger(singer)
    },
    _getSingerList() {
      getSingerList().then((res) => {
        if(res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list).slice(1)
            // console.log(this.singers)
        }
      })
    },
    _normalizeSinger(singList) {
      let map = {
        //热门，歌手根据Fsinger_id来分类
        hotList: {
          title: HOT_NAME,
          items: []
        }
      }
      // 封装热门歌手列表数据
      singList.forEach((item, index) => {
        //将返回的前十条数据定义为热门数据
        if(index < HOT_SINGER_LEN) {
          map.hotList.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
            //通过common/singer.js封装即可省略avatar
            // avatar: 'https://y.gtimg.cn/music/photo_new/T001R150x150M000${item.Fsinger_mid}.jpg?max_age=2592000'
          }))
        }
        const key = item.Findex
        if(!map[key]){
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
          // avatar: 'https://y.gtimg.cn/music/photo_new/T001R150x150M000${item.Fsinger_mid}.jpg?max_age=2592000'
        }))
      })
      // console.log(map)
      
      //为了得到有序列表，处理 map
      let hot = []
      let ret = []
      for(let key in map) {
        let val = map[key]
        if(val.title.match(/[a-zA-Z]/)) {
          //console.log(val.title)
          ret.push(val)
        } else {
          hot.push(val)
        }
      }
      // 对ret里的数据做排序
      ret.sort((a,b) => {
        return a.title.charCodeAt(0)- b.title.charCodeAt(0)
      })
      //将 hot和ret合并为返回一个数组
      return hot.concat(ret)
    },
    // 对mutation的对象做映射， 整个对象都作为payload传给mutation函数，所以handler保持不变
    // 避免使用 this.$store.commit('xxx')
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  }
}
</script>

<style lang="stylus" scoped>
  .singer
    position fixed
    top 88px
    bottom 0
    width 100%
</style>
