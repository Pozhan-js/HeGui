import Vue from 'vue'
import CustomerLink from '@/components/CustomerLink'

export default Vue.extend({
  components: {
    CustomerLink
  },
  props: {
    renderFn: {
      type: Function,
      required: true
    },
    fnParams: {
      type: Object,
      default: () => ({})
    }
  },
  render(h) {
    return this.renderFn(h, this.fnParams)
  }
})
