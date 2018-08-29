<template>
    <scroll class="listview"
            :data="data"
            ref="listview" 
            :listenScroll="listenScroll"
            @scroll="scroll"
            :probeType="probeType"
    >
        <ul>
            <li v-for="(group, index) in data" :key="index" ref="listGroup" class="list-group">
                <h2 class="list-group-title">{{ group.title }}</h2>
                <ul>
                    <li v-for="(item, index) in group.items" @click="selectItem(item)" :key="index" class="list-group-item">
                        <img class="avatar" v-lazy="item.avatar" alt="头像">
                        <span class="name">{{ item.name }}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <!-- 给索引添加一个index -->
                <li v-for="(item, index) in shortcutList" 
                    :key="index" 
                    :data-index="index" 
                    class="item" 
                    :class="{'current': currentIndex===index}"
                >
                    {{item}}
                </li>
            </ul>
        </div>
        <div class="list-fixed" v-show="fixedTitle" ref="fixed">
            <h1 class="fixed-title">{{fixedTitle}}</h1>
        </div>
        <div v-show="!data.length" class="loading-container">
            <loading></loading>
        </div>
    </scroll>
</template>

<script>
import Scroll from '../scroll/scroll'
import Loading from '../loading/loading'
import {getData} from '../../common/js/dom'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
    name: 'listview',
    created() {
        this.touch = {}
        this.listenScroll = true
        this.listHeight = []
        this.probeType = 3
    },
    data() {
        return {
            //观测实时滚动的位置
            scrollY: -1,
            //高亮
            currentIndex: 0,
            // 列表title和固定title的差值
            diff: -1
        }
    },
    props: {
        data: {
            type:Array,
            default: []
        }
    },
    components: {
        Scroll,
        Loading
    },
    computed: {
        shortcutList() {
            //console.log(this.data)
            return this.data.map((group) => {
                //substr(start,length) 在字符串中抽取从 start 下标开始的指定数目的字符
                return group.title.substr(0,1)
            })
        },
        fixedTitle() {
            if(this.scrollY > 0){
                return ''
            }
            return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
        }
    },
    methods: {
        selectItem(item) {
            this.$emit('select', item)
        },
        onShortcutTouchStart(e) {
            //getData()在dom.js中，进行了封装
            let anchorIndex = getData(e.target, 'index')
            // 获取手指触碰的位置
            let firstTouch = e.touches[0]
            this.touch.y1 = firstTouch.pageY
            // 记录当前点击的是第几个索引
            this.touch.anchorIndex = anchorIndex
            // scrollToElement()在scroll.vue中进行了处理
            // this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex],0)
            this._scrollTo(anchorIndex)
        },
        onShortcutTouchMove(e) {
            let firstTouch = e.touches[0]
            this.touch.y2 = firstTouch.pageY
            // 记录滑动了几个锚点
            let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
            let anchorIndex = parseInt(this.touch.anchorIndex) + delta
            this._scrollTo(anchorIndex)
        },
        scroll(pos) {
            this.scrollY = pos.y
        },
        _scrollTo(index) {
            // 对边界进行处理
            if(!index && index !==0) {
                return
            }
            if(index < 0){
                index =0
            }else if(index > this.listHeight -2){
                index = this.listHeight -2
            }
            this.scrollY = -this.listHeight[index]
            //scrollToElement() 第二个参数规定是否需要动画
            this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
        },
        //计算每个group的高度
        _calculateHeight() {
            this.listHeight = []
            const list = this.$refs.listGroup
            let height = 0
            this.listHeight.push(height)
            for(var i = 0; i < list.length; i++) {
                let item = list[i]
                height += item.clientHeight
                this.listHeight.push(height)
            }
        }
    },
    watch: {
        // 检测data变化
        data() {
            //延时做兼容性
            setTimeout( () => {
                this._calculateHeight()
            }, 20)
        },
        scrollY(newY) {
            const listHeight = this.listHeight
            // 当滚动的顶部，newY>0
            if(newY > 0) {
                this.currentIndex = 0
                return
            }
            // 在中间部分滚动
            for(let i = 0; i<listHeight.length; i++){
                let height1 = listHeight[i]
                let height2 = listHeight[i + 1]
                if(-newY >= height1 && -newY < height2){
                    this.currentIndex = i
                    this.diff = height2 + newY
                    return
                }
            }
            // 当滚动到底部，且-newY大于最后一个元素的上限
            this.currentIndex = listHeight.length - 2
        },
        diff(newVal) {
            let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal-TITLE_HEIGHT : 0
            if(this.fixedTop === fixedTop) {
                return
            }
            this.fixedTop = fixedTop
            this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
        }
    }
}
</script>

<style lang="stylus" scoped>
    @import '../../common/stylus/variable'
    .listview
        position relative
        width 100%
        height 100%
        overflow hidden 
        background $color-background
        .list-group
            padding-bottom: 30px
            .list-group-title
                height 30px
                line-height 30px
                padding-left 20px
                font-size $font-size-small
                color $color-text-l
                background $color-highlight-background
            .list-group-item
                display: flex
                align-items: center
                padding: 20px 0 0 30px
                .avatar
                    width: 50px
                    height: 50px
                    border-radius: 50%
                .name
                    margin-left: 20px
                    color: $color-text-l
                    font-size: $font-size-medium
        .list-shortcut
            position: absolute
            z-index: 30
            right: 0
            top: 50%
            transform: translateY(-50%)
            width: 20px
            padding: 20px 0
            border-radius: 10px
            text-align: center
            background: $color-background-d
            font-family: Helvetica
            .item
                padding: 3px
                line-height: 1
                color: $color-text-l
                font-size: $font-size-small
                &.current
                    color: $color-theme
        .list-fixed
            position: absolute
            top: 0
            left: 0
            width: 100%
            .fixed-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
//         .loading-container
//             position: absolute
//             width: 100%
//             top: 50%
//             transform: translateY(-50%)
</style>
