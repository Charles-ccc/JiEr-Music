<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>

<script>
import BScroll from 'better-scroll'
export default {
    props:{
        probeType: {
            type: Number,
            default: 1
            // 1 滚动的时候会派发scroll事件，会截流。2 滚动的时候实时派发scroll事件，不会截流。 3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
        },
        click: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array,
            default: null
        },
        listenScroll: {
            type: Boolean,
            default: false
        }
    },
    mounted() {
        setTimeout( () => {
            this._initSrcoll()
        }, 20)
    },
    //this.scroll 指向 better-scroll实例
    methods: {
        _initSrcoll() {
            if( !this.$refs.wrapper ) {
                return
            }
            this.scroll = new BScroll(this.$refs.wrapper, {
                probeType: this.probeType,
                click: this.click
            })

            if(this.listenScroll) {
                let me = this
                //监听scroll滚动事件
                this.scroll.on('scroll', (pos) => { 
                    // 派发事件
                    me.$emit('scroll', pos)
                })
            }
        },
        enable() {
            this.scroll && this.scroll.enable()
        },
        disable() {
            this.scroll && this.scroll.disable()
        },
        refresh() {
            this.scroll && this.scroll.refresh()
        },
        scrollTo() {
            this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments)
        },
        scrollToElement() {
            this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments)
        }
    },
    watch: {
        data() {
            setTimeout( () => {
                this.refresh()
            }, 20)
        }
    }
}
</script>
