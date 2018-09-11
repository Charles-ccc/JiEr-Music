<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div class="progress-btn-wrapper"
                 ref="progressBtn"
                 @touchstart.prevent="progressTouchStart"
                 @touchmove.prevent="progressTouchMove"
                 @touchend.prevent="progressTouchEnd"
                 >
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import {prefixStyle} from '../../common/js/dom'

    const progrssBtnWidth = 16 //进度条小圆的宽度
    export default {
        props: {
            percent: {
                type: Number,
                default: 0
            }
        },
        watch: {
            percent(newPercent) {
                // !this.touch.initiated 判断是否在拖动中
                if(newPercent >= 0 && !this.touch.initiated) { 
                    // 整个bar的宽度
                    const barWidth =  this.$refs.progressBar.clientWidth - progrssBtnWidth
                    // 小圆向右偏移的宽度
                    const offsetWidth = newPercent * barWidth
                    this._offset(offsetWidth)
                }
            }
        },
        created() {
            // 维护不同回调之间数据的通讯
            this.touch = {}
        },
        methods: {
            progressTouchStart(e) {
                this.touch.initiated = true // 标志位，表示初始化
                this.touch.startX = e.touches[0].pageX // 记录touch点击的位置，touches[0]表示第一个手指，pageX横坐标
                this.touch.left = this.$refs.progress.clientWidth // 记录点击小圆时已经偏移的位置
            },
            progressTouchMove(e) {
                if(!this.touch.initiated) {
                    return
                }
                const deltaX = e.touches[0].pageX - this.touch.startX // 手指移动的偏移量
                // 要小于progressBar的宽度，并且不能小于0
                const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progrssBtnWidth, Math.max(0,this.touch.left + deltaX))
                this._offset(offsetWidth)
            },
            progressTouchEnd() {
                this.touch.initiated = false
                this._triggerPercent()
            },
            _offset(offsetWidth) {
                // 进度条
                this.$refs.progress.style.width = `${offsetWidth}px`
                // 小圆
                this.$refs.progressBtn.style.transform = `translate3d(${offsetWidth}px, 0, 0)`
            },
            _triggerPercent() {
                const barWidth =  this.$refs.progressBar.clientWidth - progrssBtnWidth
                const percent = this.$refs.progress.clientWidth / barWidth
                this.$emit('percentChange', percent)
            },
            progressClick(e) {
                this._offset(e.offsetX)
                this._triggerPercent()
            }
        }
    }
</script>

<style lang="stylus" scoped>
    @import "../../common/stylus/variable"

.progress-bar
    height: 30px
    .bar-inner
        position: relative
        top: 13px
        height: 4px
        background: rgba(0, 0, 0, 0.3)
        .progress
            position: absolute
            height: 100%
            background: $color-theme
        .progress-btn-wrapper
            position: absolute
            left: -8px
            top: -13px
            width: 30px
            height: 30px
            .progress-btn
                position: relative
                top: 7px
                left: 7px
                box-sizing: border-box
                width: 16px
                height: 16px
                border: 3px solid $color-text
                border-radius: 50%
                background: $color-theme
</style>

