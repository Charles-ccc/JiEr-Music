<template>
    <div class="player" v-show="playlist.length>0">
      <transition name="normal"
                  @enter="enter" 
                  @after-enter="afterEnter" 
                  @leave="leave"
                  @after-leave="afterLeave"
                  >
        <div class="normal-player" v-show="fullScreen">
          <div class="background">
            <img width="100%" height="100%" :src="currentSong.image">
          </div>
          <div class="top">
            <div class="back" @click="back">
              <i class="icon-back"></i>
            </div>
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" v-html="currentSong.singer"></h2>
          </div>
          <div class="middle" 
               @touchstart.prevent="middleTouchStart"
               @touchmove.prevent="middleTouchMove"
               @touchend.prevent="middleTouchEnd">
            <div class="middle-l" ref="middleL">
              <div class="cd-wrapper" ref="cdWrapper">
                <div class="cd" :class="cdCls">
                  <img class="image" :src="currentSong.image">
                </div>
              </div>
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">{{playingLyric}}</div>
              </div>
            </div>
            <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p ref="lyricLine" 
                     class="text"
                     :class="{'current':currentLineNum === index}"
                     v-for="(line, index) in currentLyric.lines" 
                     :key="index">
                     {{line.txt}}
                  </p>
                </div>
              </div>
            </scroll>
          </div>
          <div class="bottom">
            <div class="dot-wrapper">
              <span class="dot" :class="{'active' : currentShow === 'cd'}"></span>
              <span class="dot" :class="{'active' : currentShow === 'lyric'}"></span>
            </div>
            <div class="progress-wrapper">
              <span class="time time-l">{{format(currentTime)}}</span>
              <div class="progress-bar-wrapper">
                <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
              </div>
              <span class="time time-r">{{format(currentSong.duration)}}</span>
            </div>
            <div class="operators">
              <div class="icon i-left" @click="changeMode">
                <i :class="iconMode"></i>
              </div>
              <div class="icon i-left">
                <i @click="prev" class="icon-prev" :class="disableCls"></i>
              </div>
              <div class="icon i-center" :class="disableCls">
                <i @click="togglePlaying" :class="playIcon"></i>
              </div>
              <div class="icon i-right">
                <i @click="next" class="icon-next"></i>
              </div>
              <div class="icon i-right">
                <i class="icon icon-not-favorite"></i>
              </div>
            </div>
          </div>
        </div>
      </transition>
        
      <transition name="mini">
        <div class="mini-player" v-show="!fullScreen" @click="open">
          <div class="icon" :class="cdCls">
            <img width="40" height="40" :src="currentSong.image">
          </div>
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <div class="control">
            <progress-circle :radius="radius" :percent="percent">
              <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
            </progress-circle>
          </div>
          <div class="control">
            <i class="icon-playlist"></i>
          </div>
        </div>
      </transition>
      <audio ref="audio" 
            :src="currentSong.url" 
            @canplay="ready" 
            @error="error" 
            @timeupdate="updateTime"
            @ended="end"></audio>
      <!-- oncanplay  onerror  ontimeupdate ended是audio标签本身的事件属性-->
    </div>
</template>

