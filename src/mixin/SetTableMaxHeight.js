import { appMainPadding} from '@/assets/styles/variables.scss'
function debounce(fn, time) {
  let timer = null
  clearTimeout(timer);
  timer = setTimeout(fn, time)
}
export default {
  props: {
    hasMaxHeight: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      maxHeight: 'auto'
    }
  },
  beforeMount() {
    if (this.hasMaxHeight) window.addEventListener('resize', this.$_resetTableMaxHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.$_resetTableMaxHeight)
  },
  mounted() {
    if (this.hasMaxHeight) {
      this.$nextTick(() => {
        this.setTableMaxHeight()
      })
    }
    
  },
  methods: {
    $_resetTableMaxHeight() {
      debounce(this.setTableMaxHeight, 300)
    },
    setTableMaxHeight() {
      const windowHeight = window.innerHeight //页面窗口内部高度
      const appMainOffsetTop = document.querySelector('.app-main').offsetTop //头部高度
      const tabBarHeight = document.querySelector('.tabContainer')?.getBoundingClientRect().height // tab导航
      // fixed bug  固定 60px 做为底部导航高度 ；appMainPadding为.app-main元素内边距
      this.maxHeight = windowHeight - appMainOffsetTop - parseInt(appMainPadding) * 2 - 60 - (tabBarHeight >> 0)
    },
  }
}