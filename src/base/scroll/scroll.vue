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
        },
        click: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array,
            default: null
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
