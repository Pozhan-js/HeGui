import Vue from 'vue'


export default function useRows(api, rowKey = 'rows') {
  let instance
  instance = Vue.observable({
    rows: [],
    loading: false,
    async run(...arg) {
      instance.loading = true
      try {
        const result = await api(...arg)
        if (result.code === 200) {
          instance.rows = result[rowKey]
        }
      } finally {
        instance.loading = false
      }
    }
  })
  return instance;
}
