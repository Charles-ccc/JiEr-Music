<template>
    <scroll class="listview" :data="data" ref="listview">
        <ul>
            <li v-for="(group, index) in data" :key="index" ref="listGroup" class="list-group">
                <h2 class="list-group-title">{{ group.title }}</h2>
                <ul>
                    <li v-for="(item, index) in group.items" :key="index" class="list-group-item">
                        <img class="avatar" v-lazy="item.avatar" alt="头像">
                        <span class="name">{{ item.name }}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li v-for="(item, index) in shortcutList" :key="index" :data-index="index" class="item">
                    {{item}}
                </li>
            </ul>
        </div>
    </scroll>
</template>

<script>
import Scroll from '../scroll/scroll'
import Loading from '../loading/loading'
import {getData} from '../../common/js/dom'
export default {
    name: 'listview',
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
        }
    },
    methods: {
        onShortcutTouchStart(e) {
            let anchorIndex = getData(e.target, 'index')
                this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex],0)
        },
        onShortcutTouchMove(e) {
            
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