<script>
    import {mapGetters, mapMutations} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefixStyle} from '../../common/js/dom'
    import ProgressBar from "../../base/progress-bar/progress-bar"
    import ProgressCircle from "../../base/progress-circle/progress-circle"
    import {playMode} from "../../common/js/config"
    import {shuffle} from "../../common/js/util"
    import Lyric from 'lyric-parser'
    import Scroll from '../../base/scroll/scroll'
    const transform = prefixStyle('transform')
    const transitionDuration = prefixStyle('transitionDuration')
    export default {
      data() {
        return {
          songReady: false,
          currentTime: 0,
          radius: 32,
          currentLyric: null,
          currentLineNum:0,
          currentShow: 'cd',
          playingLyric: ''
        }
      },
      components: {
        ProgressBar,
        ProgressCircle,
        Scroll
      },
      created() {
        this.touch = {}
      },
      computed: {
        playIcon() {
          return this.playing ? 'icon-pause' : 'icon-play'
        },
        miniIcon() {
          return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
        },
        cdCls() {
          return this.playing ? 'play' : 'play pause'
        },
        iconMode() {
          // 判断是哪一种播放模式
          return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        },
        ...mapGetters([
          // 从state中获取当前状态和数据
            'fullScreen',
            'playlist',
            'currentSong',
            'playing',
            'currentIndex',
            'mode',
            'sequenceList'

        ]),
        // 为加载完成时，不允许点击
        disableCls() {
          return this.songReady ? '' : 'disable'
        },
        percent() {
          // 获取歌曲播放时间和歌曲总时长的比例
          return this.currentTime / this.currentSong.duration
        }
      },
      watch: {
        currentSong(newSong, oldSong) {
          if(newSong.id === oldSong.id) {
            // 为了解决暂停状态切换播放列表，歌曲自动播放
            return
          }
          if(this.currentLyric) {
            this.currentLyric.stop()
          }
          setTimeout(() => { // 将$nextTick 替换为setTimeout 为了避免后台切换到前台后不播放的问题
            this.$refs.audio.play()
            this.getLyric()
          }, 1000)
        },
        playing(newPlaying) {
          const audio = this.$refs.audio
          this.$nextTick(() => {
            newPlaying ? audio.play() : audio.pause()
          })
        },
      },
      methods: {
        ...mapMutations({
          // 修改vuex的状态和数据
          setFullScreen: 'SET_FULL_SCREEN',
          setPlayingState: 'SET_PLAYING_STATE',
          setCurrentIndex: 'SET_CURRENT_INDEX',
          setPlayMode: 'SET_PLAY_MODE',
          setPlayList: 'SET_PLAYLIST'
        }),
        back() {
          this.setFullScreen(false)
        },
        open() {
          this.setFullScreen(true)
        },
        // javascript动画钩子
        enter(el, done) {
          const {x,y,scale} = this._getPosAndScale()
          let animation = {
            0: {
              transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
            },
            60: {
              transform: `translate3d(0,0,0) scale(1.1)` 
            },
            100: {
              transform: `translate3d(0,0,0) scale(1)`
            }
          }

          // create-keyframe-animation 库
          animations.registerAnimation({
            name: 'move', // 动画名称
            animation,
            presets: {
              duration: 400,
              easing: 'linear'
            }
          })
          animations.runAnimation(this.$refs.cdWrapper, 'move', done)
        },
        afterEnter() {
          animations.unregisterAnimation('move')
          this.$refs.cdWrapper.style.animation = ''
        },
        leave(el, done) {
          this.$refs.cdWrapper.style.transition = 'all 0.4s'
          const {x,y,scale} = this._getPosAndScale()
          this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
          this.$refs.cdWrapper.addEventListener('transitionend', done)
        },
        afterLeave() {
          this.$refs.cdWrapper.style.transition = ''
          this.$refs.cdWrapper.style[transform] = ''
        },
          // 获取音乐图片位置
        _getPosAndScale() {
          // mini图标的宽度 以及 中心点位置
          const targetWidth = 40 
          const paddingLeft = 40
          const paddingBottom = 30
          // normal图标的宽度 以及 中心点位置
          const paddingTop = 80
          const width = window.innerWidth * 0.8
          // 初始缩放比例
          const scale = targetWidth / width
          const x = -(window.innerWidth / 2 - paddingLeft)
          const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
          return  {
            x,
            y,
            scale
          }
        },
        // 控制播放
        togglePlaying() {
          if (!this.songReady) {
            return
          }
          if(this.currentLyric) {
            this.currentLyric.togglePlay()
          }
          this.setPlayingState(!this.playing)
        },
        prev() {
          // 当歌曲还没准备完成时不允许点
          if(!this.songReady) {
            return
          }
          if(this.playlist.length === 1) { // 处理播放列表长度为1的情况
            this.loop()
          }else {
            let index = this.currentIndex - 1
            if(index === -1) {
              index = this.playlist.length -1
            }
            this.setCurrentIndex(index)
            // 当暂停之后切换再播放，播放icon要同步
            if(!this.playing) {
              this.togglePlaying()
            }
          }
          this.songReady = false
        },
        next() {
          if(!this.songReady) {
            return
          }
          if(this.playlist.length === 1) {
            this.loop()
          }else {
            let index = this.currentIndex + 1
            if(index === this.playlist.length) {
              index = 0
            }
            this.setCurrentIndex(index)
            if(!this.playing) {
              this.togglePlaying()
            }
          }
          this.songReady = false
        },
        end() {
          // 判断按哪种模式播放，播放结束后调用不同方法
          if(this.mode === playMode.loop) {
            this.loop()
          } else {
            this.next()
          }
        },
        loop() {
          this.$refs.audio.currentTime = 0
          this.$refs.audio.play()
          if(this.currentLyric) {
            this.currentLyric.seek() // 歌词回到初始化
          }
        },
        ready() {
          this.songReady = true
        },
        error() {
          this.songReady = true
        },
        updateTime(e) {
          // 将audio标签表示当前播放时间的currentTime属性（可读写）赋值给data中的currentTime
          this.currentTime = e.target.currentTime
        },
        format(interval) {
          // 将currentTime的时间戳格式改为分秒格式
          interval = interval | 0    // (| 0) 表示向下取整，相当于调用Math.floor
          const minute = interval / 60 | 0
          const second = this._pad(interval % 60)
          return `${minute}:${second}`
        },
        // 给时间的秒补零
        _pad(num, n=2) {
          let len = num.toString().length
          while(len < n) {
            num  = '0' + num
            len ++
          }
          return num
        },
        // 拖动进度条
        onProgressBarChange(percent) {
          const currentTime = this.currentSong.duration * percent
          this.$refs.audio.currentTime = currentTime
          // 拖动后播放
          if(!this.playing) {
            this.togglePlaying()
          }
          if(this.currentLyric) {
            this.currentLyric.seek(currentTime * 1000)
          }
        },
        // 改变播放模式
        changeMode() {
          const mode = (this.mode + 1) % 3
          // 利用类似函数调用的方式改变state里的mode
          this.setPlayMode(mode)

          let list = null
          if(mode === playMode.random) {
            list = shuffle(this.sequenceList)
          } else {
            list = this.sequenceList
          }
          this.resetCurrentIndex(list)
          this.setPlayList(list)
        },
        resetCurrentIndex(list) {
        // 当播放模式发生改变时，重置currentIndex,不改变当前的currentSong
          let index = list.findIndex((item) => {
            return item.id === this.currentSong.id
          })
          // 拿到当前播放歌曲的索引，然后传递给vuex
          this.setCurrentIndex(index)
        },
        getLyric() {
          this.currentSong.getLyric().then((lyric) => {
            this.currentLyric = new Lyric(lyric, this.handleLyric)
              if(this.playing) {
                this.currentLyric.play() // lyric-parser插件的api方法
              }
              // console.log(this.currentLyric.lines)
          }).catch(() => {
            this.currentLyric = null
            this.playingLyric = ''
            this.currentLineNum = 0
          })
        },
        // 当每一行歌词发生改变的时候，进行回调
        handleLyric({lineNum, txt}) {
          this.currentLineNum = lineNum
          if(lineNum > 5) {
            let lineEl = this.$refs.lyricLine[lineNum - 5]
            this.$refs.lyricList.scrollToElement(lineEl, 1000)
          } else {
            this.$refs.lyricList.scrollTo(0,0,1000)
          }
          this.playingLyric = txt // 展示当前播放的歌词
        },
        middleTouchStart(e) {
          this.touch.initiated = true // 表示初始化
          const touch = e.touches[0] // 第一次触碰的位置
          this.touch.startX = touch.pageX
          this.touch.startY = touch.pageY
        },
        middleTouchMove(e) {
          if(!this.touch.initiated) {
            return
          }
          const touch = e.touches[0]
          const deltaX = touch.pageX - this.touch.startX // 滑动的距离
          const deltaY = touch.pageY - this.touch.startY
          if(Math.abs(deltaY) > Math.abs(deltaX)) {
            // 纵轴偏移大于横轴偏移，就不处理。
            return
          }
          const left = this.currentShow === 'cd' ? 0 : -window.innerWidth // 歌词模块停留的位置
          const offsetWidth = Math.min(0,Math.max(-window.innerWidth, left + deltaX)) // 歌词模块宽度 最小为0，最大为屏幕宽度
          this.touch.percent = Math.abs(offsetWidth/window.innerWidth)
          this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
          this.$refs.lyricList.$el.style[transitionDuration] = 0
          this.$refs.middleL.style.opacity = 1 - this.touch.percent
          this.$refs.middleL.style[transitionDuration] = 0
        },
        middleTouchEnd() {
          let offsetWidth
          let opacity
          // 从右往左滑
          if(this.currentShow === 'cd') {
            // 如果偏移10%，就做处理
            if(this.touch.percent > 0.1) {
              offsetWidth = -window.innerWidth
              opacity = 0
              this.currentShow = 'lyric'
            } else {
              offsetWidth = 0
              opacity = 1
            }
          } else {
            // 从左往右滑
            if(this.touch.percent < 0.9) {
              offsetWidth = 0
              opacity = 1
              this.currentShow = 'cd'
            } else {
               offsetWidth = -window.innerWidth
               opacity = 0
            }
          }
          const time = 300
          this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
          this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
          this.$refs.middleL.style.opacity = opacity
          this.$refs.middleL.style[transitionDuration] = `${time}ms`
        }
      }
    }
</script>

<style lang="stylus" scoped>
    @import "../../common/stylus/variable"
    @import "../../common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
