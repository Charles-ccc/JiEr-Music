<template>
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup">
            <slot></slot>
        </div>
        <div class="dots">
            <span class="dot" :class="{active:currentPageIndex === index}" v-for="(item, index) in dots" :key="index"></span>
        </div>
    </div>
</template>

<script>
import BScroll from 'better-scroll'
import {addClass} from '../../common/js/dom'
export default {
    name: "slider",
    data() {
        return {
            dots: [],
            currentPageIndex: 0
        }
    },
    props: {
        loop: {
            type: Boolean,
            default: true
        },
        autoPlay: {
            type: Boolean,
            default: true
        },
        interval: {
            type: Number,
            default: 3000
        }
    },
    mounted() {
        //设置定时器，以保证dom成功渲染，浏览器刷新是17ms一次
        setTimeout(() => {
            this._setSliderWidth()
            this._initDots()
            this._initSlider()
            if(this.autoPlay){
                this._play()
            }
        }, 20)

        window.addEventListener('resize', () => {
            if(this.slider) {
                this._setSliderWidth(true)
                this.slider.refresh()
            }
        })
    },
    methods: {
        //计算并设置slider的宽度
        _setSliderWidth(isResize) {
            this.children = this.$refs.sliderGroup.children
            let totalWidth = 0
            let sliderWidth = this.$refs.slider.clientWidth
            for(let i=0; i<this.children.length; i++) {
                let child = this.children[i]
                // 为每个slider元素都添加一个slider-item 的className
                addClass(child, 'slider-item')
                // 每个child 的宽度等于父容器的宽度
                child.style.width = sliderWidth + 'px'
                // slider-group 的totalWidth
                totalWidth += sliderWidth
            }
            if(this.loop && !isResize) {
                totalWidth += 2 * sliderWidth
            }
            this.$refs.sliderGroup.style.width = totalWidth + 'px'
        },
        _initDots() {
            this.dots = new Array(this.children.length)
        },
        //初始化宽度
        _initSlider() {
            this.slider = new BScroll(this.$refs.slider, {
                scrollX: true,
                scrollY: false,
                momentum: false,
                snap: {
                    loop:true,
                    snapLoop: this.loop,
                    snapThreshold: 0.3,
                    snapSpeed: 400
                }
            })
            //better-scroll 在滚动完毕时会派发一个 scrollEnd 事件
            this.slider.on('scrollEnd', () => {
                // 获得当前轮播图的索引页数
                let pageIndex = this.slider.getCurrentPage().pageX
                //高版本不需要下面
                // if(this.loop) {
                //     pageIndex -= 1
                // }
                // 更新圆点索引
                this.currentPageIndex = pageIndex

                if(this.autoPlay) {
                    clearTimeout(this.timer)
                    this._play()
                }
            })
        },
        _play() {
            let pageIndex = this.currentPageIndex + 1
            this.timer = setTimeout(() => {
                this.slider.next();
                // this.slider.goToPage(pageIndex, 0, 400)
                //better-scroll 自身方法，第一个参数为x方向，第二个为y方向，第三个为跳转间隔
            }, this.interval);
        }
    },
    destroyed() {
        clearTimeout(this.timer)
    }
}
</script>

<style lang="stylus" scoped>
@import "../../common/stylus/variable"

.slider
    min-height: 1px
    .slider-group
        position: relative
        overflow: hidden
        white-space: nowrap
        .slider-item
            float: left
            box-sizing: border-box
            overflow: hidden
            text-align: center
            a
                display: block
                width: 100%
                overflow: hidden
                text-decoration: none
            img
                display: block
                width: 100%
    .dots
        position: absolute
        right: 0
        left: 0
        bottom: 12px
        text-align: center
        font-size: 0
        .dot
            display: inline-block
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
                width: 20px
                border-radius: 5px
                background: $color-text-ll
</style>
